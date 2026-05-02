-- SQL Script to Set Default Images
-- 
-- Instructions:
-- 1. Find image IDs you want as defaults by querying each cave/floor
-- 2. Replace the example image IDs below with your actual chosen IDs
-- 3. Run this script in psql: \i scripts/set_default_images.sql
-- 4. Run export_defaults.py to generate documentation
-- 5. Restart backend to pick up changes

-- Reset all priorities
UPDATE images SET default_priority = 0;

-- Set default images
UPDATE images SET default_priority = 10 WHERE image_id IN (
    -- Buddhist Caves
    727,    -- Cave 1
    9345,   -- Cave 2
    4193,   -- Cave 3
    4217,   -- Cave 4
    4249,   -- Cave 5
    4293,   -- Cave 6
    4329,   -- Cave 7
    4280,   -- Cave 8
    4377,   -- Cave 9
    9349,   -- Cave 10, Floor 1
    77,     -- Cave 10, Floor 2
    884,    -- Cave 11, Floor 1
    3806,   -- Cave 11, Floor 2
    571,    -- Cave 11, Floor 3
    894,    -- Cave 12, Floor 1
    3806,   -- Cave 12, Floor 2
    381,    -- Cave 12, Floor 3

    -- Hindu Caves
    4116,   -- Cave 13
    9476,   -- Cave 14
    9489,   -- Cave 15, Floor 1
    9687,   -- Cave 15, Floor 2
    9497,   -- Cave 16, Floor 1
    1435,   -- Cave 16, Floor 2
    6065,   -- Cave 16S (Satellite)
    1384,   -- Cave 16T (Triple-story), Floor 1
    1386,   -- Cave 16T (Triple-story), Floor 2
    1411,   -- Cave 16T (Triple-story), Floor 3
    1117,   -- Cave 16 Lankeshvara, Floor 2
    6821,   -- Cave 17
    1946,   -- Cave 18
    1917,   -- Cave 19
    1905,   -- Cave 20 A
    2292,   -- Cave 20 B
    9493,   -- Cave 21
    5381,   -- Cave 22
    2178,   -- Cave 23
    2160,   -- Cave 24
    5440,   -- Cave 24 A shrine 1
    8061,   -- Cave 24 B shrine 2
    2083,   -- Cave 25
    2103,   -- Cave 26
    2054,   -- Cave 27
    8929,   -- Cave 28
    9596,   -- Cave 29
    
    -- Jain Caves
    9391,   -- Cave 30
    2588,   -- Cave 30A
    3307,   -- Cave 31
    9370,   -- Cave 32, Floor 1
    9676,   -- Cave 32, Floor 2
    3448,   -- Cave 33, Floor 1
    7826,   -- Cave 33, Floor 2
    253,    -- Cave 34

    -- Other Caves
    3334,   -- Cave 32 Yadavas
    5584,   -- Ganeshleni 1-5
    5606,   -- Ganeshleni 6-7
    5628,   -- Ganeshleni 8-12
    5635,   -- Ganeshleni 13-16
    5595,   -- Ganeshleni 17-19
    6255,   -- Jogeshwari 1-2
    5776    -- Jogeshwari 3-4
);

-- Verify the updates
SELECT
  c.cave_id,
  c.cave_name,
  p.plan_floor,
  i.image_id,
  i.image_subject,
  i.image_file
FROM images i
JOIN caves c ON i.image_cave_id = c.cave_id
LEFT JOIN plans p ON i.image_plan_id = p.plan_id
WHERE i.default_priority > 0
ORDER BY c.cave_id, p.plan_floor;

