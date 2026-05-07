"""PCB Drill Path Optimizer.

Optimizes the order of drilling holes to minimize total travel distance.
Uses Nearest Neighbor construction + 2-opt local search improvement.
Groups holes by tool to minimize tool changes.
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field
from itertools import permutations

from excellon_parser import DrillHole, DrillProject, ToolDefinition


@dataclass
class OptimizationResult:
    ordered_holes: list[DrillHole]
    total_distance: float
    tool_changes: int
    original_distance: float
    improvement: float
    tool_stats: list[dict]


def _dist(a: DrillHole | tuple, b: DrillHole | tuple) -> float:
    if isinstance(a, DrillHole):
        ax, ay = a.x, a.y
    else:
        ax, ay = a
    if isinstance(b, DrillHole):
        bx, by = b.x, b.y
    else:
        bx, by = b
    return math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)


def _path_distance(holes: list[DrillHole]) -> float:
    total = 0.0
    current = (0.0, 0.0)
    for h in holes:
        total += _dist(current, h)
        current = (h.x, h.y)
    return total


def nearest_neighbor(points: list[tuple[float, float]], start: tuple[float, float] = (0, 0)) -> list[int]:
    """Greedy TSP: always move to the nearest unvisited point."""
    n = len(points)
    if n <= 1:
        return list(range(n))

    visited = [False] * n
    route = []
    current = start

    for _ in range(n):
        best_dist = float("inf")
        best_idx = -1
        for j in range(n):
            if not visited[j]:
                d = _dist(current, points[j])
                if d < best_dist:
                    best_dist = d
                    best_idx = j
        visited[best_idx] = True
        route.append(best_idx)
        current = points[best_idx]

    return route


def two_opt_improve(
    points: list[tuple[float, float]],
    route: list[int],
    max_iterations: int = 200,
    time_limit: float = 5.0,
) -> list[int]:
    """2-opt local search to improve a route."""
    n = len(route)
    if n < 4:
        return list(route)

    improved = list(route)
    start_time = time.monotonic()
    iterations = 0

    did_improve = True
    while did_improve and iterations < max_iterations:
        did_improve = False
        iterations += 1

        if time.monotonic() - start_time > time_limit:
            break

        for i in range(1, n - 2):
            for j in range(i + 2, n):
                a, b = improved[i - 1], improved[i]
                c, d = improved[j], improved[j + 1] if j + 1 < n else improved[j]

                current_d = _dist(points[a], points[b]) + _dist(points[c], points[d])
                new_d = _dist(points[a], points[c]) + _dist(points[b], points[d])

                if new_d < current_d - 1e-10:
                    improved[i : j + 1] = reversed(improved[i : j + 1])
                    did_improve = True

    return improved


def optimize(project: DrillProject, max_iterations: int = 200, time_limit: float = 5.0) -> OptimizationResult:
    """Optimize drilling path for a complete project."""
    if not project.holes:
        return OptimizationResult(
            ordered_holes=[], total_distance=0, tool_changes=0,
            original_distance=0, improvement=0, tool_stats=[],
        )

    original_distance = _path_distance(project.holes)

    # Group by tool
    tool_groups: dict[int, list[DrillHole]] = {}
    for hole in project.holes:
        tool_groups.setdefault(hole.tool, []).append(hole)

    tool_numbers = sorted(tool_groups.keys())

    # Optimize each group
    optimized_groups: dict[int, list[DrillHole]] = {}
    for tn in tool_numbers:
        holes = tool_groups[tn]
        points = [(h.x, h.y) for h in holes]
        nn_route = nearest_neighbor(points, (0, 0))
        opt_route = two_opt_improve(points, nn_route, max_iterations, time_limit)
        optimized_groups[tn] = [holes[i] for i in opt_route]

    # Order tool groups
    group_order = _order_groups(optimized_groups, tool_numbers)

    # Build final list
    ordered_holes: list[DrillHole] = []
    changes = 0
    current_tool = None
    for tn in group_order:
        if current_tool is not None and current_tool != tn:
            changes += 1
        current_tool = tn
        ordered_holes.extend(optimized_groups[tn])

    total_distance = _path_distance(ordered_holes)
    improvement = (original_distance - total_distance) / original_distance * 100 if original_distance > 0 else 0

    tool_stats = []
    for tn in tool_numbers:
        holes = optimized_groups[tn]
        td = project.tools.get(tn)
        tool_stats.append({
            "tool_number": tn,
            "diameter": td.diameter if td else 0,
            "hit_count": len(holes),
            "sub_path_distance": _path_distance(holes),
        })

    return OptimizationResult(
        ordered_holes=ordered_holes,
        total_distance=total_distance,
        tool_changes=changes,
        original_distance=original_distance,
        improvement=improvement,
        tool_stats=tool_stats,
    )


def _order_groups(groups: dict[int, list[DrillHole]], tool_numbers: list[int]) -> list[int]:
    """Order tool groups to minimize inter-group travel."""
    if len(tool_numbers) <= 1:
        return tool_numbers

    group_info = []
    for tn in tool_numbers:
        holes = groups[tn]
        group_info.append((tn, holes[0], holes[-1]))

    if len(tool_numbers) <= 7:
        best_order = tool_numbers
        best_dist = float("inf")
        for perm in permutations(range(len(group_info))):
            d = 0.0
            current = (0.0, 0.0)
            for idx in perm:
                entry = group_info[idx][1]
                d += _dist(current, entry)
                current = (group_info[idx][2].x, group_info[idx][2].y)
            if d < best_dist:
                best_dist = d
                best_order = [group_info[i][0] for i in perm]
        return best_order

    # NN for many tools
    visited = set()
    order = []
    current = (0.0, 0.0)
    for _ in group_info:
        best_d = float("inf")
        best_i = -1
        for j, (_, entry, _) in enumerate(group_info):
            if j not in visited:
                d = _dist(current, entry)
                if d < best_d:
                    best_d = d
                    best_i = j
        visited.add(best_i)
        order.append(group_info[best_i][0])
        current = (group_info[best_i][2].x, group_info[best_i][2].y)

    return order
