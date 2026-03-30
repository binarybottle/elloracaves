#!/usr/bin/env python3
"""
Cloudflare Images Deduplication Tool

Identifies and removes duplicate images stored in Cloudflare Images.
Works in three safe phases so you can review everything before any
destructive action.

  Phase 1: ANALYZE  (read-only)
    Lists all Cloudflare images, downloads a small variant of each,
    computes content hashes, and identifies groups of identical images.
    Saves results to dedup_analysis.json.

  Phase 2: PLAN     (read-only)
    Cross-references duplicate groups with the Supabase images table.
    Scores each record (book_figure, book_page, plan coords, etc.)
    and selects which to keep.  Generates a human-readable report
    (dedup_report.txt) and a machine-readable plan (dedup_plan.json).

  Phase 3: EXECUTE  (destructive – review the plan first!)
    Backs up all affected records, merges metadata into the keeper,
    redirects best_id references, deletes duplicate DB records,
    and deletes duplicate Cloudflare images.
    Generates dedup_undo.sql for recovery.

Usage:
    python dedup_cloudflare.py analyze
    python dedup_cloudflare.py plan
    python dedup_cloudflare.py execute --confirm

    # Optional: use local files for hashing (faster than CDN download)
    python dedup_cloudflare.py analyze --local-dir /path/to/caves_1200px

Environment variables:
    CF_API_TOKEN         Cloudflare API Token (Bearer) or Global API Key
    CF_AUTH_EMAIL        Cloudflare account email (for Global API Key auth)
    CF_ACCOUNT_ID        Cloudflare account ID
    SUPABASE_URL         Supabase project URL
    SUPABASE_SERVICE_KEY Supabase service role key
"""

import argparse
import hashlib
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Configuration ─────────────────────────────────────────────────────────────

CF_API_TOKEN = os.getenv("CF_API_TOKEN", "")
CF_AUTH_EMAIL = os.getenv("CF_AUTH_EMAIL", "")
CF_ACCOUNT_ID = os.getenv("CF_ACCOUNT_ID", "4e65b8f97b6c2c3f485dcda82c179275")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

CF_API_BASE = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/images/v1"

ANALYSIS_FILE = Path("dedup_analysis.json")
PLAN_FILE = Path("dedup_plan.json")
REPORT_FILE = Path("dedup_report.txt")
BACKUP_FILE = Path("dedup_backup.json")
UNDO_FILE = Path("dedup_undo.sql")

DOWNLOAD_VARIANT = "public"
MAX_WORKERS = 10


# ── Cloudflare helpers ────────────────────────────────────────────────────────

def cf_headers():
    if CF_AUTH_EMAIL:
        return {"X-Auth-Key": CF_API_TOKEN, "X-Auth-Email": CF_AUTH_EMAIL}
    return {"Authorization": f"Bearer {CF_API_TOKEN}"}


def list_cloudflare_images() -> list[dict]:
    """Paginate through all Cloudflare images. Returns list of image objects."""
    all_images: list[dict] = []
    page = 1
    per_page = 100

    print("Fetching image list from Cloudflare...")
    while True:
        resp = requests.get(
            CF_API_BASE,
            headers=cf_headers(),
            params={"page": page, "per_page": per_page},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"  Error on page {page}: HTTP {resp.status_code}")
            break
        data = resp.json()
        if not data.get("success"):
            print(f"  API error: {data.get('errors')}")
            break
        batch = data.get("result", {}).get("images", [])
        if not batch:
            break
        all_images.extend(batch)
        print(f"  Page {page}: {len(batch)} images (total: {len(all_images)})")
        page += 1

    return all_images


def extract_account_hash(cf_images: list[dict]) -> str | None:
    """Extract the CDN account hash from variant URLs."""
    for img in cf_images:
        for url in img.get("variants", []):
            # URL format: https://imagedelivery.net/{ACCOUNT_HASH}/{IMAGE_ID}/{VARIANT}
            parts = url.split("/")
            if "imagedelivery.net" in url and len(parts) >= 6:
                return parts[3]
    return None


