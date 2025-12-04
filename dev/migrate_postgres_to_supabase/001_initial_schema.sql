-- Ellora Caves Database Schema for Supabase
-- Migration: 001_initial_schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- TABLES
-- ============================================

-- Caves table
CREATE TABLE IF NOT EXISTS caves (
    id SERIAL PRIMARY KEY,
    cave_id SMALLINT UNIQUE NOT NULL,
    cave_name VARCHAR(64),
    subcave_name VARCHAR(64) NOT NULL DEFAULT '',
    cave_religion VARCHAR(128),
    cave_location VARCHAR(128),
    cave_dates VARCHAR(128),
    cave_description TEXT,
    cave_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    plan_id SMALLINT UNIQUE NOT NULL,
    cave_id SMALLINT NOT NULL REFERENCES caves(cave_id),
    plan_floor SMALLINT DEFAULT 1 NOT NULL,
    plan_image VARCHAR(128),
    plan_width SMALLINT,
    plan_height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    image_id INTEGER UNIQUE NOT NULL,
    master_id INTEGER,
    cave_id SMALLINT NOT NULL REFERENCES caves(cave_id),
    plan_id SMALLINT REFERENCES plans(plan_id),
    medium VARCHAR(256) DEFAULT 'rock-cut' NOT NULL,
    subject VARCHAR(256) NOT NULL DEFAULT '',
    motifs VARCHAR(256) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    file_path VARCHAR(128) NOT NULL,
    image_date VARCHAR(128) NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    rank SMALLINT DEFAULT 1 NOT NULL,
    rotate SMALLINT DEFAULT 0 NOT NULL,
    thumbnail VARCHAR(256),
    plan_x_px INTEGER,
    plan_y_px INTEGER,
    plan_x_norm NUMERIC(10,8),
    plan_y_norm NUMERIC(10,8),
    photographer VARCHAR(128) DEFAULT 'Arno Klein',
    default_priority INTEGER DEFAULT 0,
    assignment_questionable BOOLEAN DEFAULT FALSE,
    assignment_notes TEXT,
    coordinates_questionable BOOLEAN DEFAULT FALSE,
    -- Cloudflare Images fields (to be populated after upload)
    cloudflare_image_id VARCHAR(64),
    cloudflare_thumbnail_id VARCHAR(64),
    -- Full-text search
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_caves_religion ON caves(cave_religion);
CREATE INDEX IF NOT EXISTS idx_caves_cave_id ON caves(cave_id);

CREATE INDEX IF NOT EXISTS idx_plans_cave_id ON plans(cave_id);
CREATE INDEX IF NOT EXISTS idx_plans_plan_id ON plans(plan_id);

CREATE INDEX IF NOT EXISTS idx_images_cave_id ON images(cave_id);
CREATE INDEX IF NOT EXISTS idx_images_plan_id ON images(plan_id);
CREATE INDEX IF NOT EXISTS idx_images_master_id ON images(master_id);
CREATE INDEX IF NOT EXISTS idx_images_rank ON images(rank);
CREATE INDEX IF NOT EXISTS idx_images_file ON images(file_path);
CREATE INDEX IF NOT EXISTS idx_images_search ON images USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_images_subject_trgm ON images USING GIN(subject gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_images_description_trgm ON images USING GIN(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_images_motifs_trgm ON images USING GIN(motifs gin_trgm_ops);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update search vector function
CREATE OR REPLACE FUNCTION update_image_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.motifs, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.medium, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS trigger_caves_updated_at ON caves;
CREATE TRIGGER trigger_caves_updated_at
    BEFORE UPDATE ON caves
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_plans_updated_at ON plans;
CREATE TRIGGER trigger_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_images_updated_at ON images;
CREATE TRIGGER trigger_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_search_vector ON images;
CREATE TRIGGER trigger_update_search_vector
    BEFORE INSERT OR UPDATE OF subject, description, motifs, medium, notes
    ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_image_search_vector();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE caves ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for caves"
    ON caves FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public read access for plans"
    ON plans FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public read access for images"
    ON images FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE caves IS 'Ellora cave temples information';
COMMENT ON TABLE plans IS 'Floor plans for each cave';
COMMENT ON TABLE images IS 'Photographs of cave sculptures and architecture';
COMMENT ON COLUMN images.cloudflare_image_id IS 'Cloudflare Images ID for optimized delivery';
COMMENT ON COLUMN images.search_vector IS 'Full-text search index for subject, description, motifs';

