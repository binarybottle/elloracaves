#!/usr/bin/env python3
"""
Upload 3D models (GLB) and poster images to Cloudflare R2, then generate
SQL to populate the models_3d table.

File naming convention:
    c{cave_id}_{title-slug}.glb           — model file
    c{cave_id}_{title-slug}.jpg            — optional poster image
    c{cave_id}_floor{N}_{title-slug}.glb   — with floor number (resolves plan_id)

Examples:
    c16_entrance-hall.glb
    c16_entrance-hall.jpg        (poster for the above)
    c10_floor2_main-shrine.glb
    c29_ceiling-detail.glb

Usage:
    python upload_3d_models.py <directory> \\
        --r2-bucket <bucket-name> \\
        --r2-access-key <access-key-id> \\
        --r2-secret-key <secret-access-key> \\
        --r2-endpoint <account-endpoint-url> \\
        --r2-public-url <public-bucket-url> \\
        [--cf-api-token <token>] \\
        [--cf-account-id <id>] \\
        [--photographer "Arno Klein"] \\
        [--dry-run]

The script will:
  1. Scan the directory for .glb files (and matching .jpg posters)
  2. Parse cave_id, floor, and title from each filename
  3. Upload .glb files to Cloudflare R2
  4. Upload .jpg posters to Cloudflare Images (if --cf-api-token provided),
     otherwise upload to R2 alongside the .glb
  5. Generate an INSERT SQL file (models_3d_insert.sql)

Environment variables (override CLI args):
    R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT_URL,
    R2_BUCKET, R2_PUBLIC_URL, CF_API_TOKEN, CF_ACCOUNT_ID
"""

import argparse
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

import boto3
import requests


ACCOUNT_ID = os.getenv("CF_ACCOUNT_ID", "4e65b8f97b6c2c3f485dcda82c179275")
CF_IMAGES_ENDPOINT = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/images/v1"

FILENAME_PATTERN = re.compile(
    r"^c(\d+)"              # cave_id
    r"(?:_floor(\d+))?"     # optional floor number
    r"_(.+)"                # title slug
    r"\.(glb|jpg|jpeg|png)$",
    re.IGNORECASE,
)


def parse_filename(filename: str) -> Optional[dict]:
    match = FILENAME_PATTERN.match(filename)
    if not match:
        return None
    cave_id = int(match.group(1))
    floor_num = int(match.group(2)) if match.group(2) else None
    slug = match.group(3)
    ext = match.group(4).lower()

    title = slug.replace("-", " ").replace("_", " ").title()

    return {
        "cave_id": cave_id,
        "floor": floor_num,
        "title": title,
        "slug": slug,
        "ext": ext,
    }


def upload_to_r2(s3_client, bucket: str, file_path: Path, key: str) -> bool:
    content_types = {
        ".glb": "model/gltf-binary",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }
    content_type = content_types.get(file_path.suffix.lower(), "application/octet-stream")

    try:
        s3_client.upload_file(
            str(file_path),
            bucket,
            key,
            ExtraArgs={"ContentType": content_type},
        )
        return True
    except Exception as e:
        print(f"  R2 upload error: {e}")
        return False


def upload_poster_to_cf_images(file_path: Path, api_token: str) -> Optional[str]:
    try:
        headers = {"Authorization": f"Bearer {api_token}"}
        with open(file_path, "rb") as f:
            resp = requests.post(
                CF_IMAGES_ENDPOINT,
                headers=headers,
                files={"file": (file_path.name, f)},
                timeout=120,
            )
        data = resp.json()
        if resp.status_code == 200 and data.get("success"):
            return data["result"]["id"]
        else:
            errors = data.get("errors", [])
            msg = errors[0].get("message", "Unknown") if errors else resp.text[:200]
            print(f"  CF Images error: {msg}")
            return None
    except Exception as e:
        print(f"  CF Images error: {e}")
        return None


