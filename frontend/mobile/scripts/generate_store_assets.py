#!/usr/bin/env python3
"""Generate Google Play Store image assets for the AltuHealth mobile app."""

from __future__ import annotations

import json
import shutil
import subprocess
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "store-assets"
SOURCE = OUT / "_source"
ICON_SOURCE = ROOT / "assets" / "images" / "icon.png"

PHONE_SIZE = (1080, 1920)
TABLET_7_SIZE = (1080, 1920)
TABLET_10_SIZE = (1440, 2560)

COLORS = {
    "ink": "#0F172A",
    "muted": "#64748B",
    "subtle": "#E2E8F0",
    "line": "#D5E3EA",
    "paper": "#FFFFFF",
    "page": "#F4F8FB",
    "teal": "#0F766E",
    "blue": "#2563EB",
    "green": "#16A34A",
    "cyan": "#06B6D4",
    "navy": "#12324A",
    "amber": "#F59E0B",
    "rose": "#E11D48",
}

SCREENS = [
    ("home", "Home"),
    ("visits", "Visits"),
    ("benefits", "Benefits"),
    ("more", "More"),
]


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def ensure_dirs() -> None:
    for path in [
        SOURCE,
        OUT / "icon",
        OUT / "feature-graphic",
        OUT / "screenshots" / "phone",
        OUT / "screenshots" / "7-inch-tablet",
        OUT / "screenshots" / "10-inch-tablet",
    ]:
        path.mkdir(parents=True, exist_ok=True)


def rect(
    x: float,
    y: float,
    w: float,
    h: float,
    fill: str,
    rx: float = 22,
    stroke: str | None = None,
    sw: float = 1,
    opacity: float = 1,
) -> str:
    stroke_attr = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    opacity_attr = f' opacity="{opacity}"' if opacity < 1 else ""
    return (
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
        f'rx="{rx:.1f}" fill="{fill}"{stroke_attr}{opacity_attr}/>'
    )


def circle(cx: float, cy: float, r: float, fill: str, opacity: float = 1) -> str:
    opacity_attr = f' opacity="{opacity}"' if opacity < 1 else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"{opacity_attr}/>'


def text(
    value: str,
    x: float,
    y: float,
    size: float,
    fill: str = COLORS["ink"],
    weight: int = 400,
    anchor: str = "start",
    opacity: float = 1,
) -> str:
    opacity_attr = f' opacity="{opacity}"' if opacity < 1 else ""
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size:.1f}" '
        f'font-family="Arial" font-weight="{weight}" '
        f'text-anchor="{anchor}" fill="{fill}"{opacity_attr}>{escape(value)}</text>'
    )


def line(x1: float, y1: float, x2: float, y2: float, color: str, sw: float = 2) -> str:
    return (
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
        f'stroke="{color}" stroke-width="{sw:.1f}" stroke-linecap="round"/>'
    )


def path(d: str, stroke: str, sw: float = 3, fill: str = "none") -> str:
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'


def logo_mark(x: float, y: float, size: float, label_size: float | None = None) -> str:
    label = label_size or size * 0.46
    return "\n".join(
        [
            rect(x, y, size, size, COLORS["teal"], size * 0.22),
            circle(x + size * 0.72, y + size * 0.28, size * 0.16, "#FFFFFF", 0.22),
            text("A", x + size * 0.5, y + size * 0.66, label, "#FFFFFF", 700, "middle"),
        ]
    )


