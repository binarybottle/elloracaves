#!/usr/bin/env python3
"""
Recalibrate image coordinates based on actual floor plan dimensions.

This script:
1. Finds the actual dimensions of each floor plan image
2. Uses pixel coordinates (plan_x_num, plan_y_num) to recalculate normalized values
3. Updates the database with corrected normalized coordinates (0-1 range)
"""

import psycopg2
from PIL import Image
from pathlib import Path

# Database connection
conn = psycopg2.connect("dbname=elloracaves user=arno")
cur = conn.cursor()

# Plans directory
PLANS_DIR = Path("images/plans")

print("="*80)
print("COORDINATE RECALIBRATION SCRIPT")
print("="*80)

# Step 1: Get actual dimensions of all floor plan images
print("\nStep 1: Reading actual floor plan dimensions...")
plan_dimensions = {}

cur.execute("""
    SELECT "plan_ID", "plan_cave_ID", plan_floor, plan_image, plan_width, plan_height
    FROM plans
    ORDER BY "plan_cave_ID", plan_floor
""")

plans = cur.fetchall()

for plan_id, cave_id, floor, plan_image, db_width, db_height in plans:
    plan_path = PLANS_DIR / plan_image
    
    if plan_path.exists():
        try:
            with Image.open(plan_path) as img:
                actual_width, actual_height = img.size
                plan_dimensions[plan_id] = {
                    'cave_id': cave_id,
                    'floor': floor,
                    'image': plan_image,
                    'actual_width': actual_width,
                    'actual_height': actual_height,
                    'db_width': db_width,
                    'db_height': db_height
                }
                
                if actual_width != db_width or actual_height != db_height:
                    print(f"  ⚠️  Plan {plan_id} (Cave {cave_id} Floor {floor}): "
                          f"DB says {db_width}x{db_height}, actual is {actual_width}x{actual_height}")
                else:
                    print(f"  ✓ Plan {plan_id} (Cave {cave_id} Floor {floor}): {actual_width}x{actual_height}")
        except Exception as e:
            print(f"  ✗ Error reading {plan_image}: {e}")
    else:
        print(f"  ✗ Plan image not found: {plan_image}")

# Step 2: Recalibrate coordinates
print("\nStep 2: Recalibrating image coordinates...")

total_images = 0
updated = 0
no_pixel_coords = 0
out_of_range_fixed = 0
errors = 0

for plan_id, dims in plan_dimensions.items():
    # Get all images for this plan with pixel coordinates
    cur.execute("""
        SELECT "image_ID", image_file, 
               image_plan_x_num, image_plan_y_num,
               image_plan_x_norm, image_plan_y_norm
        FROM images
        WHERE "image_plan_ID" = %s
        AND image_rank = 1
        AND image_plan_x_num IS NOT NULL
        AND image_plan_y_num IS NOT NULL
    """, (plan_id,))
    
    images = cur.fetchall()
    total_images += len(images)
    
    for image_id, file_path, x_px, y_px, old_x_norm, old_y_norm in images:
        try:
            # Calculate new normalized coordinates based on actual plan dimensions
            new_x_norm = x_px / dims['actual_width']
            new_y_norm = y_px / dims['actual_height']
            
            # Check if coordinates are now in valid range
            if 0 <= new_x_norm <= 1 and 0 <= new_y_norm <= 1:
                # Update the database
                cur.execute("""
                    UPDATE images
                    SET image_plan_x_norm = %s,
                        image_plan_y_norm = %s
                    WHERE "image_ID" = %s
                """, (new_x_norm, new_y_norm, image_id))
                
                updated += 1
                
                # Track if this fixed an out-of-range coordinate
                if (old_x_norm and (old_x_norm < 0 or old_x_norm > 1)) or \
                   (old_y_norm and (old_y_norm < 0 or old_y_norm > 1)):
                    out_of_range_fixed += 1
                    
            else:
                print(f"  ⚠️  Image {image_id} still out of range after recalibration: "
                      f"({new_x_norm:.4f}, {new_y_norm:.4f})")
                errors += 1
                
        except Exception as e:
            print(f"  ✗ Error processing image {image_id}: {e}")
            errors += 1

# Commit changes
conn.commit()

# Step 3: Handle images without pixel coordinates
cur.execute("""
    SELECT COUNT(*)
    FROM images i
    JOIN plans p ON i."image_plan_ID" = p."plan_ID"
    WHERE i.image_rank = 1
    AND (i.image_plan_x_num IS NULL OR i.image_plan_y_num IS NULL)
    AND i.image_plan_x_norm IS NOT NULL
""")
no_pixel_coords = cur.fetchone()[0]

# Summary
print("\n" + "="*80)
print("RECALIBRATION COMPLETE")
print("="*80)
print(f"Floor plans processed: {len(plan_dimensions)}")
print(f"Images with pixel coordinates: {total_images}")
print(f"Coordinates updated: {updated}")
print(f"Out-of-range coordinates fixed: {out_of_range_fixed}")
print(f"Images without pixel coords: {no_pixel_coords}")
print(f"Errors: {errors}")
print("\nNormalized coordinates are now calculated from:")
print("  X_norm = X_pixel / plan_width")
print("  Y_norm = Y_pixel / plan_height")

if no_pixel_coords > 0:
    print(f"\n⚠️  Note: {no_pixel_coords} images have normalized coordinates but no pixel coordinates.")
    print("   These cannot be recalibrated automatically and will remain unchanged.")

cur.close()
conn.close()
