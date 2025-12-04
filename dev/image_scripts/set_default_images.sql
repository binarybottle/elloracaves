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
UPDATE images SET default_priority = 10 WHERE "image_ID" IN (
    -- Buddhist Caves
    727,     -- Cave 1
    4128,     -- Cave 2
    881,     -- Cave 3
    4217,    -- Cave 4
    4249,    -- Cave 5
    4293,    -- Cave 6
    4329,    -- Cave 7
    1236,    -- Cave 8
    4377,    -- Cave 9
    4128,       -- Cave 10, Floor 1
    77,    -- Cave 10, Floor 2
    884,    -- Cave 11, Floor 1
    314,  -- Cave 11, Floor 2
    571,  -- Cave 11, Floor 3
    883,    -- Cave 12, Floor 1
    3806,    -- Cave 12, Floor 2
    381,    -- Cave 12, Floor 3

    -- Hindu Caves
    719,    -- Cave 13
    670,    -- Cave 14
    1037,    -- Cave 15
    4692,   -- Cave 16, Floor 1
    1435,   -- Cave 16, Floor 2
    6066,   -- Cave 16 SW satellite
    6089,   -- Cave 16 SE satellite
    1384,   -- Cave 16 N satellite, Floor 1
    1386,   -- Cave 16 N satellite, Floor 2
    1411,   -- Cave 16 N satellite, Floor 3
    1117,   -- Cave 16 Lankeshvara, Floor 2
    5244,    -- Cave 17
    1946,    -- Cave 18
    1917,    -- Cave 19
    1905,    -- Cave 20 A
    2292,    -- Cave 20 B
    2231,   -- Cave 21
    5381,   -- Cave 22
    2178,   -- Cave 23
    2160,   -- Cave 24
    5440,   -- Cave 24 A shrine 1
    5434,   -- Cave 24 B shrine 2
    2083,   -- Cave 25
    2103,   -- Cave 26
    2054,   -- Cave 27
    5502,   -- Cave 28
    2131,   -- Cave 29
    
    -- Jain Caves
    2420,   -- Cave 30
    2588,   -- Cave 30A
    3307,   -- Cave 31
    2874,   -- Cave 32, Floor 1
    3114,   -- Cave 32, Floor 2
    6743,   -- Cave 33, Floor 1
    3550,   -- Cave 33, Floor 2
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
  c."cave_ID",
  c.cave_name,
  p.plan_floor,
  i."image_ID",
  i.image_subject,
  i.image_file
FROM images i
JOIN caves c ON i."image_cave_ID" = c."cave_ID"
LEFT JOIN plans p ON i."image_plan_ID" = p."plan_ID"
WHERE i.default_priority > 0
ORDER BY c."cave_ID", p.plan_floor;

