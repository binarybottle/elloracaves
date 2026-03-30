#!/usr/bin/env python3
"""
Find and fix mismatches between image file_path prefixes and cave_id assignments.

Connects to Supabase, determines the expected folder for each cave_id
(by majority vote from existing data + explicit overrides), identifies
mismatches, and generates:
  1. A mismatch report table
  2. SQL to correct file_path values in Supabase
  3. A shell script to move local image files

Usage:
    export SUPABASE_URL=https://xxx.supabase.co
    export SUPABASE_SERVICE_KEY=your_service_role_key
    python fix_file_paths.py [--local-root /path/to/images]

Options:
    --local-root    Root directory of local image files (for move script)
    --dry-run       Print report only, don't write output files
"""

import argparse
import csv
import os
import sys
from collections import Counter, defaultdict

import requests

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# Explicit folder name overrides for special cave IDs.
# These take precedence over majority-vote detection.
FOLDER_OVERRIDES = {
    120:   'c20A',
    220:   'c20B',
    124:   'c24A1',
    224:   'c24A2',
    130:   'c30A',
    132:   'c32Y',
    1016:  'c16L',
    2016:  'c16T',
    3016:  'c16S',
    10001: 'ganeshleni1-5',
    10006: 'ganeshleni6-7',
    10008: 'ganeshleni8-12',
    10013: 'ganeshleni13-16',
    10017: 'ganeshleni17-19',
    20001: 'jogeshwari1-2',
    20003: 'jogeshwari3-4',
}


def fetch_all_images():
    """Fetch image_id, file_path, cave_id for all images from Supabase."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Error: Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
        sys.exit(1)

    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    }

    all_rows = []
    offset = 0
    limit = 1000

    while True:
        url = f"{SUPABASE_URL}/rest/v1/images?select=image_id,file_path,cave_id&order=cave_id,file_path&offset={offset}&limit={limit}"
        resp = requests.get(url, headers=headers)
        if resp.status_code != 200:
            print(f"Error fetching images: {resp.status_code} {resp.text}")
            sys.exit(1)
        rows = resp.json()
        if not rows:
            break
        all_rows.extend(rows)
        offset += limit

    return all_rows


def get_folder(file_path):
    """Extract the folder prefix from a file_path like 'c9/photo.jpg' -> 'c9'."""
    if '/' in file_path:
        return file_path.split('/')[0]
    return ''


def build_cave_folder_map(images):
    """
    Determine the expected folder for each cave_id.
    Uses FOLDER_OVERRIDES first, then falls back to the most common
    folder prefix among existing images for that cave.
    """
    cave_folders = defaultdict(Counter)
    for img in images:
        folder = get_folder(img['file_path'])
        if folder:
            cave_folders[img['cave_id']][folder] += 1

    cave_map = {}
    for cave_id, counter in cave_folders.items():
        if cave_id in FOLDER_OVERRIDES:
            cave_map[cave_id] = FOLDER_OVERRIDES[cave_id]
        else:
            # Use majority folder
            most_common = counter.most_common(1)[0][0]
            cave_map[cave_id] = most_common

    # Add overrides for caves that might not have images yet
    for cave_id, folder in FOLDER_OVERRIDES.items():
        if cave_id not in cave_map:
            cave_map[cave_id] = folder

    return cave_map


def find_mismatches(images, cave_map):
    """Find images whose file_path folder doesn't match the expected folder for their cave_id."""
    mismatches = []
    for img in images:
        cave_id = img['cave_id']
        current_folder = get_folder(img['file_path'])
        expected_folder = cave_map.get(cave_id)

        if expected_folder and current_folder != expected_folder:
            filename = img['file_path'].split('/', 1)[1] if '/' in img['file_path'] else img['file_path']
            mismatches.append({
                'image_id': img['image_id'],
                'cave_id': cave_id,
                'current_path': img['file_path'],
                'current_folder': current_folder,
                'expected_folder': expected_folder,
                'new_path': f"{expected_folder}/{filename}",
            })

    return mismatches


def print_report(mismatches, cave_map):
    """Print a summary table of mismatches."""
    if not mismatches:
        print("\nNo mismatches found. All file_paths match their cave_id assignments.")
        return

    print(f"\n{'='*80}")
    print(f"MISMATCHES: {len(mismatches)} images have file_path folders that don't match cave_id")
    print(f"{'='*80}\n")

    # Summary by cave
    by_cave = defaultdict(list)
    for m in mismatches:
        by_cave[m['cave_id']].append(m)

    print(f"{'cave_id':>8}  {'expected':>15}  {'actual':>15}  {'count':>6}")
    print(f"{'-'*8:>8}  {'-'*15:>15}  {'-'*15:>15}  {'-'*6:>6}")
    for cave_id in sorted(by_cave.keys()):
        items = by_cave[cave_id]
        folders = Counter(m['current_folder'] for m in items)
        expected = cave_map[cave_id]
        for folder, count in folders.most_common():
            print(f"{cave_id:>8}  {expected:>15}  {folder:>15}  {count:>6}")

    print(f"\n{'─'*80}")
    print("Detail (first 50):\n")
    print(f"{'image_id':>9}  {'cave_id':>8}  {'current_path':<40}  {'new_path':<40}")
    print(f"{'-'*9:>9}  {'-'*8:>8}  {'-'*40:<40}  {'-'*40:<40}")
    for m in mismatches[:50]:
        print(f"{m['image_id']:>9}  {m['cave_id']:>8}  {m['current_path']:<40}  {m['new_path']:<40}")
    if len(mismatches) > 50:
        print(f"  ... and {len(mismatches) - 50} more")


