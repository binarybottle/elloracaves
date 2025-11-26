#!/usr/bin/env python3
"""
Update plan dimensions in database to match actual image files.
"""

import psycopg2
from PIL import Image
from pathlib import Path

conn = psycopg2.connect("dbname=elloracaves user=arno")
cur = conn.cursor()

PLANS_DIR = Path("images/plans")

cur.execute("""
    SELECT "plan_ID", plan_image, plan_width, plan_height
    FROM plans
""")

plans = cur.fetchall()
updated = 0

for plan_id, plan_image, db_width, db_height in plans:
    plan_path = PLANS_DIR / plan_image
    if plan_path.exists():
        try:
            with Image.open(plan_path) as img:
                actual_width, actual_height = img.size
                if actual_width != db_width or actual_height != db_height:
                    cur.execute("""
                        UPDATE plans
                        SET plan_width = %s, plan_height = %s
                        WHERE "plan_ID" = %s
                    """, (actual_width, actual_height, plan_id))
                    updated += 1
                    print(f"Updated Plan {plan_id}: {db_width}x{db_height} → {actual_width}x{actual_height}")
        except Exception as e:
            print(f"Error reading {plan_image}: {e}")

conn.commit()
print(f"\nUpdated {updated} plan dimensions in database")

cur.close()
conn.close()