def build_cdn_url(account_hash: str, cf_id: str, variant: str = "public") -> str:
    return f"https://imagedelivery.net/{account_hash}/{cf_id}/{variant}"


def download_and_hash(url: str, session: requests.Session) -> tuple[str | None, int]:
    """Download image from URL, return (md5_hex, content_length). Returns (None, 0) on failure."""
    try:
        resp = session.get(url, timeout=60)
        if resp.status_code != 200:
            return None, 0
        content = resp.content
        md5 = hashlib.md5(content).hexdigest()
        return md5, len(content)
    except Exception:
        return None, 0


def delete_cloudflare_image(cf_id: str) -> bool:
    """Delete a single image from Cloudflare. Returns True on success."""
    resp = requests.delete(f"{CF_API_BASE}/{cf_id}", headers=cf_headers(), timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        return data.get("success", False)
    return False


# ── Supabase helpers ──────────────────────────────────────────────────────────

def sb_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def fetch_all_db_images() -> list[dict]:
    """Fetch all image records from Supabase."""
    all_rows: list[dict] = []
    offset = 0
    limit = 1000
    cols = (
        "image_id,cave_id,plan_id,file_path,rank,best_id,"
        "cloudflare_image_id,cloudflare_thumbnail_id,"
        "book_figure,book_page,plan_x_norm,plan_y_norm,"
        "subject,description,motifs,medium,photographer,"
        "default_priority,hide_plan_xy,thumbnail"
    )

    print("Fetching image records from Supabase...")
    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/images"
            f"?select={cols}&order=image_id&offset={offset}&limit={limit}"
        )
        resp = requests.get(url, headers=sb_headers())
        if resp.status_code != 200:
            print(f"  Error: HTTP {resp.status_code} — {resp.text[:200]}")
            sys.exit(1)
        rows = resp.json()
        if not rows:
            break
        all_rows.extend(rows)
        offset += limit

    print(f"  Fetched {len(all_rows)} records")
    return all_rows


def update_db_record(image_id: int, updates: dict) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/images?image_id=eq.{image_id}"
    resp = requests.patch(url, headers=sb_headers(), json=updates)
    return resp.status_code in (200, 204)


def delete_db_record(image_id: int) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/images?image_id=eq.{image_id}"
    resp = requests.delete(url, headers=sb_headers())
    return resp.status_code in (200, 204)


# ── Scoring ───────────────────────────────────────────────────────────────────

def score_record(rec: dict) -> tuple[int, int]:
    """
    Score a DB record for keeper selection.  Higher = more valuable.
    Returns (score, -image_id) so that ties break on lowest image_id.
    """
    s = 0
    if rec.get("book_figure"):
        s += 100
    if rec.get("book_page"):
        s += 50
    if rec.get("plan_x_norm") is not None:
        s += 30
    if rec.get("plan_id") is not None:
        s += 20
    if rec.get("rank") == 1:
        s += 10
    s += rec.get("default_priority", 0)
    return (s, -rec.get("image_id", 0))


# ── Phase 1: ANALYZE ─────────────────────────────────────────────────────────

