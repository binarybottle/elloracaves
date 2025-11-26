#!/usr/bin/env python3
import psycopg2

conn = psycopg2.connect("dbname=elloracaves user=arno")
cur = conn.cursor()

# Get Cave 10 plan dimensions
cur.execute("""
    SELECT plan_floor, plan_image, plan_width, plan_height 
    FROM plans 
    WHERE "plan_cave_ID" = 10
""")
plan = cur.fetchone()
print(f"Plan: {plan[1]}, Dimensions: {plan[2]}x{plan[3]}")

# Get Cave 10 coordinates
cur.execute("""
    SELECT image_file, image_plan_x_norm, image_plan_y_norm
    FROM images 
    WHERE "image_cave_ID" = 10 
    AND image_rank = 1 
    AND image_plan_x_norm IS NOT NULL
    ORDER BY image_plan_x_norm, image_plan_y_norm
    LIMIT 20
""")

print("\nSample coordinates:")
print("File | X_norm | Y_norm")
print("-" * 50)
for row in cur.fetchall():
    print(f"{row[0][:30]:30} | {float(row[1]):.4f} | {float(row[2]):.4f}")
    
# Check for coordinates outside 0-1 range
cur.execute("""
    SELECT COUNT(*), 
           MIN(image_plan_x_norm), MAX(image_plan_x_norm),
           MIN(image_plan_y_norm), MAX(image_plan_y_norm)
    FROM images 
    WHERE "image_cave_ID" = 10 
    AND image_rank = 1 
    AND image_plan_x_norm IS NOT NULL
""")
stats = cur.fetchone()
print(f"\nCoordinate ranges:")
print(f"  X: {float(stats[1]):.4f} to {float(stats[2]):.4f}")
print(f"  Y: {float(stats[3]):.4f} to {float(stats[4]):.4f}")

if stats[1] < 0 or stats[2] > 1 or stats[3] < 0 or stats[4] > 1:
    print("⚠️  WARNING: Coordinates outside 0-1 range detected!")

cur.close()
conn.close()
