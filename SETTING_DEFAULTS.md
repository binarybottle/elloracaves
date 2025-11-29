# Setting Default Images

This guide explains how to set default images for each cave/floor.

## Quick Start

### 1. Find Candidate Images

Connect to database and find the first image for each cave/floor:

```bash
psql -d elloracaves
```

```sql
WITH ranked_images AS (
  SELECT 
    c."cave_ID",
    c.cave_name,
    p.plan_floor,
    i."image_ID",
    i.image_subject,
    i.image_file,
    ROW_NUMBER() OVER (PARTITION BY c."cave_ID", p.plan_floor ORDER BY i.image_file) as rn
  FROM images i
  JOIN caves c ON i."image_cave_ID" = c."cave_ID"
  LEFT JOIN plans p ON i."image_plan_ID" = p."plan_ID"
  WHERE i.image_rank = 1
    AND i.image_file IS NOT NULL
)
SELECT 
  "cave_ID",
  cave_name,
  plan_floor,
  "image_ID",
  image_subject,
  image_file
FROM ranked_images
WHERE rn = 1
ORDER BY "cave_ID", plan_floor;
```

This shows one candidate image per cave/floor.

### 2. Set Default Images

Edit `scripts/set_default_images.sql` and replace the placeholder IDs with your chosen image IDs.

Then run:

```bash
psql -d elloracaves -f scripts/set_default_images.sql
```

### 3. Generate Documentation

```bash
python3 scripts/export_defaults.py
```

This creates `DEFAULT_IMAGES.md` with all your configured defaults.

### 4. Restart Backend

The backend needs to be restarted to pick up the new sorting:

```bash
# If running in docker:
docker-compose restart backend

# If running directly:
# Kill the process (Ctrl+C) and restart:
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## How It Works

1. **Database field**: `default_priority` (0 = not default, 10 = default)
2. **Backend sorting**: Images sorted by `default_priority DESC, image_file`
3. **Frontend behavior**: Automatically selects first image from API
4. **Result**: Default image appears first, gets auto-selected

## To Change a Default Later

Single image:
```sql
-- Make image 5678 the default for its floor
UPDATE images SET default_priority = 10 WHERE "image_ID" = 5678;

-- Remove previous default for same cave/floor if needed
UPDATE images SET default_priority = 0 
WHERE "image_cave_ID" = 16 AND "image_plan_ID" IN (
  SELECT "plan_ID" FROM plans WHERE "plan_cave_ID" = 16 AND plan_floor = 1
) AND "image_ID" != 5678;
```

Then re-run export script and check the site!

## Files

- `scripts/set_default_images.sql` - SQL template for setting defaults
- `scripts/export_defaults.py` - Generates DEFAULT_IMAGES.md from database
- `DEFAULT_IMAGES.md` - Auto-generated documentation (commit to git)