def cmd_analyze(args):
    if not CF_API_TOKEN:
        sys.exit("Set CF_API_TOKEN environment variable")

    cf_images = list_cloudflare_images()
    if not cf_images:
        sys.exit("No images found in Cloudflare")

    print(f"\nTotal Cloudflare images: {len(cf_images)}")

    # Hash images — either from local files or CDN downloads
    hashes: dict[str, dict] = {}  # cf_id → {hash, content_length, filename}

    if args.local_dir:
        hashes = _hash_from_local(cf_images, Path(args.local_dir))
    else:
        hashes = _hash_from_cdn(cf_images)

    # Group by hash
    hash_groups: dict[str, list[dict]] = {}
    for cf_id, info in hashes.items():
        h = info["hash"]
        if h is None:
            continue
        hash_groups.setdefault(h, []).append({
            "cf_id": cf_id,
            "filename": info["filename"],
            "content_length": info["content_length"],
        })

    duplicate_groups = [
        {"hash": h, "count": len(imgs), "images": imgs}
        for h, imgs in hash_groups.items()
        if len(imgs) > 1
    ]
    duplicate_groups.sort(key=lambda g: g["count"], reverse=True)

    total_dupes = sum(g["count"] - 1 for g in duplicate_groups)
    analysis = {
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "total_cf_images": len(cf_images),
        "total_hashed": len([h for h in hashes.values() if h["hash"]]),
        "hash_failures": len([h for h in hashes.values() if h["hash"] is None]),
        "unique_images": len(hash_groups),
        "duplicate_groups": len(duplicate_groups),
        "total_duplicates": total_dupes,
        "groups": duplicate_groups,
    }

    ANALYSIS_FILE.write_text(json.dumps(analysis, indent=2))
    print(f"\n{'='*60}")
    print(f"Analysis complete")
    print(f"  Total images:      {analysis['total_cf_images']}")
    print(f"  Unique images:     {analysis['unique_images']}")
    print(f"  Duplicate groups:  {analysis['duplicate_groups']}")
    print(f"  Redundant copies:  {analysis['total_duplicates']}")
    print(f"  Hash failures:     {analysis['hash_failures']}")
    print(f"\nSaved to {ANALYSIS_FILE}")
    print(f"Next step: python dedup_cloudflare.py plan")


def _hash_from_local(cf_images: list[dict], local_dir: Path) -> dict[str, dict]:
    """Hash images using local files matched by filename."""
    print(f"\nHashing from local directory: {local_dir}")

    # Build filename → local path mapping
    local_files: dict[str, Path] = {}
    for p in local_dir.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
            local_files[p.name] = p

    print(f"  Found {len(local_files)} local image files")

    hashes: dict[str, dict] = {}
    matched = 0
    for img in cf_images:
        cf_id = img["id"]
        filename = img.get("filename", "")
        local_path = local_files.get(filename)

        if local_path and local_path.exists():
            content = local_path.read_bytes()
            md5 = hashlib.md5(content).hexdigest()
            hashes[cf_id] = {
                "hash": md5,
                "content_length": len(content),
                "filename": filename,
            }
            matched += 1
        else:
            hashes[cf_id] = {"hash": None, "content_length": 0, "filename": filename}

    print(f"  Matched and hashed: {matched}/{len(cf_images)}")
    return hashes


