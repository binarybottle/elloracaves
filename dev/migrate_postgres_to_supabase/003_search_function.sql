-- Sophisticated search function with full-text + fuzzy matching
-- Run this in Supabase SQL Editor

-- First, ensure pg_trgm extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search function that combines full-text search with trigram similarity
CREATE OR REPLACE FUNCTION search_images_fuzzy(
    search_query TEXT,
    target_cave_id INTEGER DEFAULT NULL,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20,
    use_fuzzy BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    image_id INTEGER,
    file_path TEXT,
    subject TEXT,
    description TEXT,
    cave_id INTEGER,
    plan_id INTEGER,
    cloudflare_image_id TEXT,
    cloudflare_thumbnail_id TEXT,
    thumbnail TEXT,
    relevance REAL,
    total_count BIGINT
) AS $$
DECLARE
    skip_count INTEGER := (page_num - 1) * page_size;
    total BIGINT;
BEGIN
    -- Get total count first
    IF use_fuzzy THEN
        SELECT COUNT(*) INTO total
        FROM images i
        WHERE i.rank = 1
          AND (target_cave_id IS NULL OR i.cave_id = target_cave_id)
          AND (
              i.search_vector @@ plainto_tsquery('english', search_query)
              OR similarity(i.subject, search_query) > 0.3
              OR similarity(i.description, search_query) > 0.2
              OR similarity(i.motifs, search_query) > 0.3
          );
    ELSE
        SELECT COUNT(*) INTO total
        FROM images i
        WHERE i.rank = 1
          AND (target_cave_id IS NULL OR i.cave_id = target_cave_id)
          AND i.search_vector @@ plainto_tsquery('english', search_query);
    END IF;
    
    -- Return results with relevance ranking
    RETURN QUERY
    SELECT 
        i.image_id,
        i.file_path,
        i.subject,
        i.description,
        i.cave_id,
        i.plan_id,
        i.cloudflare_image_id,
        i.cloudflare_thumbnail_id,
        i.thumbnail,
        (
            COALESCE(ts_rank(i.search_vector, plainto_tsquery('english', search_query)), 0) +
            COALESCE(similarity(i.subject, search_query), 0) * 2 +
            COALESCE(similarity(i.description, search_query), 0) +
            COALESCE(similarity(i.motifs, search_query), 0)
        )::REAL as relevance,
        total as total_count
    FROM images i
    WHERE i.rank = 1
      AND (target_cave_id IS NULL OR i.cave_id = target_cave_id)
      AND (
          CASE WHEN use_fuzzy THEN
              i.search_vector @@ plainto_tsquery('english', search_query)
              OR similarity(i.subject, search_query) > 0.3
              OR similarity(i.description, search_query) > 0.2
              OR similarity(i.motifs, search_query) > 0.3
          ELSE
              i.search_vector @@ plainto_tsquery('english', search_query)
          END
      )
    ORDER BY relevance DESC, i.file_path
    OFFSET skip_count
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION search_images_fuzzy TO anon;
GRANT EXECUTE ON FUNCTION search_images_fuzzy TO authenticated;

