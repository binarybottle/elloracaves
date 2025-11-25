#!/usr/bin/env python3
"""
Generate thumbnails for Ellora Caves images.
Creates 300px thumbnails maintaining the same directory structure.
"""

from PIL import Image
import os
from pathlib import Path

# Directories
SOURCE_DIR = Path("images/caves_1200px")
THUMB_DIR = Path("images/caves_thumbs")
THUMB_SIZE = (300, 300)

def generate_thumbnails():
    """Generate thumbnails maintaining directory structure"""
    
    total = 0
    created = 0
    skipped = 0
    errors = 0
    
    # Walk through all subdirectories
    for cave_dir in sorted(SOURCE_DIR.iterdir()):
        if not cave_dir.is_dir():
            continue
            
        # Create corresponding thumbnail subdirectory
        thumb_cave_dir = THUMB_DIR / cave_dir.name
        thumb_cave_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\nProcessing {cave_dir.name}...")
        
        # Process each image in the cave directory
        for img_path in sorted(cave_dir.glob("*.jpg")) + sorted(cave_dir.glob("*.JPG")):
            total += 1
            
            # Create corresponding path in thumbs directory (same structure)
            thumb_path = thumb_cave_dir / img_path.name
            
            # Skip if thumbnail already exists
            if thumb_path.exists():
                skipped += 1
                continue
            
            try:
                # Open and resize image
                with Image.open(img_path) as img:
                    # Convert to RGB if necessary (handles RGBA, etc.)
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Create thumbnail (maintains aspect ratio)
                    img.thumbnail(THUMB_SIZE, Image.Resampling.LANCZOS)
                    
                    # Save thumbnail with optimization
                    img.save(thumb_path, "JPEG", quality=85, optimize=True)
                    
                    created += 1
                    if created % 100 == 0:
                        print(f"  Created {created} thumbnails...")
                    
            except Exception as e:
                print(f"  ERROR processing {img_path.name}: {e}")
                errors += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Thumbnail Generation Complete!")
    print(f"{'='*60}")
    print(f"Total images found: {total}")
    print(f"Thumbnails created: {created}")
    print(f"Already existed: {skipped}")
    print(f"Errors: {errors}")
    print(f"\nThumbnails saved with subdirectories in: {THUMB_DIR}")
    print(f"\nExample structure:")
    print(f"  {SOURCE_DIR}/c1/image.jpg  →  {THUMB_DIR}/c1/image.jpg")

if __name__ == "__main__":
    generate_thumbnails()
