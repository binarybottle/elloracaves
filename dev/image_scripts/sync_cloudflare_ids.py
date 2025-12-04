#!/usr/bin/env python3
"""
Sync Cloudflare Images IDs to Supabase database.

Fetches all images from Cloudflare Images API, matches them to database
records by filename, and updates the cloudflare_image_id column.

Usage:
    python scripts/sync_cloudflare_ids.py

Environment variables:
    CF_API_TOKEN: Cloudflare API token
    CF_ACCOUNT_ID: Cloudflare account ID
    SUPABASE_URL: Supabase project URL
    SUPABASE_SERVICE_KEY: Supabase service role key
"""

import os
import sys
import requests

# Cloudflare credentials
CF_API_TOKEN = os.getenv('CF_API_TOKEN', 'Kddf420sZIITUmQLpOkWjZ603r2hNPE-1dGyX_Mw')
CF_ACCOUNT_ID = os.getenv('CF_ACCOUNT_ID', '4e65b8f97b6c2c3f485dcda82c179275')

# Supabase credentials - update these
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')


def fetch_cloudflare_images():
    """Fetch all images from Cloudflare Images API."""
    images = []
    page = 1
    per_page = 100
    
    print("Fetching images from Cloudflare...")
    
    while True:
        url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/images/v1"
        headers = {
            "Authorization": f"Bearer {CF_API_TOKEN}",
            "Content-Type": "application/json"
        }
        params = {
            "page": page,
            "per_page": per_page
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"Error fetching images: {response.status_code}")
            print(response.text)
            break
            
        data = response.json()
        
        if not data.get('success'):
            print(f"API error: {data.get('errors')}")
            break
            
        batch = data.get('result', {}).get('images', [])
        if not batch:
            break
            
        images.extend(batch)
        print(f"  Fetched page {page}: {len(batch)} images (total: {len(images)})")
        
        page += 1
        
    return images


def create_filename_mapping(cf_images):
    """Create a mapping of filename -> cloudflare_id."""
    mapping = {}
    
    for img in cf_images:
        cf_id = img.get('id')
        filename = img.get('filename', '')
        
        if filename and cf_id:
            # Store just the filename without path
            mapping[filename] = cf_id
            
    return mapping


def generate_update_sql(cf_mapping):
    """Generate SQL UPDATE statements."""
    sql_lines = ["-- Update cloudflare_image_id based on filename matching\n"]
    sql_lines.append("BEGIN;\n\n")
    
    for filename, cf_id in cf_mapping.items():
        # Escape single quotes in filename
        safe_filename = filename.replace("'", "''")
        sql_lines.append(
            f"UPDATE images SET cloudflare_image_id = '{cf_id}' "
            f"WHERE file_path LIKE '%{safe_filename}';\n"
        )
    
    sql_lines.append("\nCOMMIT;\n")
    
    return ''.join(sql_lines)


def update_via_supabase(cf_mapping):
    """Update database directly via Supabase API."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Supabase credentials not set. Generating SQL file instead...")
        return False
    
    from supabase import create_client
    
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    updated = 0
    errors = 0
    
    for filename, cf_id in cf_mapping.items():
        try:
            # Update records where file_path ends with this filename
            result = client.table('images').update({
                'cloudflare_image_id': cf_id
            }).like('file_path', f'%{filename}').execute()
            
            if result.data:
                updated += len(result.data)
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  Error updating {filename}: {e}")
    
    print(f"Updated {updated} records, {errors} errors")
    return True


def main():
    print("=" * 50)
    print("Cloudflare Images to Supabase Sync")
    print("=" * 50)
    
    # Fetch all images from Cloudflare
    cf_images = fetch_cloudflare_images()
    print(f"\nTotal images in Cloudflare: {len(cf_images)}")
    
    if not cf_images:
        print("No images found. Check your API credentials.")
        return
    
    # Create filename -> ID mapping
    cf_mapping = create_filename_mapping(cf_images)
    print(f"Images with filenames: {len(cf_mapping)}")
    
    # Show sample
    print("\nSample mappings:")
    for i, (filename, cf_id) in enumerate(list(cf_mapping.items())[:5]):
        print(f"  {filename} -> {cf_id}")
    
    # Try to update via Supabase API
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        print("\nUpdating Supabase...")
        update_via_supabase(cf_mapping)
    else:
        # Generate SQL file
        sql = generate_update_sql(cf_mapping)
        output_file = "scripts/update_cloudflare_ids.sql"
        with open(output_file, 'w') as f:
            f.write(sql)
        print(f"\nGenerated SQL file: {output_file}")
        print(f"Run this in psql to update the database:")
        print(f"  psql 'YOUR_CONNECTION_STRING' -f {output_file}")


if __name__ == "__main__":
    main()

