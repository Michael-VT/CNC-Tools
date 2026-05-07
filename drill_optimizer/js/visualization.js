/**
 * PCB Drill Path Visualization
 *
 * Canvas-based rendering of drill paths, holes, and animations.
 * Color coding: blue = rapid moves, red = drill hits, green = tool changes.
 * Supports static preview and step-by-step animation.
 */

const DrillVisualization = (() => {

  const COLORS = [
    '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
    '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
    '#dcbeff', '#9A6324', '#800000', '#aaffc3', '#808000'
  ];

  function getToolColor(toolNumber) {
    return COLORS[(toolNumber - 1) % COLORS.length];
  }

  /**
   * Calculate scale and offset to fit holes in canvas with padding.
   */
  function calculateTransform(holes, canvasWidth, canvasHeight, padding) {
    padding = padding || 40;
    if (holes.length === 0) {
      return { kx: 1, ky: 1, offsetX: 0, offsetY: 0, minX: 0, minY: 0 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const h of holes) {
      if (h.x < minX) minX = h.x;
      if (h.y < minY) minY = h.y;
      if (h.x > maxX) maxX = h.x;
      if (h.y > maxY) maxY = h.y;
    }

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const drawW = canvasWidth - padding * 2;
    const drawH = canvasHeight - padding * 2;
    const kx = drawW / rangeX;
    const ky = drawH / rangeY;
    const k = Math.min(kx, ky);

    const scaledW = rangeX * k;
    const scaledH = rangeY * k;
    const offsetX = padding + (drawW - scaledW) / 2;
    const offsetY = padding + (drawH - scaledH) / 2;

    return { k, offsetX, offsetY, minX, minY, rangeX, rangeY };
  }

  function toCanvas(point, transform, canvasHeight) {
    return {
      x: (point.x - transform.minX) * transform.k + transform.offsetX,
      y: canvasHeight - ((point.y - transform.minY) * transform.k + transform.offsetY)
    };
  }

  /**
   * Draw static drill path visualization.
   */
  function drawPath(canvas, holes, pathSegments, tools, options) {
    options = options || {};
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    if (holes.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No holes to display', w / 2, h / 2);
      return;
    }

    const transform = calculateTransform(holes, w, h, 50);

    // Draw grid
    drawGrid(ctx, w, h, transform);

    // Draw path segments
    if (pathSegments && pathSegments.length > 0) {
      for (const seg of pathSegments) {
        const from = toCanvas(seg.from, transform, h);
        const to = toCanvas(seg.to, transform, h);

        if (seg.type === 'rapid') {
          ctx.strokeStyle = 'rgba(66, 133, 244, 0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (seg.type === 'toolChange') {
          ctx.strokeStyle = 'rgba(52, 168, 83, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // Draw holes as circles sized by tool diameter
    const toolLookup = {};
    for (const t of tools) {
      toolLookup[t.number] = t;
    }

    for (const hole of holes) {
      const p = toCanvas(hole, transform, h);
      const tool = toolLookup[hole.tool];
      const radius = Math.max(2, (tool ? tool.diameter / 2 : 0.5) * transform.k);
      const color = getToolColor(hole.tool);

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color + '40'; // Semi-transparent fill
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Draw path order numbers if requested and holes are few enough
    if (options.showOrder && holes.length <= 200) {
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      for (let i = 0; i < holes.length; i++) {
        const p = toCanvas(holes[i], transform, h);
        ctx.fillStyle = '#333';
        ctx.fillText(String(i + 1), p.x, p.y - 5);
      }
    }

    // Draw legend
    drawLegend(ctx, w, h, tools);

    // Draw start point marker (origin)
    const origin = toCanvas({ x: 0, y: 0 }, transform, h);
    if (origin.x > 0 && origin.x < w && origin.y > 0 && origin.y < h) {
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText('Origin', origin.x + 8, origin.y + 4);
    }
  }

  /**
   * Draw a light grid on the canvas.
   */
  function drawGrid(ctx, w, h, transform) {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Horizontal lines
    for (let y = 0; y <= h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  /**
   * Draw tool legend in top-right corner.
   */
  function drawLegend(ctx, w, h, tools) {
    if (tools.length === 0) return;

    const lineHeight = 18;
    const legendW = 140;
    const legendH = tools.length * lineHeight + 10;
    const legendX = w - legendW - 10;
    const legendY = 10;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(legendX, legendY, legendW, legendH);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendW, legendH);

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < tools.length; i++) {
      const t = tools[i];
      const color = getToolColor(t.number);
      const y = legendY + 10 + i * lineHeight;

      // Color swatch
      ctx.fillStyle = color;
      ctx.fillRect(legendX + 8, y - 5, 10, 10);

      // Tool label
      ctx.fillStyle = '#333';
      ctx.fillText(`T${String(t.number).padStart(2, '0')} Ø${t.diameter.toFixed(2)}mm (${t.hitCount || '?'})`, legendX + 24, y);
    }
  }

  /**
   * Create an animation controller for step-by-step drill visualization.
   */
  function createAnimator(canvas, holes, pathSegments, tools) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const transform = calculateTransform(holes, w, h, 50);

    let currentStep = 0;
    let isPlaying = false;
    let animFrameId = null;
    let speedMs = 50; // delay between frames
    let lastFrameTime = 0;

    const toolLookup = {};
    for (const t of tools) {
      toolLookup[t.number] = t;
    }

    const drawnSegments = [];
    const drawnHoles = new Set();

    function drawFrame() {
      // Clear and redraw
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      drawGrid(ctx, w, h, transform);

      // Draw all completed segments
      for (const seg of drawnSegments) {
        drawSegment(seg);
      }

      // Draw all completed holes
      for (const idx of drawnHoles) {
        drawHole(holes[idx]);
      }

      // Draw legend
      drawLegend(ctx, w, h, tools);

      // Draw step counter
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Step: ${currentStep} / ${pathSegments.length}`, 10, h - 10);
    }

    function drawSegment(seg) {
      const from = toCanvas(seg.from, transform, h);
      const to = toCanvas(seg.to, transform, h);

      if (seg.type === 'rapid') {
        ctx.strokeStyle = 'rgba(66, 133, 244, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Arrow head
        drawArrow(ctx, from, to);
      } else if (seg.type === 'toolChange') {
        ctx.strokeStyle = '#34a853';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    function drawArrow(ctx, from, to) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 10) return;

      const nx = dx / len;
      const ny = dy / len;
      const arrowSize = 6;

      ctx.fillStyle = 'rgba(66, 133, 244, 0.7)';
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - arrowSize * nx + arrowSize * 0.5 * ny,
                 to.y - arrowSize * ny - arrowSize * 0.5 * nx);
      ctx.lineTo(to.x - arrowSize * nx - arrowSize * 0.5 * ny,
                 to.y - arrowSize * ny + arrowSize * 0.5 * nx);
      ctx.closePath();
      ctx.fill();
    }

    function drawHole(hole) {
      const p = toCanvas(hole, transform, h);
      const tool = toolLookup[hole.tool];
      const radius = Math.max(2, (tool ? tool.diameter / 2 : 0.5) * transform.k);
      const color = getToolColor(hole.tool);

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color + '40';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center dot (drilled)
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    function stepForward() {
      if (currentStep >= pathSegments.length) return;

      const seg = pathSegments[currentStep];
      drawnSegments.push(seg);

      // If this is a drill segment, mark the hole as drilled
      if (seg.type === 'drill') {
        const holeIdx = holes.findIndex(h => h.x === seg.from.x && h.y === seg.from.y);
        if (holeIdx >= 0) drawnHoles.add(holeIdx);
      }

      currentStep++;
      drawFrame();
    }

    function stepBackward() {
      if (currentStep <= 0) return;

      currentStep--;
      const seg = drawnSegments.pop();

      if (seg.type === 'drill') {
        const holeIdx = holes.findIndex(h => h.x === seg.from.x && h.y === seg.from.y);
        if (holeIdx >= 0) drawnHoles.delete(holeIdx);
      }

      drawFrame();
    }

    function animateLoop(timestamp) {
      if (!isPlaying) return;

      if (timestamp - lastFrameTime >= speedMs) {
        lastFrameTime = timestamp;
        stepForward();
      }

      if (currentStep < pathSegments.length) {
        animFrameId = requestAnimationFrame(animateLoop);
      } else {
        isPlaying = false;
      }
    }

    function play() {
      if (currentStep >= pathSegments.length) {
        reset();
      }
      isPlaying = true;
      lastFrameTime = performance.now();
      animFrameId = requestAnimationFrame(animateLoop);
    }

    function pause() {
      isPlaying = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }

    function reset() {
      pause();
      currentStep = 0;
      drawnSegments.length = 0;
      drawnHoles.clear();
      drawFrame();
    }

    function setSpeed(ms) {
      speedMs = ms;
    }

    function getState() {
      return {
        currentStep,
        totalSteps: pathSegments.length,
        isPlaying
      };
    }

    // Initial draw
    drawFrame();

    return {
      stepForward,
      stepBackward,
      play,
      pause,
      reset,
      setSpeed,
      getState,
      drawFrame
    };
  }

  /**
   * Draw a side-by-side comparison of original vs optimized paths.
   */
  function drawComparison(canvas, originalHoles, optimizedHoles, originalSegments, optimizedSegments, tools) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const halfW = Math.floor(w / 2) - 5;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Draw divider
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfW + 5, 0);
    ctx.lineTo(halfW + 5, h);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Original Path', halfW / 2, 20);
    ctx.fillText('Optimized Path', halfW + 5 + halfW / 2, 20);

    // Create temporary canvases for each half
    const leftCanvas = document.createElement('canvas');
    leftCanvas.width = halfW;
    leftCanvas.height = h - 30;
    drawPath(leftCanvas, originalHoles, originalSegments, tools);

    const rightCanvas = document.createElement('canvas');
    rightCanvas.width = halfW;
    rightCanvas.height = h - 30;
    drawPath(rightCanvas, optimizedHoles, optimizedSegments, tools);

    ctx.drawImage(leftCanvas, 0, 30);
    ctx.drawImage(rightCanvas, halfW + 10, 30);
  }

  return {
    drawPath,
    drawComparison,
    createAnimator,
    getToolColor,
    calculateTransform
  };
})();
