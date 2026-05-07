/**
 * PCB Drill Path Optimizer
 *
 * Optimizes the order of drilling holes to minimize total travel distance.
 * Uses Nearest Neighbor construction + 2-opt local search improvement.
 * Groups holes by tool to minimize tool changes.
 */

const DrillOptimizer = (() => {

  /**
   * Calculate Euclidean distance between two points.
   */
  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate total path distance for a route.
   */
  function routeDistance(points, route, start) {
    let total = 0;
    let current = start || { x: 0, y: 0 };
    for (const idx of route) {
      total += dist(current, points[idx]);
      current = points[idx];
    }
    return total;
  }

  /**
   * Nearest Neighbor greedy TSP construction.
   * Always moves to the closest unvisited hole.
   * @param {Array<{x,y}>} points - hole coordinates
   * @param {{x,y}} start - starting position (default: origin)
   * @returns {number[]} - ordered indices
   */
  function nearestNeighbor(points, start) {
    const n = points.length;
    if (n === 0) return [];
    if (n === 1) return [0];

    const visited = new Array(n).fill(false);
    const route = [];
    let current = start || { x: 0, y: 0 };

    for (let step = 0; step < n; step++) {
      let bestDist = Infinity;
      let bestIdx = -1;

      for (let j = 0; j < n; j++) {
        if (!visited[j]) {
          const d = dist(current, points[j]);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
          }
        }
      }

      visited[bestIdx] = true;
      route.push(bestIdx);
      current = points[bestIdx];
    }

    return route;
  }

  /**
   * 2-opt local search improvement.
   * Repeatedly swaps two edges in the route if it reduces total distance.
   * @param {Array<{x,y}>} points - hole coordinates
   * @param {number[]} route - initial route (indices)
   * @param {number} maxIterations - max improvement passes (default 200)
   * @param {number} timeLimitMs - time limit in ms (default 5000)
   * @returns {number[]} - improved route
   */
  function twoOptImprove(points, route, maxIterations, timeLimitMs) {
    maxIterations = maxIterations || 200;
    timeLimitMs = timeLimitMs || 5000;

    const n = route.length;
    if (n < 4) return route.slice(); // Can't improve routes shorter than 4

    const improved = route.slice();
    const startTime = performance.now();
    let iterations = 0;

    // Pre-compute distance lookup for speed
    const distCache = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = dist(points[improved[i]], points[improved[j]]);
        distCache[i * n + j] = d;
        distCache[j * n + i] = d;
      }
    }

    let didImprove = true;
    while (didImprove && iterations < maxIterations) {
      didImprove = false;
      iterations++;

      if (performance.now() - startTime > timeLimitMs) break;

      for (let i = 1; i < n - 2; i++) {
        for (let j = i + 2; j < n; j++) {
          // Current edges: (i-1, i) and (j, j+1)
          // Proposed edges: (i-1, j) and (i, j+1)
          const a = improved[i - 1];
          const b = improved[i];
          const c = improved[j];
          const d = improved[j + 1 < n ? j + 1 : j];

          const currentDist = dist(points[a], points[b]) + dist(points[c], points[d]);
          const newDist = dist(points[a], points[c]) + dist(points[b], points[d]);

          if (newDist < currentDist - 1e-10) {
            // Reverse the segment between i and j
            const segment = improved.slice(i, j + 1);
            segment.reverse();
            for (let k = 0; k < segment.length; k++) {
              improved[i + k] = segment[k];
            }
            didImprove = true;
          }
        }
      }
    }

    return improved;
  }

  /**
   * Optimize drilling path for a complete drill project.
   * Groups holes by tool, optimizes each group independently,
   * then orders the tool groups to minimize inter-group travel.
   *
   * @param {Object} drillData - parsed Excellon data
   * @param {Object} options - { maxIterations: 200, timeLimitMs: 5000 }
   * @returns {Object} { orderedHoles, totalDistance, toolChanges, originalDistance, improvement, pathSegments }
   */
  function optimize(drillData, options) {
    options = options || {};
    const maxIter = options.maxIterations || 200;
    const timeLimit = options.timeLimitMs || 5000;

    // Group holes by tool
    const toolGroups = {};
    for (const hole of drillData.holes) {
      if (!toolGroups[hole.tool]) {
        toolGroups[hole.tool] = [];
      }
      toolGroups[hole.tool].push(hole);
    }

    const toolNumbers = Object.keys(toolGroups).map(Number).sort((a, b) => a - b);

    if (toolNumbers.length === 0) {
      return {
        orderedHoles: [],
        totalDistance: 0,
        toolChanges: 0,
        originalDistance: 0,
        improvement: 0,
        pathSegments: [],
        toolStats: []
      };
    }

    // Calculate original (unoptimized) distance for comparison
    const originalDistance = calculateOriginalDistance(drillData.holes);

    // Optimize each tool group
    const optimizedGroups = {};
    for (const toolNum of toolNumbers) {
      const holes = toolGroups[toolNum];
      const points = holes.map(h => ({ x: h.x, y: h.y }));

      // Nearest Neighbor from origin
      const nnRoute = nearestNeighbor(points, { x: 0, y: 0 });

      // 2-opt improvement
      const optRoute = twoOptImprove(points, nnRoute, maxIter, timeLimit);

      // Reorder holes according to optimized route
      optimizedGroups[toolNum] = optRoute.map(idx => holes[idx]);
    }

    // Order tool groups using nearest neighbor on group endpoints
    const groupOrder = orderToolGroups(optimizedGroups, toolNumbers);

    // Build final ordered hole list
    const orderedHoles = [];
    const toolChanges = [];
    let currentTool = null;

    for (const toolNum of groupOrder) {
      if (currentTool !== null && currentTool !== toolNum) {
        toolChanges.push({ from: currentTool, to: toolNum, index: orderedHoles.length });
      }
      currentTool = toolNum;
      for (const hole of optimizedGroups[toolNum]) {
        orderedHoles.push(hole);
      }
    }

    // Calculate optimized distance
    const totalDistance = calculatePathDistance(orderedHoles);

    // Build path segments for visualization
    const pathSegments = buildPathSegments(orderedHoles, toolChanges);

    // Per-tool statistics
    const toolStats = toolNumbers.map(tn => {
      const holes = optimizedGroups[tn];
      const toolDef = drillData.tools.find(t => t.number === tn);
      return {
        toolNumber: tn,
        diameter: toolDef ? toolDef.diameter : 0,
        hitCount: holes.length,
        subPathDistance: calculatePathDistance(holes)
      };
    });

    return {
      orderedHoles,
      totalDistance,
      toolChanges: toolChanges.length,
      originalDistance,
      improvement: originalDistance > 0 ? ((originalDistance - totalDistance) / originalDistance * 100) : 0,
      pathSegments,
      toolStats
    };
  }

  /**
   * Order tool groups to minimize inter-group travel distance.
   * Uses nearest-neighbor on the small TSP of group endpoints.
   */
  function orderToolGroups(groups, toolNumbers) {
    if (toolNumbers.length <= 1) return toolNumbers;

    // For each group, compute entry point (first hole) and exit point (last hole)
    const groupInfo = toolNumbers.map(tn => ({
      tool: tn,
      entry: groups[tn][0],
      exit: groups[tn][groups[tn].length - 1]
    }));

    // Try all permutations if few tools (<=7), otherwise use NN
    if (toolNumbers.length <= 7) {
      return bruteForceGroupOrder(groupInfo);
    }

    // Nearest neighbor on group entry points
    const visited = new Set();
    const order = [];
    let current = { x: 0, y: 0 };

    for (let step = 0; step < groupInfo.length; step++) {
      let bestDist = Infinity;
      let bestIdx = -1;

      for (let j = 0; j < groupInfo.length; j++) {
        if (!visited.has(j)) {
          const d = dist(current, groupInfo[j].entry);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
          }
        }
      }

      visited.add(bestIdx);
      order.push(groupInfo[bestIdx].tool);
      current = groupInfo[bestIdx].exit;
    }

    return order;
  }

  /**
   * Brute-force optimal ordering for small number of tool groups.
   */
  function bruteForceGroupOrder(groupInfo) {
    const n = groupInfo.length;
    let bestOrder = groupInfo.map(g => g.tool);
    let bestDist = Infinity;

    function permute(arr, start) {
      if (start === arr.length - 1) {
        let d = 0;
        let current = { x: 0, y: 0 };
        for (const idx of arr) {
          d += dist(current, groupInfo[idx].entry);
          current = groupInfo[idx].exit;
        }
        if (d < bestDist) {
          bestDist = d;
          bestOrder = arr.map(idx => groupInfo[idx].tool);
        }
        return;
      }
      for (let i = start; i < arr.length; i++) {
        [arr[start], arr[i]] = [arr[i], arr[start]];
        permute(arr, start + 1);
        [arr[start], arr[i]] = [arr[i], arr[start]];
      }
    }

    permute(groupInfo.map((_, i) => i), 0);
    return bestOrder;
  }

  /**
   * Calculate distance for holes in their original order.
   */
  function calculateOriginalDistance(holes) {
    let total = 0;
    let current = { x: 0, y: 0 };
    for (const hole of holes) {
      total += dist(current, hole);
      current = hole;
    }
    return total;
  }

  /**
   * Calculate distance for ordered holes.
   */
  function calculatePathDistance(holes) {
    return calculateOriginalDistance(holes);
  }

  /**
   * Build path segments for visualization.
   * Each segment: { from: {x,y}, to: {x,y}, type: 'rapid'|'drill'|'toolChange', tool }
   */
  function buildPathSegments(orderedHoles, toolChanges) {
    const segments = [];
    const changeIndices = new Set(toolChanges.map(tc => tc.index));
    let current = { x: 0, y: 0 };

    for (let i = 0; i < orderedHoles.length; i++) {
      const hole = orderedHoles[i];

      // Rapid move to hole position
      segments.push({
        from: { ...current },
        to: { x: hole.x, y: hole.y },
        type: changeIndices.has(i) ? 'toolChange' : 'rapid',
        tool: hole.tool
      });

      // Drill plunge (down and up - visualize as dot)
      segments.push({
        from: { x: hole.x, y: hole.y },
        to: { x: hole.x, y: hole.y },
        type: 'drill',
        tool: hole.tool
      });

      current = { x: hole.x, y: hole.y };
    }

    return segments;
  }

  return {
    optimize,
    nearestNeighbor,
    twoOptImprove,
    routeDistance
  };
})();
