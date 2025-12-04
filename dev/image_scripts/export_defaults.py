#!/usr/bin/env python3
"""
Export default images from database to markdown file.
Run this script whenever you update default image priorities.
"""
import psycopg2
from datetime import datetime

# Database connection
print("Connecting to database...")
conn = psycopg2.connect("postgresql://arno@/elloracaves")
cur = conn.cursor()

# Query default images
print("Querying default images...")
cur.execute("""
    SELECT 
      c."cave_ID",
      c.cave_name,
      p.plan_floor,
      i."image_ID",
      i.image_subject,
      i.image_file,
      i.default_priority
    FROM images i
    JOIN caves c ON i."image_cave_ID" = c."cave_ID"
    LEFT JOIN plans p ON i."image_plan_ID" = p."plan_ID"
    WHERE i.default_priority > 0
    ORDER BY c."cave_ID", p.plan_floor
""")

results = cur.fetchall()
print(f"Found {len(results)} default images")

# Generate markdown file
print("Generating DEFAULT_IMAGES.md...")
with open('DEFAULT_IMAGES.md', 'w') as f:
    f.write("# Default Images by Cave and Floor\n\n")
    f.write(f"*Auto-generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
    f.write("These images are automatically selected when viewing each cave floor.\n\n")
    f.write(f"**Total: {len(results)} default images configured**\n\n")
    f.write("---\n\n")
    
    current_cave = None
    for row in results:
        cave_id, cave_name, floor, img_id, subject, file_path, priority = row
        
        # New cave section
        if cave_id != current_cave:
            if current_cave is not None:
                f.write("\n")
            f.write(f"## {cave_name} (ID: {cave_id})\n\n")
            current_cave = cave_id
        
        # Image entry
        floor_text = f"Floor {floor}" if floor else "No floor"
        subject_text = subject or "*No subject*"
        f.write(f"### {floor_text}\n\n")
        f.write(f"- **Subject**: {subject_text}\n")
        f.write(f"- **Image ID**: `{img_id}`\n")
        f.write(f"- **File**: `{file_path}`\n")
        f.write(f"- **Priority**: {priority}\n\n")
    
    # Instructions section
    f.write("---\n\n")
    f.write("## How to Update Defaults\n\n")
    f.write("1. Connect to database: `psql -d elloracaves`\n\n")
    f.write("2. Set new default image:\n")
    f.write("   ```sql\n")
    f.write("   UPDATE images SET default_priority = 10 WHERE \"image_ID\" = YOUR_IMAGE_ID;\n")
    f.write("   ```\n\n")
    f.write("3. Re-run this script: `python3 scripts/export_defaults.py`\n\n")
    f.write("4. Restart backend to pick up changes\n")

print(f"✅ Generated DEFAULT_IMAGES.md with {len(results)} entries")

cur.close()
conn.close()

