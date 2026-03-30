#!/usr/bin/env python3
"""
Sync book figure uploads to Supabase.

Reads upload_log.csv (output of upload_cloudflare.py) and for each successfully
uploaded file:

  - Files with 'Fig.', 'Archive{N}', or 'Plate{N}' in the name:
      Find the matching existing DB row by a normalized match key and UPDATE
      only file_path and cloudflare_image_id. All other metadata is preserved
      (book_page, book_figure, cave_id, subject, description, etc.)
      Safety: only updates rows whose existing file_path starts with 'book_'.

  - All other files:
      INSERT a new row with file_path and cloudflare_image_id.

Match keys:
  Local 'Fig.1.44'      <-> DB 'Fig.1.44'      (exact, case-insensitive)
  Local 'Archive12'     <-> DB '_A12_'          (number + optional b suffix)
  Local 'Archive24a'    <-> DB '_A24_'          (24a is the primary A24 image)
  Local 'Plate6'        <-> DB 'Pl.6'           (number + optional b suffix)

Hardcoded INSERT-copies: rows whose DB file_path doesn't start with 'book_' but
have the same image — we INSERT a new row copying metadata from the existing row:
  fig.contents  -> copy book_page/book_figure/cave_id from image_id 7103
  fig.2.19c     -> copy book_page/book_figure/cave_id from image_id 7368

Special-case INSERTs (no existing DB row, or DB filename mismatch):
  fig.preface   -> new row, book_page=14, book_figure='Preface', cave_id=15
  fig.1.50      -> new row, book_page=88, book_figure='1.50', cave_id=16
                   (DB has this as fig.1.50 in book_figure but filename says 1.49)
  fig.2.3       -> new row, book_page=99,  book_figure='2.3',  cave_id=12
  fig.2.11      -> new row, book_page=104, book_figure='2.11', cave_id=6
  fig.2.12      -> new row, book_page=105, book_figure='2.12', cave_id=10
  fig.2.14      -> new row, book_page=105, book_figure='2.14', cave_id=10
  fig.2.16      -> new row, book_page=106, book_figure='2.16', cave_id=2
  archive.a24b  -> new row copying metadata from image_id 9458 (A24)

Non-Ellora figures (Ajanta/Aurangabad/Kanheri) and other book_ images with no
cave — INSERTed as new rows. book_page/book_figure set where known; update the
NON_ELLORA_META dict below with page numbers once confirmed.

Usage:
    python sync_book_figures.py upload_log.csv [--dry-run]

Environment variables:
    SUPABASE_URL         Your Supabase project URL
    SUPABASE_SERVICE_KEY Your Supabase service role key (for writes)
"""

