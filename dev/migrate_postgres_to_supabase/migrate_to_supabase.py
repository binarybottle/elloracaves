#!/usr/bin/env python3
"""
Migrate Ellora Caves database from local PostgreSQL to Supabase.

This script:
1. Exports data from local PostgreSQL
2. Transforms it to match the new Supabase schema
3. Generates SQL insert statements for Supabase

Usage:
    python scripts/migrate_to_supabase.py

Output:
    supabase/migrations/002_seed_data.sql
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# Local database connection
LOCAL_DB = os.getenv("DATABASE_URL", "postgresql://arno@/elloracaves")

def escape_sql_string(value):
    """Escape single quotes and handle None values."""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    # Escape single quotes by doubling them
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"

def export_caves(cursor):
    """Export caves table."""
    cursor.execute("""
        SELECT "cave_ID", cave_name, subcave_name, cave_religion, 
               cave_location, cave_dates, cave_description, cave_notes
        FROM caves
        ORDER BY "cave_ID"
    """)
    rows = cursor.fetchall()
    
    lines = ["-- Caves data\n"]
    for row in rows:
        lines.append(f"""INSERT INTO caves (cave_id, cave_name, subcave_name, cave_religion, cave_location, cave_dates, cave_description, cave_notes)
VALUES ({row['cave_ID']}, {escape_sql_string(row['cave_name'])}, {escape_sql_string(row['subcave_name'])}, {escape_sql_string(row['cave_religion'])}, {escape_sql_string(row['cave_location'])}, {escape_sql_string(row['cave_dates'])}, {escape_sql_string(row['cave_description'])}, {escape_sql_string(row['cave_notes'])})
ON CONFLICT (cave_id) DO NOTHING;
""")
    return lines

def export_plans(cursor):
    """Export plans table."""
    cursor.execute("""
        SELECT "plan_ID", "plan_cave_ID", plan_floor, plan_image, plan_width, plan_height
        FROM plans
        ORDER BY "plan_ID"
    """)
    rows = cursor.fetchall()
    
    lines = ["\n-- Plans data\n"]
    for row in rows:
        lines.append(f"""INSERT INTO plans (plan_id, cave_id, plan_floor, plan_image, plan_width, plan_height)
VALUES ({row['plan_ID']}, {row['plan_cave_ID']}, {row['plan_floor']}, {escape_sql_string(row['plan_image'])}, {row['plan_width'] or 'NULL'}, {row['plan_height'] or 'NULL'})
ON CONFLICT (plan_id) DO NOTHING;
""")
    return lines

def export_images(cursor):
    """Export images table."""
    cursor.execute("""
        SELECT "image_ID", "image_master_ID", "image_cave_ID", "image_plan_ID",
               image_medium, image_subject, image_motifs, image_description,
               image_file, image_date, image_notes, image_rank, image_rotate,
               image_thumbnail, image_plan_x_num, image_plan_y_num,
               image_plan_x_norm, image_plan_y_norm, image_photographer,
               default_priority, assignment_questionable, assignment_notes,
               coordinates_questionable
        FROM images
        ORDER BY "image_ID"
    """)
    rows = cursor.fetchall()
    
    lines = ["\n-- Images data\n"]
    for row in rows:
        plan_id = row['image_plan_ID'] if row['image_plan_ID'] else 'NULL'
        master_id = row['image_master_ID'] if row['image_master_ID'] else 'NULL'
        plan_x = row['image_plan_x_num'] if row['image_plan_x_num'] else 'NULL'
        plan_y = row['image_plan_y_num'] if row['image_plan_y_num'] else 'NULL'
        plan_x_norm = row['image_plan_x_norm'] if row['image_plan_x_norm'] else 'NULL'
        plan_y_norm = row['image_plan_y_norm'] if row['image_plan_y_norm'] else 'NULL'
        default_priority = row['default_priority'] if row['default_priority'] else 0
        
        lines.append(f"""INSERT INTO images (image_id, master_id, cave_id, plan_id, medium, subject, motifs, description, file_path, image_date, notes, rank, rotate, thumbnail, plan_x_px, plan_y_px, plan_x_norm, plan_y_norm, photographer, default_priority, assignment_questionable, assignment_notes, coordinates_questionable)
VALUES ({row['image_ID']}, {master_id}, {row['image_cave_ID']}, {plan_id}, {escape_sql_string(row['image_medium'])}, {escape_sql_string(row['image_subject'])}, {escape_sql_string(row['image_motifs'])}, {escape_sql_string(row['image_description'])}, {escape_sql_string(row['image_file'])}, {escape_sql_string(row['image_date'])}, {escape_sql_string(row['image_notes'])}, {row['image_rank']}, {row['image_rotate']}, {escape_sql_string(row['image_thumbnail'])}, {plan_x}, {plan_y}, {plan_x_norm}, {plan_y_norm}, {escape_sql_string(row['image_photographer'])}, {default_priority}, {escape_sql_string(row['assignment_questionable'])}, {escape_sql_string(row['assignment_notes'])}, {escape_sql_string(row['coordinates_questionable'])})
ON CONFLICT (image_id) DO NOTHING;
""")
    return lines

def main():
    print(f"Connecting to local database: {LOCAL_DB}")
    conn = psycopg2.connect(LOCAL_DB)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    output_file = "supabase/migrations/002_seed_data.sql"
    
    with open(output_file, 'w') as f:
        f.write(f"""-- Ellora Caves Seed Data for Supabase
-- Generated: {datetime.now().isoformat()}
-- This file imports data from the local PostgreSQL database

""")
        
        # Export caves
        print("Exporting caves...")
        caves_sql = export_caves(cursor)
        print(f"  Exported {len(caves_sql) - 1} caves")
        f.writelines(caves_sql)
        
        # Export plans
        print("Exporting plans...")
        plans_sql = export_plans(cursor)
        print(f"  Exported {len(plans_sql) - 1} plans")
        f.writelines(plans_sql)
        
        # Export images
        print("Exporting images...")
        images_sql = export_images(cursor)
        print(f"  Exported {len(images_sql) - 1} images")
        f.writelines(images_sql)
        
        # Update search vectors
        f.write("""
-- Update search vectors for all images
UPDATE images SET search_vector = 
    setweight(to_tsvector('english', COALESCE(subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(motifs, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(medium, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(notes, '')), 'D');
""")
    
    cursor.close()
    conn.close()
    
    print(f"\n✅ Migration SQL written to: {output_file}")
    print("\nNext steps:")
    print("1. Create a Supabase project at https://supabase.com")
    print("2. Run the schema migration: supabase/migrations/001_initial_schema.sql")
    print("3. Run the seed data: supabase/migrations/002_seed_data.sql")
    print("4. Or use: psql $SUPABASE_DB_URL -f supabase/migrations/001_initial_schema.sql")

if __name__ == "__main__":
    main()

