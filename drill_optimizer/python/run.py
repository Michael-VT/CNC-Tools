#!/usr/bin/env python3
"""CNC-Tools Drill Optimizer — CLI entry point.

Usage:
    python run.py input.drl -o output.nc
    python run.py input.drl --preview
    python run.py input.drl -o output.nc --feed 300 --plunge 80 --depth -1.8
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from excellon_parser import parse
from drill_optimizer import optimize
from gcode_generator import generate


def main() -> None:
    parser = argparse.ArgumentParser(description="CNC-Tools Drill Optimizer")
    parser.add_argument("input", help="Input Excellon drill file (.drl)")
    parser.add_argument("-o", "--output", help="Output G-code file (default: stdout)")
    parser.add_argument("--feed", type=float, default=400, help="Feed rate mm/min (default: 400)")
    parser.add_argument("--plunge", type=float, default=100, help="Plunge rate mm/min (default: 100)")
    parser.add_argument("--depth", type=float, default=-2.0, help="Drill depth mm (default: -2.0)")
    parser.add_argument("--safe", type=float, default=20.0, help="Safe height mm (default: 20)")
    parser.add_argument("--rpm", type=int, default=10000, help="Spindle speed RPM (default: 10000)")
    parser.add_argument("--iter", type=int, default=200, help="2-opt iterations (default: 200)")
    parser.add_argument("--time-limit", type=float, default=5.0, help="Optimization time limit seconds (default: 5)")
    parser.add_argument("--dwell", action="store_true", help="Add dwell at drill bottom")
    parser.add_argument("--preview", action="store_true", help="Show preview image (requires matplotlib)")
    parser.add_argument("--stats", action="store_true", help="Print statistics")

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    text = input_path.read_text(encoding="utf-8", errors="replace")
    project = parse(text, filename=str(input_path))

    if not project.holes:
        print("Error: no drill holes found in file", file=sys.stderr)
        sys.exit(1)

    print(f"Parsed: {len(project.holes)} holes, {len(project.tools)} tools", file=sys.stderr)

    result = optimize(project, max_iterations=args.iter, time_limit=args.time_limit)

    if args.stats:
        print(f"\nStatistics:", file=sys.stderr)
        print(f"  Original distance:  {result.original_distance:.2f} mm", file=sys.stderr)
        print(f"  Optimized distance: {result.total_distance:.2f} mm", file=sys.stderr)
        print(f"  Improvement:        {result.improvement:.1f}%", file=sys.stderr)
        print(f"  Tool changes:       {result.tool_changes}", file=sys.stderr)
        for ts in result.tool_stats:
            print(f"    T{ts['tool_number']:02d} Ø{ts['diameter']:.2f}mm: {ts['hit_count']} holes, {ts['sub_path_distance']:.1f}mm", file=sys.stderr)

    gcode = generate(
        result, project,
        feed_rate=args.feed,
        plunge_rate=args.plunge,
        drill_depth=args.depth,
        safe_height=args.safe,
        spindle_speed=args.rpm,
        use_dwell=args.dwell,
    )

    if args.output:
        Path(args.output).write_text(gcode, encoding="utf-8")
        print(f"G-code written to {args.output}", file=sys.stderr)
    else:
        print(gcode)

    if args.preview:
        _show_preview(project, result)


def _show_preview(project, result) -> None:
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not installed, skipping preview", file=sys.stderr)
        return

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    _draw_paths(ax1, project.holes, project.tools, "Original Path")
    _draw_paths(ax2, result.ordered_holes, project.tools, "Optimized Path")

    ax2.set_title(f"Optimized Path ({result.improvement:.1f}% shorter)")
    plt.tight_layout()
    plt.show()


def _draw_paths(ax, holes, tools, title):
    colors = ["#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4", "#42d4f4"]
    color_map = {}
    for i, tn in enumerate(sorted(set(h.tool for h in holes))):
        color_map[tn] = colors[i % len(colors)]

    for hole in holes:
        td = tools.get(hole.tool)
        r = (td.diameter / 2 if td else 0.3) * 0.8
        circle = plt.Circle((hole.x, hole.y), r, color=color_map[hole.tool], alpha=0.4)
        ax.add_patch(circle)
        ax.plot(hole.x, hole.y, ".", color=color_map[hole.tool], markersize=2)

    # Draw path
    xs = [0] + [h.x for h in holes]
    ys = [0] + [h.y for h in holes]
    ax.plot(xs, ys, "-", color="blue", alpha=0.2, linewidth=0.5)

    ax.set_aspect("equal")
    ax.set_title(title)
    ax.grid(True, alpha=0.3)


if __name__ == "__main__":
    main()