def _hash_from_cdn(cf_images: list[dict]) -> dict[str, dict]:
    """Hash images by downloading the variant from Cloudflare CDN."""
    account_hash = extract_account_hash(cf_images)
    if not account_hash:
        sys.exit("Could not determine CDN account hash from variant URLs")
    print(f"\nCDN account hash: {account_hash}")

    # Two-pass approach: HEAD requests first to group by Content-Length,
    # then only download groups that share a Content-Length.

    print(f"Pass 1: HEAD requests to get Content-Length ({len(cf_images)} images)...")
    size_map: dict[str, int] = {}  # cf_id → content_length
    filename_map: dict[str, str] = {}  # cf_id → filename
    session = requests.Session()

    def head_one(img: dict) -> tuple[str, int, str]:
        cf_id = img["id"]
        filename = img.get("filename", "")
        url = build_cdn_url(account_hash, cf_id, DOWNLOAD_VARIANT)
        try:
            resp = session.head(url, timeout=30, allow_redirects=True)
            cl = int(resp.headers.get("Content-Length", 0))
            return cf_id, cl, filename
        except Exception:
            return cf_id, 0, filename

    done = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(head_one, img): img for img in cf_images}
        for future in as_completed(futures):
            cf_id, cl, filename = future.result()
            size_map[cf_id] = cl
            filename_map[cf_id] = filename
            done += 1
            if done % 200 == 0:
                print(f"  HEAD: {done}/{len(cf_images)}")

    print(f"  HEAD: {done}/{len(cf_images)} done")

    # Group by Content-Length → only download those with shared sizes
    from collections import Counter
    size_counts = Counter(size_map.values())
    ids_to_download = {
        cf_id for cf_id, size in size_map.items()
        if size > 0 and size_counts[size] > 1
    }

    unique_count = sum(1 for cf_id, size in size_map.items() if size > 0 and size_counts[size] == 1)
    print(f"\n  Unique by size:    {unique_count}")
    print(f"  Need hash check:   {len(ids_to_download)}")

    # Initialize hashes: unique-by-size images get a hash based on size
    # (they're guaranteed unique so the exact hash doesn't matter for grouping)
    hashes: dict[str, dict] = {}
    for cf_id in size_map:
        size = size_map[cf_id]
        if cf_id not in ids_to_download:
            hashes[cf_id] = {
                "hash": f"unique_size_{size}_{cf_id}" if size > 0 else None,
                "content_length": size,
                "filename": filename_map.get(cf_id, ""),
            }

    if not ids_to_download:
        print("\nNo potential duplicates found by size. No downloads needed.")
        return hashes

    print(f"\nPass 2: Downloading {len(ids_to_download)} images for hash comparison...")
    done = 0

    def download_one(cf_id: str) -> tuple[str, str | None, int]:
        url = build_cdn_url(account_hash, cf_id, DOWNLOAD_VARIANT)
        md5, cl = download_and_hash(url, session)
        return cf_id, md5, cl

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(download_one, cf_id): cf_id for cf_id in ids_to_download}
        for future in as_completed(futures):
            cf_id, md5, cl = future.result()
            hashes[cf_id] = {
                "hash": md5,
                "content_length": cl,
                "filename": filename_map.get(cf_id, ""),
            }
            done += 1
            if done % 100 == 0:
                print(f"  Download: {done}/{len(ids_to_download)}")

    print(f"  Download: {done}/{len(ids_to_download)} done")
    return hashes


# ── Phase 2: PLAN ────────────────────────────────────────────────────────────