def generate_sql(models: list, output_path: Path):
    lines = [
        "-- Auto-generated INSERT statements for models_3d",
        "-- Generated: " + datetime.now().isoformat(),
        "",
        "BEGIN;",
        "",
    ]

    for m in models:
        cave_id = m["cave_id"]
        plan_clause = "NULL"
        if m.get("floor") is not None:
            plan_clause = (
                f"(SELECT plan_id FROM plans "
                f"WHERE cave_id = {cave_id} AND plan_floor = {m['floor']} LIMIT 1)"
            )

        title_escaped = m["title"].replace("'", "''")
        file_url = m["file_url"]
        poster_url = m.get("poster_url") or ""
        poster_clause = f"'{poster_url}'" if poster_url else "NULL"
        file_size = m.get("file_size") or "NULL"
        photographer = m.get("photographer", "")
        photographer_clause = f"'{photographer}'" if photographer else "NULL"

        lines.append(
            f"INSERT INTO models_3d "
            f"(cave_id, plan_id, title, file_url, poster_url, file_size, photographer) "
            f"VALUES ("
            f"{cave_id}, {plan_clause}, '{title_escaped}', "
            f"'{file_url}', {poster_clause}, {file_size}, {photographer_clause}"
            f");"
        )

    lines.extend(["", "COMMIT;", ""])
    output_path.write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(
        description="Upload 3D models to Cloudflare R2 and generate DB insert SQL",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("directory", type=Path, help="Directory containing .glb (and .jpg) files")
    parser.add_argument("--r2-bucket", default=os.getenv("R2_BUCKET", ""), help="R2 bucket name")
    parser.add_argument("--r2-access-key", default=os.getenv("R2_ACCESS_KEY_ID", ""), help="R2 access key ID")
    parser.add_argument("--r2-secret-key", default=os.getenv("R2_SECRET_ACCESS_KEY", ""), help="R2 secret access key")
    parser.add_argument("--r2-endpoint", default=os.getenv("R2_ENDPOINT_URL", ""), help="R2 endpoint URL (e.g. https://<account>.r2.cloudflarestorage.com)")
    parser.add_argument("--r2-public-url", default=os.getenv("R2_PUBLIC_URL", ""), help="Public URL prefix for R2 objects (e.g. https://models.elloracaves.org)")
    parser.add_argument("--cf-api-token", default=os.getenv("CF_API_TOKEN", ""), help="Cloudflare API token for uploading poster images to CF Images")
    parser.add_argument("--cf-account-id", default=ACCOUNT_ID, help="Cloudflare account ID")
    parser.add_argument("--photographer", default="Arno Klein", help="Default photographer name")
    parser.add_argument("--dry-run", action="store_true", help="Parse files and show what would be uploaded without uploading")

    args = parser.parse_args()

    if not args.directory.is_dir():
        print(f"Error: '{args.directory}' is not a directory", file=sys.stderr)
        sys.exit(1)

    if not args.dry_run and (not args.r2_bucket or not args.r2_access_key or not args.r2_secret_key or not args.r2_endpoint):
        print("Error: R2 credentials required (--r2-bucket, --r2-access-key, --r2-secret-key, --r2-endpoint)", file=sys.stderr)
        print("  Use --dry-run to preview without uploading.", file=sys.stderr)
        sys.exit(1)

    glb_files = sorted(args.directory.rglob("*.glb"))
    if not glb_files:
        print("No .glb files found.")
        sys.exit(0)

    print(f"Found {len(glb_files)} .glb file(s) in {args.directory}\n")

    # Build model list
    models = []
    for glb_path in glb_files:
        parsed = parse_filename(glb_path.name)
        if not parsed:
            print(f"  SKIP (bad name): {glb_path.name}")
            print(f"         Expected: c{{cave_id}}_{{title-slug}}.glb")
            continue

        poster_path = None
        for ext in [".jpg", ".jpeg", ".png"]:
            candidate = glb_path.with_suffix(ext)
            if candidate.exists():
                poster_path = candidate
                break

        models.append({
            "glb_path": glb_path,
            "poster_path": poster_path,
            "cave_id": parsed["cave_id"],
            "floor": parsed["floor"],
            "title": parsed["title"],
            "slug": parsed["slug"],
            "photographer": args.photographer,
            "file_size": glb_path.stat().st_size,
        })

    if not models:
        print("No valid model files found.")
        sys.exit(0)

    print(f"\nParsed {len(models)} model(s):\n")
    for m in models:
        floor_str = f", floor {m['floor']}" if m["floor"] else ""
        poster_str = f" + poster {m['poster_path'].name}" if m["poster_path"] else ""
        size_mb = m["file_size"] / (1024 * 1024)
        print(f"  Cave {m['cave_id']}{floor_str}: \"{m['title']}\" ({size_mb:.1f} MB){poster_str}")

    if args.dry_run:
        print("\n--dry-run: nothing uploaded.")
        sys.exit(0)

    # Set up R2 client
    s3 = boto3.client(
        "s3",
        endpoint_url=args.r2_endpoint,
        aws_access_key_id=args.r2_access_key,
        aws_secret_access_key=args.r2_secret_key,
        region_name="auto",
    )

    public_base = args.r2_public_url.rstrip("/")
    use_cf_images = bool(args.cf_api_token)

    print(f"\nUploading to R2 bucket: {args.r2_bucket}")
    if use_cf_images:
        print("Posters will be uploaded to Cloudflare Images")
    else:
        print("Posters will be uploaded to R2 (no CF API token provided)")
    print()

    for idx, m in enumerate(models, 1):
        glb_key = f"3d/{m['glb_path'].name}"
        print(f"[{idx}/{len(models)}] {m['glb_path'].name} -> {glb_key} ... ", end="", flush=True)

        ok = upload_to_r2(s3, args.r2_bucket, m["glb_path"], glb_key)
        if not ok:
            print("FAILED")
            continue
        print("OK")

        m["file_url"] = f"{public_base}/{glb_key}"

        if m["poster_path"]:
            if use_cf_images:
                print(f"     poster -> Cloudflare Images ... ", end="", flush=True)
                cf_id = upload_poster_to_cf_images(m["poster_path"], args.cf_api_token)
                if cf_id:
                    cf_account = args.cf_account_id
                    m["poster_url"] = f"https://imagedelivery.net/{cf_account}/{cf_id}/public"
                    print(f"OK ({cf_id})")
                else:
                    print("FAILED")
            else:
                poster_key = f"3d/{m['poster_path'].name}"
                print(f"     poster -> {poster_key} ... ", end="", flush=True)
                ok = upload_to_r2(s3, args.r2_bucket, m["poster_path"], poster_key)
                if ok:
                    m["poster_url"] = f"{public_base}/{poster_key}"
                    print("OK")
                else:
                    print("FAILED")

        time.sleep(0.2)

    uploaded = [m for m in models if "file_url" in m]
    sql_path = Path("models_3d_insert.sql")
    generate_sql(uploaded, sql_path)

    print(f"\n{'=' * 50}")
    print(f"Upload complete: {len(uploaded)}/{len(models)} models")
    print(f"SQL file: {sql_path}")
    print(f"Run in Supabase SQL Editor to populate the database.")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
