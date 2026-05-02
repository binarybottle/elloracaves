#!/usr/bin/env python3
"""
Cloudflare Images Bulk Upload

Recursively uploads all image files from a directory tree to Cloudflare Images API.

Usage:
    python upload_cloudflare.py <directory> <api_token> [--skip-log upload_log.csv]

Example:
    python upload_cloudflare.py ./images RWUGNIHKQloCEfkhttgCcaKnb_4bSSmeof-VPgfp
    python upload_cloudflare.py ./images <token> --skip-log prior_upload_log.csv
    python upload_cloudflare.py ./images <global_api_key> --auth-email you@example.com

Arguments:
    directory    : Root directory containing images to upload
    api_token    : Cloudflare API Token (Bearer) or Global API Key
    --auth-email : Cloudflare account email — use with a Global API Key
    --skip-log   : Path to a prior upload_log.csv; any file with status SUCCESS
                   will be skipped to avoid duplicate uploads

Output:
    Creates two log files:
    - upload_log.csv: Complete record of all uploads with timestamps and IDs
    - upload_errors.csv: Failed uploads with error messages
"""

import argparse
import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Tuple, List, Set

import requests


ACCOUNT_ID = os.getenv("CF_ACCOUNT_ID", "")
if not ACCOUNT_ID:
    sys.exit("Error: CF_ACCOUNT_ID environment variable is required")
API_ENDPOINT = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/images/v1"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"}
RATE_LIMIT_DELAY = 0.3  # seconds between uploads (1200 per 5 min = 4/sec max)


def load_already_uploaded(log_path: Path) -> Set[str]:
    """
    Read a prior upload_log.csv and return the set of filenames (basenames)
    that were successfully uploaded, so they can be skipped on re-run.

    Args:
        log_path: Path to an existing upload_log.csv

    Returns:
        Set of filename strings (basename only) that have status SUCCESS.
    """
    uploaded: Set[str] = set()
    if not log_path.exists():
        return uploaded
    with open(log_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("status") == "SUCCESS" and row.get("file"):
                uploaded.add(Path(row["file"]).name)
    print(f"Loaded {len(uploaded)} already-uploaded filenames from {log_path}")
    return uploaded


def find_images(directory: Path) -> List[Path]:
    """
    Recursively find all image files in directory tree.
    
    Args:
        directory: Root directory to search
        
    Returns:
        List of Path objects for all image files found
        
    Example:
        >>> images = find_images(Path("./photos"))
        >>> len(images)
        150
    """
    images = []
    for ext in IMAGE_EXTENSIONS:
        images.extend(directory.rglob(f"*{ext}"))
        images.extend(directory.rglob(f"*{ext.upper()}"))
    return sorted(images)


def upload_image(
    file_path: Path,
    auth_headers: dict,
    timeout: int = 120
) -> Tuple[bool, str, str]:
    """
    Upload a single image to Cloudflare Images.

    Args:
        file_path: Path to image file
        auth_headers: Authentication headers (Bearer token or Global API Key)
        timeout: Request timeout in seconds

    Returns:
        Tuple of (success, image_id, error_message)
        - success: True if upload succeeded
        - image_id: Cloudflare image ID if successful, empty string otherwise
        - error_message: Error message if failed, empty string otherwise
    """
    try:
        with open(file_path, "rb") as f:
            files = {"file": (file_path.name, f)}

            response = requests.post(
                API_ENDPOINT,
                files=files,
                headers=auth_headers,
                timeout=timeout
            )
            
            data = None
            try:
                data = response.json()
            except Exception:
                pass

            if response.status_code == 200 and data and data.get("success"):
                image_id = data["result"]["id"]
                return True, image_id, ""
            else:
                if data:
                    errors = data.get("errors", [])
                    error_msg = errors[0].get("message", "Unknown error") if errors else "Unknown error"
                else:
                    error_msg = response.text[:200] or f"HTTP {response.status_code}"
                return False, "", f"HTTP {response.status_code}: {error_msg}"
                
    except requests.exceptions.Timeout:
        return False, "", "Request timeout"
    except requests.exceptions.ConnectionError:
        return False, "", "Connection error"
    except Exception as e:
        return False, "", str(e)


def main():
    """
    Main execution function for bulk image upload.
    
    Parses command line arguments, finds images, uploads them with progress
    tracking, and generates log files.
    """
    parser = argparse.ArgumentParser(
        description="Upload images to Cloudflare Images",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument("directory", type=Path, help="Directory containing images")
    parser.add_argument("api_token", help="Cloudflare API Token or Global API Key")
    parser.add_argument(
        "--auth-email", default=None, metavar="EMAIL",
        help="Cloudflare account email — required when using a Global API Key instead of an API Token",
    )
    parser.add_argument(
        "--skip-log", type=Path, default=None, metavar="upload_log.csv",
        help="Path to a prior upload_log.csv; files with status SUCCESS will be skipped",
    )
    
    args = parser.parse_args()
    
    if not args.directory.is_dir():
        print(f"Error: '{args.directory}' is not a directory", file=sys.stderr)
        sys.exit(1)

    if args.auth_email:
        auth_headers = {"X-Auth-Email": args.auth_email, "X-Auth-Key": args.api_token}
        print(f"Auth: Global API Key for {args.auth_email}")
    else:
        auth_headers = {"Authorization": f"Bearer {args.api_token}"}
        print("Auth: API Token (Bearer)")

    already_uploaded = load_already_uploaded(args.skip_log) if args.skip_log else set()

    print(f"Scanning for images in: {args.directory}")
    images = find_images(args.directory)

    if not images:
        print("No images found")
        sys.exit(0)

    total = len(images)
    skip_count = sum(1 for p in images if p.name in already_uploaded)
    print(f"Found {total} image(s), {skip_count} already uploaded (will skip)\n")

    success_count = 0
    failed_count = 0
    
    with open("upload_log.csv", "w", newline="") as log_file, \
         open("upload_errors.csv", "w", newline="") as error_file:
        
        log_writer = csv.writer(log_file)
        error_writer = csv.writer(error_file)
        
        log_writer.writerow(["timestamp", "status", "file", "image_id", "error"])
        error_writer.writerow(["timestamp", "file", "error"])
        
        for idx, image_path in enumerate(images, 1):
            relative_path = image_path.relative_to(args.directory)
            print(f"[{idx}/{total}] {relative_path} ... ", end="", flush=True)

            if image_path.name in already_uploaded:
                print("skipped (already uploaded)")
                continue

            success, image_id, error_msg = upload_image(image_path, auth_headers)
            timestamp = datetime.now().isoformat()

            if success:
                print(f"✓ {image_id}")
                log_writer.writerow([timestamp, "SUCCESS", relative_path, image_id, ""])
                success_count += 1
            else:
                print(f"✗ {error_msg}")
                log_writer.writerow([timestamp, "FAILED", relative_path, "", error_msg])
                error_writer.writerow([timestamp, relative_path, error_msg])
                failed_count += 1
            
            log_file.flush()
            error_file.flush()
            
            time.sleep(RATE_LIMIT_DELAY)
    
    print("\n" + "=" * 40)
    print("Upload Complete")
    print("=" * 40)
    print(f"Total:      {total}")
    print(f"Skipped:    {skip_count}")
    print(f"Success:    {success_count}")
    print(f"Failed:     {failed_count}")
    print(f"\nLogs:")
    print(f"  - upload_log.csv")
    print(f"  - upload_errors.csv")


if __name__ == "__main__":
    main()