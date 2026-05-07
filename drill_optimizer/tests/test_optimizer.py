"""Tests for the CNC Drill Optimizer Python modules."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / "python"))

from excellon_parser import parse, DrillProject, DrillHole, ToolDefinition
from drill_optimizer import optimize, nearest_neighbor, two_opt_improve, _path_distance
from gcode_generator import generate

FIXTURES = Path(__file__).parent / "fixtures"


class TestExcellonParser:
    def test_parse_metric_file(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text(), "sample_metric.drl")
        assert len(project.tools) == 4
        assert len(project.holes) == 42
        assert project.units == "metric"
        # T01 should have 0.6mm diameter
        assert project.tools[1].diameter == pytest.approx(0.6, abs=0.01)
        # T02 should have 0.8mm diameter
        assert project.tools[2].diameter == pytest.approx(0.8, abs=0.01)
        # All holes should have positive coordinates (metric, in mm*1000)
        for h in project.holes:
            assert h.x > 0
            assert h.y > 0

    def test_parse_imperial_file(self):
        project = parse((FIXTURES / "sample_imperial.drl").read_text(), "sample_imperial.drl")
        assert len(project.tools) == 4
        assert len(project.holes) == 42
        assert project.units == "inch"
        # T01 diameter should be converted from 0.024 inch to mm
        assert project.tools[1].diameter == pytest.approx(0.024 * 25.4, abs=0.01)

    def test_tool_hit_counts(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        assert project.tools[1].hit_count == 23
        assert project.tools[2].hit_count == 9
        assert project.tools[3].hit_count == 6
        assert project.tools[4].hit_count == 4

    def test_empty_file(self):
        project = parse("")
        assert len(project.holes) == 0
        assert len(project.tools) == 0

    def test_no_header(self):
        # Some files may lack proper header
        text = "T01\nX100Y200\nX300Y400\nM30\n"
        project = parse(text)
        assert len(project.holes) == 2
        assert project.holes[0].tool == 1

    def test_slot_g85(self):
        text = "M48\nMETRIC,TZ\nT01C0.8\n%\nT01\nG85X1000Y2000X3000Y4000\nM30\n"
        project = parse(text)
        assert len(project.holes) == 2
        assert project.holes[0].x == pytest.approx(100.0, abs=0.1)
        assert project.holes[1].x == pytest.approx(300.0, abs=0.1)


class TestOptimizer:
    def test_nearest_neighbor_basic(self):
        points = [(0, 0), (1, 0), (2, 0), (3, 0)]
        route = nearest_neighbor(points, (0, 0))
        assert route == [0, 1, 2, 3]

    def test_nearest_neighbor_empty(self):
        assert nearest_neighbor([]) == []

    def test_two_opt_improves(self):
        # Create points where 2-opt should find improvement
        points = [(0, 0), (3, 0), (1, 1), (2, 1)]
        nn_route = nearest_neighbor(points, (0, 0))
        opt_route = two_opt_improve(points, nn_route, max_iterations=50, time_limit=1.0)

        nn_dist = sum(
            ((points[nn_route[i]][0] - points[nn_route[i + 1]][0]) ** 2 +
             (points[nn_route[i]][1] - points[nn_route[i + 1]][1]) ** 2) ** 0.5
            for i in range(len(nn_route) - 1)
        )
        opt_dist = sum(
            ((points[opt_route[i]][0] - points[opt_route[i + 1]][0]) ** 2 +
             (points[opt_route[i]][1] - points[opt_route[i + 1]][1]) ** 2) ** 0.5
            for i in range(len(opt_route) - 1)
        )
        assert opt_dist <= nn_dist + 1e-6

    def test_optimize_reduces_distance(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project, max_iterations=50, time_limit=2.0)
        assert result.total_distance <= result.original_distance
        assert result.improvement >= 0
        assert len(result.ordered_holes) == len(project.holes)

    def test_optimize_preserves_all_holes(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project)
        original_set = {(h.x, h.y, h.tool) for h in project.holes}
        optimized_set = {(h.x, h.y, h.tool) for h in result.ordered_holes}
        assert original_set == optimized_set

    def test_optimize_empty(self):
        project = DrillProject()
        result = optimize(project)
        assert result.ordered_holes == []
        assert result.total_distance == 0

    def test_tool_stats(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project)
        assert len(result.tool_stats) == 4
        total_hits = sum(ts["hit_count"] for ts in result.tool_stats)
        assert total_hits == len(project.holes)


class TestGCodeGenerator:
    def test_generate_basic(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project, max_iterations=10, time_limit=1.0)
        gcode = generate(result, project)

        assert "G21" in gcode
        assert "G90" in gcode
        assert "M30" in gcode
        assert "M06" in gcode  # Tool change
        assert "M03" in gcode  # Spindle on
        assert "M05" in gcode  # Spindle off

    def test_generate_line_count(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project, max_iterations=10, time_limit=1.0)
        gcode = generate(result, project)

        # Each hole should produce G00 XY, G00 Z approach, G01 Z drill, G00 Z retract
        # Plus header, tool changes, and end sequence
        lines = [l for l in gcode.split("\n") if l.strip() and not l.strip().startswith("(")]
        assert len(lines) > len(project.holes)  # At least one command per hole

    def test_generate_custom_params(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project, max_iterations=10, time_limit=1.0)
        gcode = generate(result, project, plunge_rate=300, drill_depth=-1.8, spindle_speed=8000)

        assert "F300" in gcode
        assert "Z-1.800" in gcode
        assert "S8000" in gcode

    def test_generate_with_dwell(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project, max_iterations=10, time_limit=1.0)
        gcode = generate(result, project, use_dwell=True)
        assert "G04" in gcode

    def test_generate_without_dwell(self):
        project = parse((FIXTURES / "sample_metric.drl").read_text())
        result = optimize(project, max_iterations=10, time_limit=1.0)
        gcode = generate(result, project, use_dwell=False)
        assert "G04" not in gcode


class TestEndToEnd:
    def test_full_pipeline_metric(self):
        text = (FIXTURES / "sample_metric.drl").read_text()
        project = parse(text, "sample_metric.drl")
        result = optimize(project, max_iterations=50, time_limit=2.0)
        gcode = generate(result, project)

        assert len(project.holes) == 42
        assert len(result.ordered_holes) == 42
        assert result.improvement > 0
        assert "M30" in gcode

    def test_full_pipeline_imperial(self):
        text = (FIXTURES / "sample_imperial.drl").read_text()
        project = parse(text, "sample_imperial.drl")
        result = optimize(project, max_iterations=50, time_limit=2.0)
        gcode = generate(result, project)

        assert len(project.holes) == 42
        assert "M30" in gcode