def write_sql(mismatches, output_file='fix_file_paths.sql'):
    """Generate SQL to update file_path values."""
    with open(output_file, 'w') as f:
        f.write("-- Fix file_path mismatches: update folder prefixes to match cave_id assignments\n")
        f.write("-- Generated by fix_file_paths.py\n\n")
        f.write("BEGIN;\n\n")

        for m in mismatches:
            old = m['current_path'].replace("'", "''")
            new = m['new_path'].replace("'", "''")
            f.write(f"UPDATE images SET file_path = '{new}' WHERE image_id = {m['image_id']};\n")

        f.write("\nCOMMIT;\n")

    print(f"\nSQL written to: {output_file}")
    print(f"  Run in Supabase SQL Editor or: psql $DATABASE_URL -f {output_file}")


def write_move_script(mismatches, local_root, output_file='move_images.sh'):
    """Generate a shell script to move local image files."""
    with open(output_file, 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("# Move local image files to match corrected cave assignments\n")
        f.write(f"# Generated by fix_file_paths.py\n")
        f.write(f"# Local root: {local_root}\n\n")
        f.write("set -e\n\n")
        f.write(f'ROOT="{local_root}"\n')
        f.write("ERRORS=0\n\n")

        # Collect all target folders to mkdir
        target_folders = sorted(set(m['expected_folder'] for m in mismatches))
        for folder in target_folders:
            f.write(f'mkdir -p "$ROOT/{folder}"\n')
        f.write("\n")

        for m in mismatches:
            old = m['current_path']
            new = m['new_path']
            f.write(f'if [ -f "$ROOT/{old}" ]; then\n')
            f.write(f'  mv "$ROOT/{old}" "$ROOT/{new}"\n')
            f.write(f'  echo "  Moved: {old} -> {new}"\n')
            f.write(f'else\n')
            f.write(f'  echo "  MISSING: $ROOT/{old}"\n')
            f.write(f'  ERRORS=$((ERRORS + 1))\n')
            f.write(f'fi\n')

        f.write('\necho ""\n')
        f.write(f'echo "Done. {len(mismatches)} files processed."\n')
        f.write('if [ $ERRORS -gt 0 ]; then\n')
        f.write('  echo "WARNING: $ERRORS files were not found and could not be moved."\n')
        f.write('  exit 1\n')
        f.write('fi\n')

    os.chmod(output_file, 0o755)
    print(f"Move script written to: {output_file}")
    print(f"  Review, then run: ./{output_file}")


def write_csv(mismatches, output_file='file_path_mismatches.csv'):
    """Write mismatches to CSV."""
    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['image_id', 'cave_id', 'current_path', 'expected_folder', 'new_path'])
        writer.writeheader()
        for m in mismatches:
            writer.writerow({
                'image_id': m['image_id'],
                'cave_id': m['cave_id'],
                'current_path': m['current_path'],
                'expected_folder': m['expected_folder'],
                'new_path': m['new_path'],
            })
    print(f"CSV written to: {output_file}")


def main():
    parser = argparse.ArgumentParser(description="Find and fix file_path / cave_id mismatches")
    parser.add_argument('--local-root', default='./images',
                        help='Root directory of local image files (default: ./images)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print report only, do not write output files')
    args = parser.parse_args()

    print("Fetching all images from Supabase...")
    images = fetch_all_images()
    print(f"Fetched {len(images)} images")

    print("Building cave_id -> folder mapping...")
    cave_map = build_cave_folder_map(images)

    print("\nCave folder mapping:")
    for cave_id in sorted(cave_map.keys()):
        marker = " (override)" if cave_id in FOLDER_OVERRIDES else ""
        print(f"  {cave_id:>6} -> {cave_map[cave_id]}{marker}")

    mismatches = find_mismatches(images, cave_map)
    print_report(mismatches, cave_map)

    if mismatches and not args.dry_run:
        write_csv(mismatches)
        write_sql(mismatches)
        write_move_script(mismatches, args.local_root)
        print(f"\n{'='*80}")
        print("Steps:")
        print("  1. Review file_path_mismatches.csv")
        print("  2. Run fix_file_paths.sql in Supabase SQL Editor")
        print(f"  3. Run ./move_images.sh to move local files")
        print(f"{'='*80}")


if __name__ == '__main__':
    main()
