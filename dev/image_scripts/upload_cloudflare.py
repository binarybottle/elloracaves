#!/usr/bin/env python3
"""
Cloudflare Images Bulk Upload

Recursively uploads all image files from a directory tree to Cloudflare Images API.

Usage:
    python upload_cloudflare.py <directory> <api_token>

Example:
    python upload_cloudflare.py ./images RWUGNIHKQloCEfkhttgCcaKnb_4bSSmeof-VPgfp

Arguments:
    directory  : Root directory containing images to upload
    api_token  : Cloudflare API token with Images write permission

Output:
    Creates two log files:
    - upload_log.csv: Complete record of all uploads with timestamps and IDs
    - upload_errors.csv: Failed uploads with error messages
"""

import argparse
import csv
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Tuple, List

import requests


ACCOUNT_ID = "4e65b8f97b6c2c3f485dcda82c179275"
API_ENDPOINT = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/images/v1"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"}
RATE_LIMIT_DELAY = 0.3  # seconds between uploads (1200 per 5 min = 4/sec max)


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
    api_token: str,
    timeout: int = 120
) -> Tuple[bool, str, str]:
    """
    Upload a single image to Cloudflare Images.
    
    Args:
        file_path: Path to image file
        api_token: Cloudflare API token
        timeout: Request timeout in seconds
        
    Returns:
        Tuple of (success, image_id, error_message)
        - success: True if upload succeeded
        - image_id: Cloudflare image ID if successful, empty string otherwise
        - error_message: Error message if failed, empty string otherwise
        
    Example:
        >>> success, img_id, error = upload_image(
        ...     Path("photo.jpg"), 
        ...     "my_token"
        ... )
        >>> if success:
        ...     print(f"Uploaded: {img_id}")
    """
    try:
        with open(file_path, "rb") as f:
            files = {"file": (file_path.name, f)}
            headers = {"Authorization": f"Bearer {api_token}"}
            
            response = requests.post(
                API_ENDPOINT,
                files=files,
                headers=headers,
                timeout=timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    image_id = data["result"]["id"]
                    return True, image_id, ""
                else:
                    errors = data.get("errors", [])
                    error_msg = errors[0].get("message", "Unknown error") if errors else "Unknown error"
                    return False, "", error_msg
            else:
                return False, "", f"HTTP {response.status_code}"
                
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
    parser.add_argument("api_token", help="Cloudflare API token")
    
    args = parser.parse_args()
    
    if not args.directory.is_dir():
        print(f"Error: '{args.directory}' is not a directory", file=sys.stderr)
        sys.exit(1)
    
    print(f"Scanning for images in: {args.directory}")
    images = find_images(args.directory)
    
    if not images:
        print("No images found")
        sys.exit(0)
    
    total = len(images)
    print(f"Found {total} image(s)\n")
    
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
            
            success, image_id, error_msg = upload_image(image_path, args.api_token)
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
    print(f"Success:    {success_count}")
    print(f"Failed:     {failed_count}")
    print(f"\nLogs:")
    print(f"  - upload_log.csv")
    print(f"  - upload_errors.csv")


if __name__ == "__main__":
    main()