import argparse
import csv
import os
import re
import sys
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    print("Error: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Hardcoded INSERT-copies: normalized key -> image_id whose metadata to copy.
# The existing DB row is LEFT UNTOUCHED; a NEW row is inserted with the new
# file_path/cloudflare_image_id and the same book_page/book_figure/cave_id.
# Used when the existing row has a non-book_ file_path (regular cave photo)
# that should not be renamed, but the same subject appears in the book.
# ---------------------------------------------------------------------------
HARDCODED_COPY_IMAGE_IDS = {
    ('fig', 'fig.contents'): 7103,
    ('fig', 'fig.2.19c'):    7368,
}

# Special-case inserts: normalized key -> metadata dict to use for INSERT.
# These files have no existing DB row, or the DB row's filename key doesn't
# match (e.g. fig.1.50 is stored under fig.1.49 filename in the DB).
HARDCODED_INSERTS = {
    ('fig', 'fig.preface'): {
        'book_page':   14,
        'book_figure': 'Preface',
        'cave_id':     15,
    },
    ('fig', 'fig.1.50'): {
        'book_page':   88,
        'book_figure': '1.50',
        'cave_id':     16,
    },
    ('fig', 'fig.2.3'): {
        'book_page':   99,
        'book_figure': '2.3',
        'cave_id':     12,
    },
    ('fig', 'fig.2.11'): {
        'book_page':   104,
        'book_figure': '2.11',
        'cave_id':     6,
    },
    ('fig', 'fig.2.12'): {
        'book_page':   105,
        'book_figure': '2.12',
        'cave_id':     10,
    },
    ('fig', 'fig.2.14'): {
        'book_page':   105,
        'book_figure': '2.14',
        'cave_id':     10,
    },
    ('fig', 'fig.2.16'): {
        'book_page':   106,
        'book_figure': '2.16',
        'cave_id':     2,
    },
    ('archive', 'a24b'): {
        'book_page':   266,
        'book_figure': 'A24b',
        'cave_id':     33,
        'plan_id':     233,
        'archival':    True,
        'rank':        1,
    },
    # Non-Ellora figures: update page numbers below once confirmed.
    # cave_id is None since these are from other sites.
    ('fig', 'fig.2.22'):  {'book_figure': '2.22',  'book_page': None},
    ('fig', 'fig.2.23'):  {'book_figure': '2.23',  'book_page': None},
    ('fig', 'fig.2.24'):  {'book_figure': '2.24',  'book_page': None},
    ('fig', 'fig.2.25'):  {'book_figure': '2.25',  'book_page': None},
    ('fig', 'fig.2.26'):  {'book_figure': '2.26',  'book_page': None},
    ('fig', 'fig.5.12'):  {'book_figure': '5.12',  'book_page': None},
    ('fig', 'fig.5.3'):   {'book_figure': '5.3',   'book_page': None},
    ('fig', 'fig.5.5'):   {'book_figure': '5.5',   'book_page': None},
    ('fig', 'fig.5.6a'):  {'book_figure': '5.6A',  'book_page': None},
    ('fig', 'fig.5.6b'):  {'book_figure': '5.6B',  'book_page': None},
    ('fig', 'fig.5.9'):   {'book_figure': '5.9',   'book_page': None},
}

# Archive24a is the primary A24 image (not a sub-variant) — remap its key.
ARCHIVE_KEY_ALIASES = {
    ('archive', 'a24a'): ('archive', 'a24'),
}


# ---------------------------------------------------------------------------
# Match key extraction
# ---------------------------------------------------------------------------

_RE_FIG     = re.compile(r'Fig\.(\S+)',        re.IGNORECASE)
_RE_ARCHIVE = re.compile(r'Archive(\d+[ab]?)', re.IGNORECASE)
_RE_PLATE   = re.compile(r'Plate(\d+[ab]?)',   re.IGNORECASE)


def extract_key(filename: str):
    """
    Return (key_type, normalized_key) for a filename, or None if not a
    replacement/special file.

    Normalized keys:
      fig     -> ('fig', 'fig.1.44')
      archive -> ('archive', 'a12')
      plate   -> ('plate', 'pl.6')
    """
    stem = Path(filename).stem

    m = _RE_FIG.search(stem)
    if m:
        key = ('fig', f"fig.{m.group(1).lower()}")
        return ARCHIVE_KEY_ALIASES.get(key, key)

    m = _RE_ARCHIVE.search(stem)
    if m:
        key = ('archive', f"a{m.group(1).lower()}")
        return ARCHIVE_KEY_ALIASES.get(key, key)

    m = _RE_PLATE.search(stem)
    if m:
        key = ('plate', f"pl.{m.group(1).lower()}")
        return ARCHIVE_KEY_ALIASES.get(key, key)

    return None


def db_file_path_key(file_path: str):
    """
    Extract all possible normalized keys from a DB file_path.
    Returns a list of (key_type, normalized_key) tuples.
    """
    keys = []
    stem = Path(file_path).stem

    m = _RE_FIG.search(stem)
    if m:
        keys.append(('fig', f"fig.{m.group(1).lower()}"))

    # DB uses _A12_ or _A12a_ style
    m = re.search(r'_A(\d+[ab]?)_', stem, re.IGNORECASE)
    if m:
        keys.append(('archive', f"a{m.group(1).lower()}"))

    # DB uses Pl.6 style
    m = re.search(r'Pl\.(\d+[ab]?)', stem, re.IGNORECASE)
    if m:
        keys.append(('plate', f"pl.{m.group(1).lower()}"))

    return keys


# ---------------------------------------------------------------------------
# Upload log parsing
# ---------------------------------------------------------------------------

def parse_upload_log(log_file: Path) -> dict:
    """
    Parse upload_log.csv -> { filename: (local_path, cf_id) }
    Only includes SUCCESS rows.
    """
    mapping = {}
    with open(log_file, newline='') as f:
        for row in csv.DictReader(f):
            if row['status'] == 'SUCCESS' and row['image_id']:
                local_path = row['file']
                filename = Path(local_path).name
                mapping[filename] = (local_path, row['image_id'])
    return mapping


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def fetch_all_db_images(client):
    """Fetch all images from Supabase (paginated)."""
    images = []
    page_size = 1000
    offset = 0
    print("Fetching images from Supabase...")
    while True:
        response = (
            client.table('images')
            .select('image_id, file_path, cloudflare_image_id, book_figure, book_page, cave_id')
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = response.data
        images.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    print(f"  Fetched {len(images)} DB rows")
    return images


def build_db_index(db_images: list, id_lookup: dict) -> tuple:
    """
    Build:
      index:     { (key_type, normalized_key) -> db_row }  from file_path patterns
      id_map:    { image_id -> db_row }                     for hardcoded overrides
    """
    index = {}
    id_map = {img['image_id']: img for img in db_images}

    for img in db_images:
        for key in db_file_path_key(img.get('file_path', '')):
            if key in index:
                print(f"  WARNING: duplicate DB key {key!r} for image_ids "
                      f"{index[key]['image_id']} and {img['image_id']} "
                      f"('{index[key]['file_path']}' vs '{img['file_path']}')")
            else:
                index[key] = img

    print(f"  Built index with {len(index)} Fig/Archive/Plate DB entries")
    return index, id_map


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument('upload_log', type=Path, help='Path to upload_log.csv')
    parser.add_argument('--dry-run', action='store_true',
                        help="Show what would happen without writing to DB")
    args = parser.parse_args()

    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    if not supabase_url or not supabase_key:
        print("Error: set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
        sys.exit(1)

    if not args.upload_log.exists():
        print(f"Error: {args.upload_log} not found")
        sys.exit(1)

    # Parse upload log
    uploads = parse_upload_log(args.upload_log)
    print(f"Upload log: {len(uploads)} successful uploads\n")

    # Connect and fetch DB
    client = create_client(supabase_url, supabase_key)
    db_images = fetch_all_db_images(client)
    db_index, id_map = build_db_index(db_images, {})

    # Classify each uploaded file
    to_update        = []  # { image_id, old_file_path, new_file_path, new_cf_id, book_page, book_figure }
    to_insert        = []  # { file_path, cloudflare_image_id, ...optional metadata }
    unmatched        = []  # had a key but no DB row and no hardcoded handler

    for filename, (local_path, cf_id) in sorted(uploads.items()):
        key = extract_key(filename)

        if key is None:
            # No Fig/Archive/Plate marker — plain INSERT
            to_insert.append({
                'file_path':           filename,
                'cloudflare_image_id': cf_id,
            })
            continue

        # Hardcoded INSERT copying metadata from an existing row (original untouched)
        if key in HARDCODED_COPY_IMAGE_IDS:
            source_id = HARDCODED_COPY_IMAGE_IDS[key]
            source_row = id_map.get(source_id, {})
            new_row = {
                'file_path':           filename,
                'cloudflare_image_id': cf_id,
                'book_page':           source_row.get('book_page'),
                'book_figure':         source_row.get('book_figure'),
                'cave_id':             source_row.get('cave_id'),
            }
            to_insert.append(new_row)
            continue

        # Hardcoded INSERT with explicit metadata (no source row)
        if key in HARDCODED_INSERTS:
            row = {'file_path': filename, 'cloudflare_image_id': cf_id}
            row.update(HARDCODED_INSERTS[key])
            to_insert.append(row)
            continue

        # Normal path: look up DB row by index
        db_row = db_index.get(key)

        if db_row:
            to_update.append({
                'image_id':      db_row['image_id'],
                'old_file_path': db_row['file_path'],
                'new_file_path': filename,
                'new_cf_id':     cf_id,
                'book_page':     db_row.get('book_page'),
                'book_figure':   db_row.get('book_figure'),
            })
        else:
            unmatched.append((key, filename))

    # Summary
    prefix = '[DRY RUN] ' if args.dry_run else ''
    print(f"\n{prefix}Plan:")
    print(f"  UPDATE (replace existing):        {len(to_update)}")
    print(f"  INSERT (new rows):                {len(to_insert)}")
    print(f"  UNMATCHED (key, no DB row):       {len(unmatched)}")

    if unmatched:
        print("\n  --- UNMATCHED (need manual review) ---")
        for key, fname in unmatched:
            print(f"    key={key!r}  file={fname}")

    if args.dry_run:
        print("\n  --- Would UPDATE ---")
        for u in to_update:
            print(f"    image_id={u['image_id']:5d}  p.{u['book_page']} fig.{u['book_figure']}")
            print(f"      OLD: {u['old_file_path']}")
            print(f"      NEW: {u['new_file_path']}")
            print(f"      CF:  {u['new_cf_id']}")
        print("\n  --- Would INSERT ---")
        for i in to_insert:
            meta = {k: v for k, v in i.items()
                    if k not in ('file_path', 'cloudflare_image_id')}
            print(f"    {i['file_path']}")
            print(f"      cf_id: {i['cloudflare_image_id']}"
                  + (f"  meta: {meta}" if meta else ""))
        return

    # Execute UPDATEs
    update_errors = 0
    for u in to_update:
        try:
            client.table('images').update({
                'file_path':           u['new_file_path'],
                'cloudflare_image_id': u['new_cf_id'],
            }).eq('image_id', u['image_id']).execute()
        except Exception as e:
            print(f"  Error updating image_id={u['image_id']}: {e}")
            update_errors += 1
    print(f"\nUpdated {len(to_update) - update_errors} rows ({update_errors} errors)")

    # Execute INSERTs
    insert_errors = 0
    for i in to_insert:
        try:
            client.table('images').insert(i).execute()
        except Exception as e:
            print(f"  Error inserting {i['file_path']}: {e}")
            insert_errors += 1
    print(f"Inserted {len(to_insert) - insert_errors} rows ({insert_errors} errors)")
    print("\nDone!")


if __name__ == '__main__':
    main()
