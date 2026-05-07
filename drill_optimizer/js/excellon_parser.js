/**
 * Excellon NC Drill File Parser
 *
 * Parses Excellon-format drill files used in PCB manufacturing.
 * Supports: metric/imperial units, leading/trailing zero suppression,
 * tool definitions (T01C0.8), drill hits (X/Y coordinates), slots (G85).
 *
 * State machine: INIT -> HEADER -> BODY
 */

const ExcellonParser = (() => {
  const State = { INIT: 0, HEADER: 1, BODY: 2 };

  function parse(text) {
    const lines = text.split(/\r?\n/);
    let state = State.INIT;

    const result = {
      tools: [],        // [{number, diameter, unit}]
      holes: [],        // [{x, y, tool}]
      units: 'metric',  // 'metric' or 'inch'
      formatTuple: null, // [integerDigits, decimalDigits] e.g. [3, 3]
      zeroSuppression: 'leading', // 'leading' or 'trailing'
      source: null,
      warnings: []
    };

    let activeTool = null;
    let pendingSlotStart = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (line === '') continue;

      // Comments: lines starting with ;
      if (line.startsWith(';')) {
        // Check for Altium FILE_FORMAT hint
        const fmtMatch = line.match(/FILE_FORMAT=(\d):(\d)/i);
        if (fmtMatch) {
          result.formatTuple = [parseInt(fmtMatch[1]), parseInt(fmtMatch[2])];
        }
        continue;
      }

      // M48 starts header
      if (line === 'M48' || line.startsWith('M48')) {
        state = State.HEADER;
        continue;
      }

      // M95 or % ends header
      if (line === 'M95' || line === '%') {
        state = State.BODY;
        continue;
      }

      // --- HEADER STATE ---
      if (state === State.HEADER) {
        // Unit and zero suppression
        const unitMatch = line.match(/^(INCH|METRIC)[,\s]*(TZ|LZ|LT|)?/i);
        if (unitMatch) {
          const unitStr = unitMatch[1].toUpperCase();
          result.units = unitStr === 'INCH' ? 'inch' : 'metric';
          const zs = (unitMatch[2] || '').toUpperCase();
          if (zs === 'TZ' || zs === 'LT') {
            result.zeroSuppression = 'trailing';
          } else if (zs === 'LZ') {
            result.zeroSuppression = 'leading';
          }
          continue;
        }

        // FMAT,2
        if (line.match(/^FMAT\s*,\s*2/i)) {
          continue;
        }

        // Tool definition: T01C0.8 or T1C0.031
        const toolMatch = line.match(/^T(\d+)C([\d.]+)/i);
        if (toolMatch) {
          result.tools.push({
            number: parseInt(toolMatch[1]),
            diameter: parseFloat(toolMatch[2]),
            unit: result.units
          });
          continue;
        }

        // Other header lines we skip
        continue;
      }

      // --- BODY STATE or INIT (some files have no header) ---
      if (state === State.INIT) {
        // Auto-detect: if we see coordinates, switch to body
        if (line.match(/^[XTG]/i)) {
          state = State.BODY;
        } else {
          continue;
        }
      }

      if (state === State.BODY) {
        // End of program
        if (line === 'M30') {
          break;
        }

        // G05 = drill mode (ignored, we're always in drill mode)
        if (line === 'G05') continue;

        // G00 = rapid move (no drill, just position)
        if (line.match(/^G00/i)) continue;

        // Tool selection: T01 (without C)
        const toolSelMatch = line.match(/^T(\d+)/i);
        if (toolSelMatch) {
          activeTool = parseInt(toolSelMatch[1]);
          // If tool not yet defined, add it
          if (!result.tools.find(t => t.number === activeTool)) {
            result.tools.push({ number: activeTool, diameter: 0, unit: result.units });
          }
          continue;
        }

        // Slot: G85X...Y...X...Y...
        const slotMatch = line.match(/^G85\s*(X[\d.-]+)?\s*(Y[\d.-]+)?\s*(X[\d.-]+)?\s*(Y[\d.-]+)?/i);
        if (slotMatch) {
          const x1 = slotMatch[1] ? parseCoord(slotMatch[1].substring(1), result) : null;
          const y1 = slotMatch[2] ? parseCoord(slotMatch[2].substring(1), result) : null;
          const x2 = slotMatch[3] ? parseCoord(slotMatch[3].substring(1), result) : null;
          const y2 = slotMatch[4] ? parseCoord(slotMatch[4].substring(1), result) : null;
          if (x1 !== null && y1 !== null && activeTool !== null) {
            result.holes.push({ x: x1, y: y1, tool: activeTool });
          }
          if (x2 !== null && y2 !== null && activeTool !== null) {
            result.holes.push({ x: x2, y: y2, tool: activeTool });
          }
          continue;
        }

        // Drill hit: X... Y... (possibly with coordinates on same line)
        const hitMatch = line.match(/^(X([\d.-]+))?\s*(Y([\d.-]+))?\s*(X([\d.-]+))?\s*(Y([\d.-]+))?/i);
        if (hitMatch && (hitMatch[1] || hitMatch[3])) {
          // First X/Y pair
          const x1 = hitMatch[2] ? parseCoord(hitMatch[2], result) : null;
          const y1 = hitMatch[4] ? parseCoord(hitMatch[4], result) : null;

          if (activeTool === null) {
            result.warnings.push(`Line ${i + 1}: No tool selected before coordinates`);
            continue;
          }

          if (x1 !== null || y1 !== null) {
            result.holes.push({
              x: x1 !== null ? x1 : (result.holes.length > 0 ? result.holes[result.holes.length - 1].x : 0),
              y: y1 !== null ? y1 : (result.holes.length > 0 ? result.holes[result.holes.length - 1].y : 0),
              tool: activeTool
            });
          }

          // Second X/Y pair on same line (e.g., X100Y200X300Y400)
          const x2 = hitMatch[6] ? parseCoord(hitMatch[6], result) : null;
          const y2 = hitMatch[8] ? parseCoord(hitMatch[8], result) : null;
          if (x2 !== null || y2 !== null) {
            result.holes.push({
              x: x2 !== null ? x2 : (result.holes.length > 0 ? result.holes[result.holes.length - 1].x : 0),
              y: y2 !== null ? y2 : (result.holes.length > 0 ? result.holes[result.holes.length - 1].y : 0),
              tool: activeTool
            });
          }
          continue;
        }
      }
    }

    // If no format tuple detected, try to auto-detect
    if (!result.formatTuple) {
      result.formatTuple = autoDetectFormat(result);
    }

    // Normalize all tool diameters to mm
    if (result.units === 'inch') {
      for (const tool of result.tools) {
        if (tool.unit === 'inch') {
          tool.diameter = tool.diameter * 25.4;
          tool.unit = 'metric';
        }
      }
    }

    // Remove tools with zero diameter that have no hits
    const usedTools = new Set(result.holes.map(h => h.tool));
    result.tools = result.tools.filter(t => t.diameter > 0 || usedTools.has(t.number));

    // Add hit counts
    for (const tool of result.tools) {
      tool.hitCount = result.holes.filter(h => h.tool === tool.number).length;
    }

    return result;
  }

  /**
   * Parse a coordinate string from Excellon file.
   * Excellon stores coordinates as integers without decimal point.
   * The decimal position is determined by format tuple and zero suppression.
   */
  function parseCoord(raw, result) {
    if (raw === '' || raw === undefined || raw === null) return null;

    // If the value contains a decimal point, it's already a real number
    if (raw.includes('.')) {
      const val = parseFloat(raw);
      return result.units === 'inch' ? val * 25.4 : val;
    }

    const ft = result.formatTuple || [3, 3];
    const totalDigits = ft[0] + ft[1];
    const isNeg = raw.startsWith('-');
    let digits = isNeg ? raw.substring(1) : raw;

    if (result.zeroSuppression === 'leading') {
      // Leading zeros omitted, pad left
      digits = digits.padStart(totalDigits, '0');
    } else {
      // Trailing zeros omitted, pad right
      digits = digits.padEnd(totalDigits, '0');
    }

    // Insert decimal point
    const intPart = digits.substring(0, ft[0]);
    const decPart = digits.substring(ft[0]);
    const value = parseFloat(intPart + '.' + decPart) * (isNeg ? -1 : 1);

    return result.units === 'inch' ? value * 25.4 : value;
  }

  /**
   * Auto-detect format tuple by trying common formats and checking
   * if resulting coordinates produce reasonable board dimensions.
   */
  function autoDetectFormat(result) {
    if (result.holes.length === 0) return [3, 3];

    const candidates = [[2, 4], [3, 3], [2, 5], [3, 4], [4, 2]];
    const suppressions = ['leading', 'trailing'];

    let bestFormat = [3, 3];
    let bestScore = -Infinity;

    for (const fmt of candidates) {
      for (const zs of suppressions) {
        const testResult = { ...result, formatTuple: fmt, zeroSuppression: zs };
        const coords = result.holes.map(h => ({
          x: parseCoord(String(Math.round(h.x / (result.units === 'inch' ? 25.4 : 1))), testResult),
          y: parseCoord(String(Math.round(h.y / (result.units === 'inch' ? 25.4 : 1))), testResult)
        }));

        // Check if dimensions are reasonable (5-500mm for a PCB)
        const xs = coords.map(c => c.x).filter(x => x !== null);
        const ys = coords.map(c => c.y).filter(y => y !== null);
        if (xs.length === 0 || ys.length === 0) continue;

        const width = Math.max(...xs) - Math.min(...xs);
        const height = Math.max(...ys) - Math.min(...ys);

        let score = 0;
        // Prefer dimensions in typical PCB range
        if (width >= 5 && width <= 500) score += 10;
        if (height >= 5 && height <= 500) score += 10;
        // Penalize very large or very small
        if (width > 10000 || height > 10000) score -= 50;
        if (width < 1 && height < 1) score -= 50;
        // Prefer (2,4) for imperial, (3,3) for metric as defaults
        if (result.units === 'inch' && fmt[0] === 2 && fmt[1] === 4) score += 2;
        if (result.units === 'metric' && fmt[0] === 3 && fmt[1] === 3) score += 2;

        if (score > bestScore) {
          bestScore = score;
          bestFormat = fmt;
          result.zeroSuppression = zs;
        }
      }
    }

    return bestFormat;
  }

  return { parse };
})();
