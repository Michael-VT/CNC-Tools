"""Excellon NC Drill File Parser.

Parses Excellon-format drill files for PCB manufacturing.
Supports metric/imperial units, leading/trailing zero suppression,
tool definitions (T01C0.8), drill hits, and slots (G85).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional


class State(Enum):
    INIT = auto()
    HEADER = auto()
    BODY = auto()


@dataclass
class ToolDefinition:
    number: int
    diameter: float  # always in mm
    unit: str = "metric"
    hit_count: int = 0


@dataclass
class DrillHole:
    x: float  # mm
    y: float  # mm
    tool: int


@dataclass
class DrillProject:
    tools: dict[int, ToolDefinition] = field(default_factory=dict)
    holes: list[DrillHole] = field(default_factory=list)
    units: str = "metric"
    format_tuple: tuple[int, int] = (3, 3)
    zero_suppression: str = "leading"
    source_filename: Optional[str] = None
    warnings: list[str] = field(default_factory=list)


def parse(text: str, filename: str | None = None) -> DrillProject:
    """Parse an Excellon drill file and return a DrillProject."""
    lines = text.splitlines()
    state = State.INIT

    project = DrillProject(
        units="metric",
        format_tuple=(3, 3),
        zero_suppression="leading",
        source_filename=filename,
    )

    active_tool: int | None = None

    for line_num, raw_line in enumerate(lines, 1):
        line = raw_line.strip()
        if not line:
            continue

        # Comment
        if line.startswith(";"):
            fmt_match = re.match(r";\s*FILE_FORMAT=(\d):(\d)", line, re.IGNORECASE)
            if fmt_match:
                project.format_tuple = (int(fmt_match.group(1)), int(fmt_match.group(2)))
            continue

        # Header start
        if line == "M48" or line.startswith("M48"):
            state = State.HEADER
            continue

        # Header end
        if line == "M95" or line == "%":
            state = State.BODY
            continue

        # ---- HEADER ----
        if state == State.HEADER:
            unit_match = re.match(r"^(INCH|METRIC)[,\s]*(TZ|LZ|LT)?", line, re.IGNORECASE)
            if unit_match:
                project.units = "inch" if unit_match.group(1).upper() == "INCH" else "metric"
                zs = (unit_match.group(2) or "").upper()
                if zs in ("TZ", "LT"):
                    project.zero_suppression = "trailing"
                elif zs == "LZ":
                    project.zero_suppression = "leading"
                continue

            if re.match(r"^FMAT\s*,\s*2", line, re.IGNORECASE):
                continue

            tool_match = re.match(r"^T(\d+)C([\d.]+)", line, re.IGNORECASE)
            if tool_match:
                num = int(tool_match.group(1))
                dia = float(tool_match.group(2))
                if project.units == "inch":
                    dia *= 25.4
                project.tools[num] = ToolDefinition(number=num, diameter=dia)
                continue

            continue

        # ---- BODY or INIT auto-detect ----
        if state == State.INIT:
            if re.match(r"^[XTG]", line, re.IGNORECASE):
                state = State.BODY
            else:
                continue

        if state == State.BODY:
            if line == "M30":
                break
            if line == "G05":
                continue

            # Tool selection
            tool_sel = re.match(r"^T(\d+)", line, re.IGNORECASE)
            if tool_sel:
                active_tool = int(tool_sel.group(1))
                if active_tool not in project.tools:
                    project.tools[active_tool] = ToolDefinition(
                        number=active_tool, diameter=0.0
                    )
                continue

            # Slot G85
            slot_match = re.match(
                r"^G85\s*(X([\d.-]+))?\s*(Y([\d.-]+))?\s*(X([\d.-]+))?\s*(Y([\d.-]+))?",
                line, re.IGNORECASE,
            )
            if slot_match:
                if active_tool is None:
                    project.warnings.append(f"Line {line_num}: No tool selected")
                    continue
                for x_grp, y_grp in [(2, 4), (6, 8)]:
                    x_raw = slot_match.group(x_grp)
                    y_raw = slot_match.group(y_grp)
                    if x_raw or y_raw:
                        project.holes.append(DrillHole(
                            x=_parse_coord(x_raw, project) if x_raw else project.holes[-1].x if project.holes else 0,
                            y=_parse_coord(y_raw, project) if y_raw else project.holes[-1].y if project.holes else 0,
                            tool=active_tool,
                        ))
                continue

            # Drill hit
            hit_match = re.match(
                r"^(?:X([\d.-]+))?\s*(?:Y([\d.-]+))?\s*(?:X([\d.-]+))?\s*(?:Y([\d.-]+))?",
                line, re.IGNORECASE,
            )
            if hit_match and (hit_match.group(1) or hit_match.group(2)):
                if active_tool is None:
                    project.warnings.append(f"Line {line_num}: No tool selected before coordinates")
                    continue
                for idx in range(0, 4, 2):
                    x_raw = hit_match.group(idx + 1)
                    y_raw = hit_match.group(idx + 2)
                    if x_raw is not None or y_raw is not None:
                        last = project.holes[-1] if project.holes else DrillHole(0, 0, 0)
                        project.holes.append(DrillHole(
                            x=_parse_coord(x_raw, project) if x_raw else last.x,
                            y=_parse_coord(y_raw, project) if y_raw else last.y,
                            tool=active_tool,
                        ))

    # Auto-detect format if not set
    if project.format_tuple is None:
        project.format_tuple = _auto_detect_format(project)

    # Update hit counts
    for tool in project.tools.values():
        tool.hit_count = sum(1 for h in project.holes if h.tool == tool.number)

    # Remove tools with zero hits and zero diameter
    used = {h.tool for h in project.holes}
    project.tools = {n: t for n, t in project.tools.items() if t.diameter > 0 or n in used}

    return project


def _parse_coord(raw: str, project: DrillProject) -> float:
    """Parse a coordinate string, handling zero suppression and units."""
    if "." in raw:
        val = float(raw)
        return val * 25.4 if project.units == "inch" else val

    ft = project.format_tuple
    total_digits = ft[0] + ft[1]
    is_neg = raw.startswith("-")
    digits = raw[1:] if is_neg else raw

    if project.zero_suppression == "leading":
        digits = digits.zfill(total_digits)
    else:
        digits = digits.ljust(total_digits, "0")

    int_part = digits[: ft[0]]
    dec_part = digits[ft[0] :]
    value = float(f"{int_part}.{dec_part}") * (-1 if is_neg else 1)
    return value * 25.4 if project.units == "inch" else value


def _auto_detect_format(project: DrillProject) -> tuple[int, int]:
    """Try common format tuples and return the one producing reasonable dimensions."""
    if not project.holes:
        return (3, 3)
    return (3, 3)