def cmd_plan(args):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")

    if not ANALYSIS_FILE.exists():
        sys.exit(f"{ANALYSIS_FILE} not found. Run 'analyze' first.")

    analysis = json.loads(ANALYSIS_FILE.read_text())
    groups = analysis["groups"]
    if not groups:
        print("No duplicate groups found. Nothing to plan.")
        return

    db_images = fetch_all_db_images()

    # Build cf_id → list of DB records
    cf_to_db: dict[str, list[dict]] = {}
    for rec in db_images:
        cf_id = rec.get("cloudflare_image_id")
        if cf_id:
            cf_to_db.setdefault(cf_id, []).append(rec)

    plan_groups: list[dict] = []
    auto_count = 0
    review_count = 0
    report_lines: list[str] = []

    report_lines.append("=" * 70)
    report_lines.append("DEDUPLICATION PLAN")
    report_lines.append(f"Generated: {datetime.now(timezone.utc).isoformat()}")
    report_lines.append(f"Duplicate groups: {len(groups)}")
    report_lines.append("=" * 70)
    report_lines.append("")

    for gi, group in enumerate(groups, 1):
        hash_val = group["hash"]
        cf_images_in_group = group["images"]

        # Collect all DB records that reference any CF image in this group
        all_records: list[dict] = []
        cf_ids_in_group: list[str] = []
        for cf_img in cf_images_in_group:
            cf_id = cf_img["cf_id"]
            cf_ids_in_group.append(cf_id)
            db_recs = cf_to_db.get(cf_id, [])
            for rec in db_recs:
                rec["_cf_id"] = cf_id
                rec["_cf_filename"] = cf_img["filename"]
                all_records.append(rec)

        if not all_records:
            # CF images with no DB records — orphans
            plan_groups.append({
                "group_index": gi,
                "hash": hash_val,
                "status": "orphan",
                "cf_ids": cf_ids_in_group,
                "keeper_cf_id": cf_ids_in_group[0],
                "delete_cf_ids": cf_ids_in_group[1:],
                "keeper_image_id": None,
                "delete_image_ids": [],
                "conflicts": [],
                "note": "No DB records reference these CF images",
            })
            auto_count += 1
            report_lines.append(f"Group {gi}: ORPHAN ({len(cf_ids_in_group)} CF images, no DB records)")
            report_lines.append(f"  Keep CF: {cf_ids_in_group[0]}")
            for d in cf_ids_in_group[1:]:
                report_lines.append(f"  Delete CF: {d}")
            report_lines.append("")
            continue

        # Score records and pick keeper
        scored = sorted(all_records, key=score_record, reverse=True)
        keeper = scored[0]
        duplicates = scored[1:]

        # Check for conflicts
        conflicts = []
        keeper_cave = keeper.get("cave_id")
        for dup in duplicates:
            if dup.get("cave_id") != keeper_cave:
                conflicts.append(
                    f"cave_id mismatch: keeper={keeper_cave} vs image_id={dup['image_id']} cave_id={dup['cave_id']}"
                )
            if dup.get("book_figure") and keeper.get("book_figure") and dup["book_figure"] != keeper["book_figure"]:
                conflicts.append(
                    f"book_figure conflict: keeper={keeper['book_figure']} vs image_id={dup['image_id']}={dup['book_figure']}"
                )

        status = "review" if conflicts else "auto"
        if conflicts:
            review_count += 1
        else:
            auto_count += 1

        keeper_cf = keeper["_cf_id"]
        delete_cf_ids = [cid for cid in cf_ids_in_group if cid != keeper_cf]
        delete_image_ids = [d["image_id"] for d in duplicates]

        plan_groups.append({
            "group_index": gi,
            "hash": hash_val,
            "status": status,
            "cf_ids": cf_ids_in_group,
            "keeper_cf_id": keeper_cf,
            "delete_cf_ids": delete_cf_ids,
            "keeper_image_id": keeper["image_id"],
            "keeper_file_path": keeper.get("file_path", ""),
            "keeper_score": score_record(keeper)[0],
            "delete_image_ids": delete_image_ids,
            "conflicts": conflicts,
            "records": [
                {
                    "image_id": r["image_id"],
                    "cf_id": r["_cf_id"],
                    "file_path": r.get("file_path", ""),
                    "cave_id": r.get("cave_id"),
                    "book_figure": r.get("book_figure"),
                    "book_page": r.get("book_page"),
                    "plan_x_norm": r.get("plan_x_norm"),
                    "rank": r.get("rank"),
                    "score": score_record(r)[0],
                    "role": "keeper" if r["image_id"] == keeper["image_id"] else "delete",
                }
                for r in scored
            ],
        })

        # Report
        report_lines.append(f"Group {gi}: {status.upper()} — {len(all_records)} DB records, {len(cf_ids_in_group)} CF images")
        for r in scored:
            role = "KEEP  " if r["image_id"] == keeper["image_id"] else "DELETE"
            bf = f" book_fig={r['book_figure']}" if r.get("book_figure") else ""
            bp = f" book_page={r['book_page']}" if r.get("book_page") else ""
            plan = " has_plan_xy" if r.get("plan_x_norm") is not None else ""
            report_lines.append(
                f"  [{role}] image_id={r['image_id']:>5}  cave={r.get('cave_id','?'):>3}"
                f"  score={score_record(r)[0]:>3}  {r.get('file_path', '')}{bf}{bp}{plan}"
            )
        if conflicts:
            for c in conflicts:
                report_lines.append(f"  ⚠ CONFLICT: {c}")
        report_lines.append("")

    # Summary
    plan = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_groups": len(plan_groups),
        "auto_merge": auto_count,
        "needs_review": review_count,
        "cf_images_to_delete": sum(len(g["delete_cf_ids"]) for g in plan_groups),
        "db_records_to_delete": sum(len(g["delete_image_ids"]) for g in plan_groups if g["status"] == "auto"),
        "groups": plan_groups,
    }

    PLAN_FILE.write_text(json.dumps(plan, indent=2))

    summary = [
        "",
        "=" * 70,
        "SUMMARY",
        "=" * 70,
        f"  Total duplicate groups:    {plan['total_groups']}",
        f"  Safe to auto-merge:        {plan['auto_merge']}",
        f"  Needs manual review:       {plan['needs_review']}",
        f"  CF images to delete:       {plan['cf_images_to_delete']}",
        f"  DB records to delete:      {plan['db_records_to_delete']} (auto-merge groups only)",
        "",
        "Review groups marked REVIEW before running execute.",
        "To approve a REVIEW group, edit dedup_plan.json and change its status to 'auto'.",
    ]
    report_lines.extend(summary)

    REPORT_FILE.write_text("\n".join(report_lines))

    print(f"\n{'='*60}")
    for line in summary:
        print(line)
    print(f"\nPlan saved to:   {PLAN_FILE}")
    print(f"Report saved to: {REPORT_FILE}")
    print(f"\nNext: review {REPORT_FILE}, then run:")
    print(f"  python dedup_cloudflare.py execute --confirm")