def svg_doc(width: int, height: int, body: str, defs: str = "") -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<defs>
<linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#0F766E"/>
<stop offset="52%" stop-color="#2563EB"/>
<stop offset="100%" stop-color="#16A34A"/>
</linearGradient>
<linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#F6FAFD"/>
<stop offset="100%" stop-color="#EAF5F2"/>
</linearGradient>
{defs}
</defs>
{body}
</svg>
"""


def write_svg(pathname: Path, content: str) -> None:
    pathname.write_text(content, encoding="utf-8")


def convert_svg(svg_path: Path, png_path: Path, width: int, height: int) -> None:
    run(
        [
            "magick",
            "-density",
            "144",
            "-font",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "-background",
            "white",
            str(svg_path),
            "-resize",
            f"{width}x{height}!",
            "-alpha",
            "remove",
            "-alpha",
            "off",
            "-strip",
            str(png_path),
        ]
    )


def draw_status_bar(w: int, scale: float) -> str:
    y = 44 * scale
    return "\n".join(
        [
            text("9:41", 52 * scale, y, 22 * scale, COLORS["navy"], 700),
            line(w - 130 * scale, 34 * scale, w - 98 * scale, 34 * scale, COLORS["navy"], 4 * scale),
            line(w - 130 * scale, 43 * scale, w - 98 * scale, 43 * scale, COLORS["navy"], 4 * scale),
            rect(w - 76 * scale, 27 * scale, 38 * scale, 22 * scale, "none", 7 * scale, COLORS["navy"], 2 * scale),
            rect(w - 70 * scale, 32 * scale, 24 * scale, 12 * scale, COLORS["navy"], 4 * scale),
        ]
    )


def draw_bottom_nav(w: int, h: int, active: str, scale: float) -> str:
    nav_h = 156 * scale
    nav_y = h - nav_h
    labels = ["Home", "History", "Visits", "Benefits", "More"]
    icons = {
        "Home": "H",
        "History": "R",
        "Visits": "V",
        "Benefits": "B",
        "More": "M",
    }
    items = [rect(0, nav_y, w, nav_h, "#FFFFFF", 0, COLORS["subtle"], 1 * scale)]
    for index, label in enumerate(labels):
        cx = (index + 0.5) * (w / len(labels))
        color = COLORS["teal"] if label == active else COLORS["muted"]
        if label == active:
            items.append(rect(cx - 64 * scale, nav_y + 22 * scale, 128 * scale, 76 * scale, "#DDF5EF", 38 * scale))
        items.append(text(icons[label], cx, nav_y + 70 * scale, 34 * scale, color, 700, "middle"))
        items.append(text(label, cx, nav_y + 124 * scale, 22 * scale, color, 700 if label == active else 500, "middle"))
    return "\n".join(items)


def metric_card(x: float, y: float, w: float, h: float, title: str, value: str, color: str, scale: float) -> str:
    return "\n".join(
        [
            rect(x, y, w, h, "#FFFFFF", 24 * scale, COLORS["line"], 1.4 * scale),
            circle(x + 42 * scale, y + 46 * scale, 18 * scale, color, 0.16),
            text(value, x + 28 * scale, y + 96 * scale, 38 * scale, COLORS["ink"], 700),
            text(title, x + 28 * scale, y + 132 * scale, 22 * scale, COLORS["muted"], 500),
        ]
    )


def appointment_card(
    x: float,
    y: float,
    w: float,
    scale: float,
    title: str,
    meta: str,
    status: str,
    color: str,
    show_status: bool = True,
) -> str:
    body = [
        rect(x, y, w, 154 * scale, "#FFFFFF", 26 * scale, COLORS["line"], 1.4 * scale),
        rect(x + 24 * scale, y + 26 * scale, 76 * scale, 76 * scale, "#E6F4F1", 22 * scale),
        text("15", x + 62 * scale, y + 66 * scale, 30 * scale, COLORS["teal"], 700, "middle"),
        text("JUL", x + 62 * scale, y + 96 * scale, 18 * scale, COLORS["teal"], 700, "middle"),
        text(title, x + 122 * scale, y + 58 * scale, 28 * scale, COLORS["ink"], 700),
        text(meta, x + 122 * scale, y + 98 * scale, 22 * scale, COLORS["muted"], 500),
    ]
    if show_status:
        body.extend(
            [
                rect(x + w - 166 * scale, y + 42 * scale, 126 * scale, 44 * scale, color, 22 * scale, None, 1, 0.13),
                text(status, x + w - 103 * scale, y + 72 * scale, 19 * scale, color, 700, "middle"),
            ]
        )
    return "\n".join(body)


def benefit_row(x: float, y: float, w: float, scale: float, title: str, subtitle: str, pct: float, color: str) -> str:
    bar_w = w - 52 * scale
    return "\n".join(
        [
            rect(x, y, w, 142 * scale, "#FFFFFF", 24 * scale, COLORS["line"], 1.4 * scale),
            text(title, x + 26 * scale, y + 46 * scale, 26 * scale, COLORS["ink"], 700),
            text(subtitle, x + 26 * scale, y + 82 * scale, 20 * scale, COLORS["muted"], 500),
            rect(x + 26 * scale, y + 105 * scale, bar_w, 14 * scale, "#E7EEF4", 7 * scale),
            rect(x + 26 * scale, y + 105 * scale, bar_w * pct, 14 * scale, color, 7 * scale),
        ]
    )


def home_content(x: float, y: float, w: float, scale: float, compact: bool = False) -> str:
    gap = 22 * scale
    cards = []
    cards.append(
        "\n".join(
            [
                rect(x, y, w, 250 * scale, COLORS["teal"], 34 * scale),
                text("Active Care Plan", x + 34 * scale, y + 64 * scale, 28 * scale, "#DDF5EF", 700),
                text("Gold HMO Plan", x + 34 * scale, y + 130 * scale, 48 * scale, "#FFFFFF", 700),
                text("Member ID: ALT-10293", x + 34 * scale, y + 180 * scale, 24 * scale, "#E6FFFA", 500),
                rect(x + w - 190 * scale, y + 38 * scale, 142 * scale, 50 * scale, "#FFFFFF", 25 * scale, None, 1, 0.22),
                text("Covered", x + w - 119 * scale, y + 72 * scale, 22 * scale, "#FFFFFF", 700, "middle"),
            ]
        )
    )
    metric_y = y + 284 * scale
    metric_w = (w - gap * 2) / 3
    cards.append(metric_card(x, metric_y, metric_w, 160 * scale, "Upcoming", "3", COLORS["blue"], scale))
    cards.append(metric_card(x + metric_w + gap, metric_y, metric_w, 160 * scale, "Benefits", "12", COLORS["green"], scale))
    cards.append(metric_card(x + (metric_w + gap) * 2, metric_y, metric_w, 160 * scale, "Support", "24/7", COLORS["cyan"], scale))
    cards.append(text("Next visit", x, metric_y + 228 * scale, 28 * scale, COLORS["ink"], 700))
    cards.append(
        appointment_card(
            x,
            metric_y + 256 * scale,
            w,
            scale,
            "General consultation",
            "Mainland Care Clinic • 10:30 AM",
            "Booked",
            COLORS["green"],
            not compact,
        )
    )
    if not compact:
        cards.append(text("Quick actions", x, metric_y + 472 * scale, 28 * scale, COLORS["ink"], 700))
        action_w = (w - gap) / 2
        cards.append(metric_card(x, metric_y + 502 * scale, action_w, 146 * scale, "Find a provider", "Care", COLORS["teal"], scale))
        cards.append(metric_card(x + action_w + gap, metric_y + 502 * scale, action_w, 146 * scale, "Open support", "Help", COLORS["amber"], scale))
    return "\n".join(cards)


def visits_content(x: float, y: float, w: float, scale: float, compact: bool = False) -> str:
    gap = 22 * scale
    body = [
        rect(x, y, w, 92 * scale, "#EAF7F3", 46 * scale),
        rect(x + 10 * scale, y + 10 * scale, (w - 20 * scale) / 2, 72 * scale, COLORS["teal"], 36 * scale),
        text("Upcoming", x + w * 0.25, y + 58 * scale, 24 * scale, "#FFFFFF", 700, "middle"),
        text("Past", x + w * 0.75, y + 58 * scale, 24 * scale, COLORS["teal"], 700, "middle"),
        appointment_card(x, y + 130 * scale, w, scale, "General consultation", "Mainland Care Clinic • Today", "Booked", COLORS["green"], not compact),
        appointment_card(x, y + 130 * scale + 176 * scale, w, scale, "Dental checkup", "Pearl Dental • Fri 18 Jul", "Pending", COLORS["amber"], not compact),
        appointment_card(x, y + 130 * scale + 352 * scale, w, scale, "Lab review", "Altulab Diagnostics • Mon 21 Jul", "Ready", COLORS["blue"], not compact),
    ]
    if not compact:
        body.extend(
            [
                text("Care team", x, y + 690 * scale, 28 * scale, COLORS["ink"], 700),
                metric_card(x, y + 720 * scale, (w - gap) / 2, 150 * scale, "Primary doctor", "Dr. Okafor", COLORS["teal"], scale),
                metric_card(x + (w + gap) / 2, y + 720 * scale, (w - gap) / 2, 150 * scale, "Nearest clinic", "2.4 km", COLORS["blue"], scale),
            ]
        )
    return "\n".join(body)


def benefits_content(x: float, y: float, w: float, scale: float, compact: bool = False) -> str:
    gap = 22 * scale
    body = [
        rect(x, y, w, 214 * scale, "#FFFFFF", 30 * scale, COLORS["line"], 1.4 * scale),
        text("Annual coverage", x + 30 * scale, y + 62 * scale, 28 * scale, COLORS["muted"], 600),
        text("N1,250,000", x + 30 * scale, y + 132 * scale, 52 * scale, COLORS["ink"], 700),
        text("72% available", x + 30 * scale, y + 176 * scale, 24 * scale, COLORS["green"], 700),
        circle(x + w - 96 * scale, y + 108 * scale, 52 * scale, COLORS["green"], 0.16),
        text("72%", x + w - 96 * scale, y + 120 * scale, 28 * scale, COLORS["green"], 700, "middle"),
        benefit_row(x, y + 250 * scale, w, scale, "Outpatient care", "8 of 12 visits remaining", 0.66, COLORS["teal"]),
        benefit_row(x, y + 250 * scale + 164 * scale, w, scale, "Medication", "N180,000 remaining", 0.72, COLORS["blue"]),
        benefit_row(x, y + 250 * scale + 328 * scale, w, scale, "Dental", "2 cleanings remaining", 0.50, COLORS["amber"]),
    ]
    if not compact:
        body.extend(
            [
                text("Included services", x, y + 746 * scale, 28 * scale, COLORS["ink"], 700),
                metric_card(x, y + 776 * scale, (w - gap) / 2, 150 * scale, "Hospitals", "42", COLORS["green"], scale),
                metric_card(x + (w + gap) / 2, y + 776 * scale, (w - gap) / 2, 150 * scale, "Pharmacies", "118", COLORS["blue"], scale),
            ]
        )
    return "\n".join(body)


def more_content(x: float, y: float, w: float, scale: float, compact: bool = False) -> str:
    rows = [
        ("Profile", "Personal details and member ID", COLORS["teal"]),
        ("Dependents", "Manage covered family members", COLORS["blue"]),
        ("Support tickets", "Track help requests", COLORS["amber"]),
        ("Documents", "Policy documents and claims", COLORS["green"]),
        ("Settings", "Security and notifications", COLORS["cyan"]),
    ]
    body = [
        rect(x, y, w, 176 * scale, COLORS["teal"], 30 * scale),
        circle(x + 76 * scale, y + 88 * scale, 44 * scale, "#FFFFFF", 0.22),
        text("AM", x + 76 * scale, y + 100 * scale, 28 * scale, "#FFFFFF", 700, "middle"),
        text("Amina Member", x + 142 * scale, y + 78 * scale, 30 * scale, "#FFFFFF", 700),
        text("Gold HMO Plan • Active", x + 142 * scale, y + 120 * scale, 23 * scale, "#E6FFFA", 500),
    ]
    start = y + 218 * scale
    for index, (title, subtitle, color) in enumerate(rows):
        row_y = start + index * 134 * scale
        body.extend(
            [
                rect(x, row_y, w, 110 * scale, "#FFFFFF", 24 * scale, COLORS["line"], 1.4 * scale),
                circle(x + 52 * scale, row_y + 55 * scale, 26 * scale, color, 0.15),
                text(title, x + 94 * scale, row_y + 48 * scale, 25 * scale, COLORS["ink"], 700),
                text(subtitle, x + 94 * scale, row_y + 82 * scale, 19 * scale, COLORS["muted"], 500),
                text(">", x + w - 42 * scale, row_y + 70 * scale, 34 * scale, COLORS["muted"], 700, "middle"),
            ]
        )
    return "\n".join(body)


def phone_screen(screen: str, title: str) -> str:
    w, h = PHONE_SIZE
    scale = 1.0
    margin = 56
    content_w = w - margin * 2
    header_y = 102
    content_y = 286
    active = "Home" if screen == "home" else title
    content_map = {
        "home": home_content,
        "visits": visits_content,
        "benefits": benefits_content,
        "more": more_content,
    }
    body = [
        rect(0, 0, w, h, COLORS["page"], 0),
        draw_status_bar(w, scale),
        logo_mark(margin, header_y, 58),
        text("AltuHealth", margin + 78, header_y + 40, 28, COLORS["teal"], 700),
        text("Welcome, Member" if screen == "home" else title, margin, header_y + 126, 52, COLORS["ink"], 700),
        text(
            "Manage your care, benefits and visits"
            if screen == "home"
            else {
                "visits": "Book and track your appointments",
                "benefits": "See what your plan covers",
                "more": "Profile, support and settings",
            }[screen],
            margin,
            header_y + 172,
            25,
            COLORS["muted"],
            500,
        ),
        content_map[screen](margin, content_y, content_w, scale),
        draw_bottom_nav(w, h, active, scale),
    ]
    return svg_doc(w, h, "\n".join(body))


def sidebar_nav(x: float, y: float, w: float, h: float, active: str, scale: float) -> str:
    labels = ["Home", "History", "Visits", "Benefits", "More"]
    body = [
        rect(x, y, w, h, "#FFFFFF", 0, COLORS["subtle"], 1 * scale),
        logo_mark(x + 34 * scale, y + 48 * scale, 58 * scale),
        text("AltuHealth", x + 106 * scale, y + 86 * scale, 25 * scale, COLORS["teal"], 700),
    ]
    nav_y = y + 172 * scale
    for index, label in enumerate(labels):
        row_y = nav_y + index * 72 * scale
        is_active = label == active
        body.append(
            rect(
                x + 24 * scale,
                row_y,
                w - 48 * scale,
                54 * scale,
                "#DDF5EF" if is_active else "#FFFFFF",
                18 * scale,
            )
        )
        body.append(text(label, x + 54 * scale, row_y + 36 * scale, 20 * scale, COLORS["teal"] if is_active else COLORS["muted"], 700 if is_active else 500))
    body.append(text("Member app", x + 34 * scale, y + h - 72 * scale, 18 * scale, COLORS["muted"], 600))
    return "\n".join(body)


def tablet_screen(size: tuple[int, int], screen: str, title: str) -> str:
    w, h = size
    scale = w / 1200
    sidebar_w = 252 * scale
    margin = 52 * scale
    content_x = sidebar_w + margin
    content_w = w - sidebar_w - margin * 2
    header_y = 78 * scale
    active = "Home" if screen == "home" else title
    content_map = {
        "home": home_content,
        "visits": visits_content,
        "benefits": benefits_content,
        "more": more_content,
    }
    left_w = content_w * 0.58
    right_x = content_x + left_w + 28 * scale
    right_w = content_w - left_w - 28 * scale
    content_y = 224 * scale
    body = [
        rect(0, 0, w, h, COLORS["page"], 0),
        sidebar_nav(0, 0, sidebar_w, h, active, scale),
        text("Welcome, Member" if screen == "home" else title, content_x, header_y + 48 * scale, 46 * scale, COLORS["ink"], 700),
        text(
            "Manage your care, benefits and visits from one secure member dashboard"
            if screen == "home"
            else {
                "visits": "Book, review and prepare for appointments",
                "benefits": "Monitor your plan limits and covered services",
                "more": "Manage profile, family members, support and settings",
            }[screen],
            content_x,
            header_y + 92 * scale,
            22 * scale,
            COLORS["muted"],
            500,
        ),
        content_map[screen](content_x, content_y, left_w, scale, True),
        text("Summary", right_x, content_y + 2 * scale, 26 * scale, COLORS["ink"], 700),
        metric_card(right_x, content_y + 34 * scale, right_w, 150 * scale, "Active plan", "Gold HMO", COLORS["teal"], scale),
        metric_card(right_x, content_y + 204 * scale, right_w, 150 * scale, "Provider network", "42 clinics", COLORS["blue"], scale),
        metric_card(right_x, content_y + 374 * scale, right_w, 150 * scale, "Support", "24/7", COLORS["green"], scale),
        rect(right_x, content_y + 566 * scale, right_w, 232 * scale, "#FFFFFF", 28 * scale, COLORS["line"], 1.4 * scale),
        text("Today", right_x + 28 * scale, content_y + 620 * scale, 24 * scale, COLORS["ink"], 700),
        text("General consultation", right_x + 28 * scale, content_y + 664 * scale, 22 * scale, COLORS["muted"], 600),
        text("10:30 AM • Mainland Care Clinic", right_x + 28 * scale, content_y + 702 * scale, 20 * scale, COLORS["muted"], 500),
        rect(right_x + 28 * scale, content_y + 740 * scale, right_w - 56 * scale, 42 * scale, "#EAF7F3", 21 * scale),
        text("Ready for check-in", right_x + right_w / 2, content_y + 768 * scale, 18 * scale, COLORS["teal"], 700, "middle"),
    ]
    return svg_doc(w, h, "\n".join(body))


def feature_graphic() -> str:
    w, h = 1024, 500
    body = [
        rect(0, 0, w, h, "#F4F8FB", 0),
        rect(0, 0, 540, h, COLORS["teal"], 0),
        circle(862, 86, 150, COLORS["cyan"], 0.14),
        circle(932, 444, 190, COLORS["green"], 0.12),
        logo_mark(72, 82, 132, 66),
        text("AltuHealth", 72, 272, 62, "#FFFFFF", 700),
        text("Healthcare access and benefits", 74, 324, 29, "#E6FFFA", 600),
        text("Visits in one secure member app", 74, 362, 29, "#E6FFFA", 600),
        rect(610, 74, 300, 132, "#FFFFFF", 28, COLORS["line"], 1.2),
        text("Active Care Plan", 634, 124, 24, COLORS["muted"], 700),
        text("Gold HMO Plan", 634, 168, 34, COLORS["ink"], 700),
        rect(642, 244, 302, 88, "#FFFFFF", 26, COLORS["line"], 1.2),
        circle(688, 288, 24, COLORS["green"], 0.17),
        text("Next visit booked", 728, 280, 22, COLORS["ink"], 700),
        text("10:30 AM • Mainland Care Clinic", 728, 310, 17, COLORS["muted"], 500),
        rect(584, 368, 270, 78, "#FFFFFF", 24, COLORS["line"], 1.2),
        text("72% benefits available", 618, 416, 24, COLORS["teal"], 700),
    ]
    return svg_doc(w, h, "\n".join(body))


def generate() -> None:
    if not ICON_SOURCE.exists():
        raise FileNotFoundError(f"Missing app icon: {ICON_SOURCE}")
    if not shutil.which("magick"):
        raise RuntimeError("ImageMagick 'magick' is required to generate PNG assets.")

    ensure_dirs()

    for folder in [
        SOURCE,
        OUT / "screenshots" / "phone",
        OUT / "screenshots" / "7-inch-tablet",
        OUT / "screenshots" / "10-inch-tablet",
        OUT / "feature-graphic",
        OUT / "icon",
    ]:
        for generated_file in folder.glob("*"):
            if generated_file.is_file() and generated_file.suffix in {".png", ".svg"}:
                generated_file.unlink()

    play_icon = OUT / "icon" / "play-store-icon-512.png"
    run(["magick", str(ICON_SOURCE), "-resize", "512x512!", "-alpha", "on", "-strip", f"PNG32:{play_icon}"])

    feature_svg = SOURCE / "play-store-feature-graphic-1024x500.svg"
    feature_png = OUT / "feature-graphic" / "play-store-feature-graphic-1024x500.png"
    write_svg(feature_svg, feature_graphic())
    convert_svg(feature_svg, feature_png, 1024, 500)

    generated: list[dict[str, object]] = [
        {"type": "icon", "path": str(play_icon.relative_to(ROOT)), "size": "512x512"},
        {"type": "feature_graphic", "path": str(feature_png.relative_to(ROOT)), "size": "1024x500"},
    ]

    for index, (screen, title) in enumerate(SCREENS, start=1):
        phone_svg = SOURCE / f"phone-{index:02d}-{screen}-1080x1920.svg"
        phone_png = OUT / "screenshots" / "phone" / f"phone-{index:02d}-{screen}-1080x1920.png"
        write_svg(phone_svg, phone_screen(screen, title))
        convert_svg(phone_svg, phone_png, *PHONE_SIZE)
        generated.append({"type": "phone_screenshot", "path": str(phone_png.relative_to(ROOT)), "size": "1080x1920"})

        tab7_svg = SOURCE / f"tablet-7-{index:02d}-{screen}-1080x1920.svg"
        tab7_png = OUT / "screenshots" / "7-inch-tablet" / f"tablet-7-{index:02d}-{screen}-1080x1920.png"
        write_svg(tab7_svg, tablet_screen(TABLET_7_SIZE, screen, title))
        convert_svg(tab7_svg, tab7_png, *TABLET_7_SIZE)
        generated.append({"type": "7_inch_tablet_screenshot", "path": str(tab7_png.relative_to(ROOT)), "size": "1080x1920"})

        tab10_svg = SOURCE / f"tablet-10-{index:02d}-{screen}-1440x2560.svg"
        tab10_png = OUT / "screenshots" / "10-inch-tablet" / f"tablet-10-{index:02d}-{screen}-1440x2560.png"
        write_svg(tab10_svg, tablet_screen(TABLET_10_SIZE, screen, title))
        convert_svg(tab10_svg, tab10_png, *TABLET_10_SIZE)
        generated.append({"type": "10_inch_tablet_screenshot", "path": str(tab10_png.relative_to(ROOT)), "size": "1440x2560"})

    (OUT / "manifest.json").write_text(json.dumps(generated, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    generate()
