#!/usr/bin/env python3
"""
Crop all floor plan SVGs to their drawing content using Inkscape.

For each SVG in frontend/public/plans/:
  1. Run Inkscape --export-area-drawing to a temp file.
     Inkscape wraps the content in a <g transform="translate(tx,ty)"> so that
     the drawing bounding box starts at the origin; the viewBox becomes "0 0 W H".
  2. Extract W, H (from the temp viewBox) and tx, ty (from the root translate).
  3. Set the ORIGINAL SVG's viewBox to  "{-tx} {-ty} {W} {H}"
     so the visible area is exactly the drawing content in the original coordinate space.
  4. Add width="{round(W)}" height="{round(H)}" so browsers report correct
     naturalWidth/naturalHeight via <img>.

The original SVG elements are never touched — only viewBox and width/height change.
Running this script twice on the same files produces identical output (deterministic).

After running this script, tune per-plan marker alignment in
frontend/src/components/cave/InteractiveFloorPlan.tsx via the planTransforms table.
"""

import os
import re
import subprocess
import tempfile

INKSCAPE    = '/Applications/Inkscape.app/Contents/MacOS/inkscape'
SVG_DIR     = '/Users/arno/Software/www/elloracaves/frontend/public/plans'


def get_crop_bounds(svg_path: str) -> tuple[float, float, float, float] | None:
    """
    Returns (x_min, y_min, width, height) in the SVG's original coordinate space,
    using Inkscape's --export-area-drawing to find the tight content bounding box.
    """
    with tempfile.NamedTemporaryFile(suffix='.svg', delete=False) as tmp:
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            [INKSCAPE,
             '--export-area-drawing',
             '--export-type=svg',
             f'--export-filename={tmp_path}',
             svg_path],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f'  Inkscape error: {result.stderr[:200]}')
            return None

        with open(tmp_path, 'r', encoding='utf-8') as f:
            tmp_content = f.read()
    finally:
        os.unlink(tmp_path)

    # Extract W, H from viewBox="0 0 W H"
    vb = re.search(r'viewBox="([^"]*)"', tmp_content)
    if not vb:
        return None
    parts = vb.group(1).split()
    if len(parts) != 4:
        return None
    W, H = float(parts[2]), float(parts[3])

    # Extract translation from root <g transform="translate(tx, ty)">
    # Inkscape shifts content to origin; original x_min = -tx, y_min = -ty
    tr = re.search(r'transform="translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)"', tmp_content)
    tx = float(tr.group(1)) if tr else 0.0
    ty = float(tr.group(2)) if tr else 0.0

    x_min = -tx
    y_min = -ty
    return (x_min, y_min, W, H)


def fmt(v: float) -> str:
    """Format float: up to 6 significant digits, no trailing zeros."""
    s = f'{v:.6g}'
    return s


def apply_crop(svg_path: str, x_min: float, y_min: float, W: float, H: float):
    with open(svg_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_vb   = f'{fmt(x_min)} {fmt(y_min)} {fmt(W)} {fmt(H)}'
    new_w    = round(W)
    new_h    = round(H)

    # 1. Replace viewBox
    new_content = re.sub(r'viewBox="[^"]*"', f'viewBox="{new_vb}"', content)

    # 2. Update Illustrator enable-background (cosmetic — doesn't affect browsers)
    new_content = re.sub(
        r'(enable-background\s*:\s*new\s+)[\d.\s]+(?=;|")',
        lambda m: m.group(1) + f'{fmt(x_min)} {fmt(y_min)} {fmt(W)} {fmt(H)}',
        new_content
    )

    # 3. Remove existing width/height from the <svg> opening tag (first 2000 chars)
    head, tail = new_content[:2000], new_content[2000:]
    head = re.sub(r'\s+width="[^"]*"', '', head)
    head = re.sub(r'\s+height="[^"]*"', '', head)
    new_content = head + tail

    # 4. Insert width/height immediately before viewBox=
    new_content = new_content.replace(
        f'viewBox="{new_vb}"',
        f'width="{new_w}" height="{new_h}" viewBox="{new_vb}"',
        1
    )

    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(new_content)


def main():
    svgs = sorted(f for f in os.listdir(SVG_DIR) if f.endswith('.svg'))
    print(f'Cropping {len(svgs)} SVGs using Inkscape {INKSCAPE}\n')

    for svg_file in svgs:
        svg_path = os.path.join(SVG_DIR, svg_file)
        bounds = get_crop_bounds(svg_path)
        if bounds is None:
            print(f'  SKIP (no bounds): {svg_file}')
            continue

        x_min, y_min, W, H = bounds
        apply_crop(svg_path, x_min, y_min, W, H)
        print(f'  {svg_file}: {round(W)}x{round(H)}  viewBox="{fmt(x_min)} {fmt(y_min)} {fmt(W)} {fmt(H)}"')

    print('\nDone. Tune planTransforms in InteractiveFloorPlan.tsx to align markers.')


if __name__ == '__main__':
    main()