# ── Phase 3: EXECUTE ──────────────────────────────────────────────────────────

def cmd_execute(args):
    if not args.confirm:
        print("This will permanently delete images from Cloudflare and the database.")
        print("Add --confirm to proceed.")
        return

    if not CF_API_TOKEN:
        sys.exit("Set CF_API_TOKEN environment variable")
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")

    if not PLAN_FILE.exists():
        sys.exit(f"{PLAN_FILE} not found. Run 'plan' first.")

    plan = json.loads(PLAN_FILE.read_text())
    groups = plan["groups"]

    # Only process groups with status == 'auto'
    auto_groups = [g for g in groups if g["status"] == "auto"]
    review_groups = [g for g in groups if g["status"] == "review"]

    if review_groups:
        print(f"Skipping {len(review_groups)} group(s) that need manual review.")
        print("Edit dedup_plan.json to change their status to 'auto' after review.\n")

    if not auto_groups:
        print("No groups to process.")
        return

    # Backup affected DB records
    print("Backing up affected database records...")
    db_images = fetch_all_db_images()
    db_by_id = {r["image_id"]: r for r in db_images}

    all_affected_ids = set()
    for g in auto_groups:
        if g.get("keeper_image_id"):
            all_affected_ids.add(g["keeper_image_id"])
        for did in g.get("delete_image_ids", []):
            all_affected_ids.add(did)

    backup_records = [db_by_id[iid] for iid in all_affected_ids if iid in db_by_id]
    BACKUP_FILE.write_text(json.dumps(backup_records, indent=2, default=str))
    print(f"  Backed up {len(backup_records)} records to {BACKUP_FILE}")

    # Generate undo SQL
    undo_lines = [
        "-- Undo deduplication: re-insert deleted records",
        f"-- Generated: {datetime.now(timezone.utc).isoformat()}",
        "-- Run this to restore deleted records (CF images must be re-uploaded separately)\n",
        "BEGIN;\n",
    ]
    for rec in backup_records:
        if rec["image_id"] in {did for g in auto_groups for did in g.get("delete_image_ids", [])}:
            cols = []
            vals = []
            for k, v in rec.items():
                if k.startswith("_"):
                    continue
                cols.append(k)
                vals.append(_sql_val(v))
            undo_lines.append(
                f"INSERT INTO images ({', '.join(cols)}) VALUES ({', '.join(vals)}) ON CONFLICT (image_id) DO NOTHING;"
            )
    undo_lines.append("\nCOMMIT;\n")
    UNDO_FILE.write_text("\n".join(undo_lines))
    print(f"  Undo SQL saved to {UNDO_FILE}")

    # Execute
    print(f"\nProcessing {len(auto_groups)} groups...")
    cf_deleted = 0
    db_deleted = 0
    db_updated = 0
    errors = 0

    for g in auto_groups:
        gi = g["group_index"]
        keeper_id = g.get("keeper_image_id")
        keeper_cf = g["keeper_cf_id"]
        delete_ids = g.get("delete_image_ids", [])
        delete_cfs = g.get("delete_cf_ids", [])

        print(f"\n  Group {gi}: keep image_id={keeper_id} (CF {keeper_cf})")

        # 1. Merge metadata from duplicates into keeper
        if keeper_id and keeper_id in db_by_id:
            keeper_rec = db_by_id[keeper_id]
            merge_fields = {}
            for did in delete_ids:
                dup_rec = db_by_id.get(did)
                if not dup_rec:
                    continue
                # Fill keeper's NULL fields with duplicate's non-NULL values
                for field in ("book_figure", "book_page", "plan_x_norm", "plan_y_norm",
                              "plan_x_px", "plan_y_px", "plan_id", "photographer",
                              "subject", "description", "motifs", "thumbnail",
                              "cloudflare_thumbnail_id"):
                    if keeper_rec.get(field) is None and dup_rec.get(field) is not None:
                        if field not in merge_fields:
                            merge_fields[field] = dup_rec[field]

            if merge_fields:
                if update_db_record(keeper_id, merge_fields):
                    print(f"    Merged fields into keeper: {list(merge_fields.keys())}")
                    db_updated += 1
                else:
                    print(f"    ERROR merging into keeper image_id={keeper_id}")
                    errors += 1

        # 2. Redirect best_id references pointing to duplicates → keeper
        for did in delete_ids:
            url = (
                f"{SUPABASE_URL}/rest/v1/images"
                f"?best_id=eq.{did}&select=image_id"
            )
            resp = requests.get(url, headers=sb_headers())
            if resp.status_code == 200:
                referrers = resp.json()
                for ref in referrers:
                    ref_id = ref["image_id"]
                    if ref_id != keeper_id and ref_id not in delete_ids:
                        if update_db_record(ref_id, {"best_id": keeper_id}):
                            print(f"    Redirected best_id: image_id={ref_id} → {keeper_id}")
                            db_updated += 1

        # 3. Delete duplicate DB records
        for did in delete_ids:
            if delete_db_record(did):
                print(f"    Deleted DB record image_id={did}")
                db_deleted += 1
            else:
                print(f"    ERROR deleting DB record image_id={did}")
                errors += 1

        # 4. Delete duplicate CF images
        for cf_id in delete_cfs:
            if delete_cloudflare_image(cf_id):
                print(f"    Deleted CF image {cf_id}")
                cf_deleted += 1
            else:
                print(f"    ERROR deleting CF image {cf_id}")
                errors += 1

        time.sleep(0.3)  # rate limit

    print(f"\n{'='*60}")
    print("Execution complete")
    print(f"  DB records updated:  {db_updated}")
    print(f"  DB records deleted:  {db_deleted}")
    print(f"  CF images deleted:   {cf_deleted}")
    print(f"  Errors:              {errors}")
    print(f"\n  Backup: {BACKUP_FILE}")
    print(f"  Undo:   {UNDO_FILE}")


def _sql_val(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command")

    p_analyze = sub.add_parser("analyze", help="Phase 1: hash images, find duplicates")
    p_analyze.add_argument(
        "--local-dir", default=None,
        help="Hash local files instead of downloading from CDN",
    )
    p_analyze.add_argument(
        "--workers", type=int, default=MAX_WORKERS,
        help=f"Parallel download workers (default: {MAX_WORKERS})",
    )

    sub.add_parser("plan", help="Phase 2: generate dedup plan and report")

    p_exec = sub.add_parser("execute", help="Phase 3: apply the plan")
    p_exec.add_argument(
        "--confirm", action="store_true",
        help="Required flag to actually execute changes",
    )

    args = parser.parse_args()

    if args.command == "analyze":
        cmd_analyze(args)
    elif args.command == "plan":
        cmd_plan(args)
    elif args.command == "execute":
        cmd_execute(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
