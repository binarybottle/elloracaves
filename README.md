# Ellora Caves Documentation

A comprehensive photographic documentation of the Ellora cave temples, a UNESCO World Heritage Site in Maharashtra, India.

## Live Site

**[elloracaves.org](https://elloracaves.org)**

## Architecture

```
Users → Cloudflare DNS/CDN
         ├─→ Cloudflare Pages (Next.js)
         │    └─→ Cloudflare Images (8,400+ photos)
         └─→ Supabase PostgreSQL (database)
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Images**: Cloudflare Images (auto-optimized WebP/AVIF)
- **Hosting**: Cloudflare Pages
- **Domain**: Cloudflare DNS

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/explore` | Main exploration interface — interactive floor plans, image display with similar-image groups, gallery strip, info panel |
| `/about` | About the project, contributors, and bibliography |
| `/search` | Full-text search results |
| `/images` | Admin/review page — bulk image management with inline editing of `rank`, `cave_id`, `plan_id`, `best_id`; multi-select comparison; images clustered by `best_id` tree |

## Features

- Interactive floor plans with clickable image markers
- Full-text search with fuzzy matching and synonym support
- 8,400+ photographs with Cloudflare Images optimization
- Similar image groups via `best_id` hierarchy (tree traversal up and down)
- Image review page with inline field editing, multi-select comparison, and `best_id` clustering
- Responsive design (mobile, tablet, desktop layouts)
- Keyboard navigation (arrow keys for images, Escape to close, Cmd/Ctrl+K for search)

## Local Development

```bash
cd frontend
npm install
# Create .env.local with your Supabase/Cloudflare credentials (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_CF_IMAGES_ACCOUNT=your_cloudflare_account_hash
```

## Deployment to Cloudflare Pages

### Initial Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Set **Root directory** to `frontend`

### Environment Variables

In Cloudflare Pages → Settings → Environment variables, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `NEXT_PUBLIC_CF_IMAGES_ACCOUNT` | `your_account_hash` |
| `NODE_VERSION` | `18` |

### Build and Deploy

The site uses `@cloudflare/next-on-pages` to build and `wrangler` to deploy:

```bash
cd frontend
npm run pages:build && npm run deploy
```

This runs `npx @cloudflare/next-on-pages` (builds to `.vercel/output/static`) then `wrangler pages deploy` to push to Cloudflare.

### Custom Domain (optional)

1. Pages → Your project → Custom domains
2. Add `elloracaves.org` (or your domain)
3. Follow DNS setup instructions

## Supabase: Enabling/Disabling Anon Write Access

The `/images` admin page writes directly to the database using the Supabase anon key. By default Supabase enables Row Level Security (RLS) which blocks anonymous writes. To allow editing from the frontend, you need to add a policy. **Turn this on only when actively editing, and revoke when done.**

### Enable anon write access

Run in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```sql
-- Allow anonymous users to update image metadata
CREATE POLICY "Allow anon update on images"
  ON images
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

### Disable anon write access

```sql
-- Revoke anonymous update access
DROP POLICY IF EXISTS "Allow anon update on images" ON images;
```

### Check current policies

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'images';
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js pages
│   │   ├── page.tsx                  # Home/landing page
│   │   ├── about/                    # About page
│   │   ├── explore/                  # Main exploration interface
│   │   ├── images/                   # Image review/admin page
│   │   └── search/                   # Search results page
│   ├── components/
│   │   ├── cave/                     # CaveMap, FloorPlanSidebar, InteractiveFloorPlan,
│   │   │                             #   ImageDisplay, ImageGalleryStrip, ImageInfoPanel
│   │   ├── caves/                    # CaveDetail wrapper
│   │   ├── image/                    # ImageGallery, ImageWithFallback
│   │   └── search/                   # SearchOverlay, SearchResults
│   └── lib/
│       ├── api.ts                    # API types (Image, Cave, etc.), data transforms, fetch functions
│       ├── supabase.ts               # Supabase client, all database queries
│       └── cloudflare-images.ts      # Cloudflare Images URL helpers
├── public/
│   ├── images/                       # Static images (book cover, contributors, maps)
│   └── plans/                        # Floor plan images
└── package.json
```

## Database Schema: `images` Table

The `images` table contains ~8,400 rows. Each row represents a photograph with its metadata and floor plan coordinates.

### Columns Displayed in the UI

| Column | Type | Description |
|--------|------|-------------|
| `image_id` | int | Primary key. Used for URL routing and all lookups |
| `cave_id` | int | Foreign key to `caves` table. Used for navigation, breadcrumbs, search filtering |
| `plan_id` | int | Foreign key to `plans` table. Links image to a specific floor plan |
| `subject` | text | Short title (e.g. "Bodhisattva", "Seated Buddha"). Used as image title, alt text, headings, search results |
| `description` | text | Long-form scholarly description. Displayed on detail pages, info panels, truncated in search/gallery |
| `motifs` | text | Iconographic motifs (e.g. "Avalokitesvara"). Displayed as tags on detail page; searched during queries |
| `medium` | text | Artwork type (e.g. "rock-cut", "painting", "sculpture"). Displayed on detail page |
| `photographer` | text | Photographer credit (e.g. "Arno Klein"). Displayed on detail page and info panel |
| `file_path` | text | Relative path to original image (e.g. "c9/_CAV3647.jpg"). Displayed as file info; fallback URL when Cloudflare IDs are missing |
| `plan_x_norm` | float | X coordinate normalized (0.0–1.0) on the floor plan. Used to position markers on interactive floor plans |
| `plan_y_norm` | float | Y coordinate normalized (0.0–1.0) on the floor plan. Used to position markers on interactive floor plans |

### Columns Used Behind the Scenes

| Column | Type | Description |
|--------|------|-------------|
| `rank` | int | `1` = shown in explore UI; `2` = shown only as alternate to a `best_id` parent; `> 2` = hidden entirely |
| `best_id` | int | Points to a "better" image of the same subject. Forms a tree: root has no `best_id`, children point to parent. Used to group similar images in explore view and cluster images in the review page |
| `default_priority` | int | Sort order (descending): higher values appear first in image galleries. `0` (default) = no special priority |
| `hide_plan_xy` | int | `1` = hide this image's marker on the floor plan even though coordinates exist; `0` = show marker |
| `cloudflare_image_id` | uuid | Cloudflare Images ID for the full-size image. Used to construct `image_url` |
| `cloudflare_thumbnail_id` | uuid | Cloudflare Images ID for a dedicated thumbnail. Falls back to `cloudflare_image_id` with `thumb` variant |
| `thumbnail` | text | Local thumbnail file path override. Last-resort fallback for thumbnail URL generation |
| `search_vector` | tsvector | Pre-computed PostgreSQL full-text search index (built from subject, motifs, description, medium) |
| `plan_x_px` | int | X coordinate in pixels. Only used to check if coordinates exist; not used for rendering |
| `plan_y_px` | int | Y coordinate in pixels. Not used for rendering |

### Columns Not Used by the Frontend

| Column | Type | Description |
|--------|------|-------------|
| `master_id` | int | Grouping/parent ID (usually null). Intended to link variant shots of the same subject |
| `rotate` | int | Rotation value. Not applied by the frontend |
| `image_date` | text | Date the photo was taken (often empty) |
| `notes` | text | Internal/editorial notes |
| `assignment_questionable` | bool | Flags uncertain cave/plan assignments |
| `assignment_notes` | text | Notes about questionable assignments |
| `coordinates_questionable` | bool | Flags uncertain floor plan coordinates |
| `created_at` | timestamp | Row creation timestamp |
| `updated_at` | timestamp | Row last-updated timestamp |

### Schema Maintenance

To add the `best_id` column (if not already present):

```sql
ALTER TABLE images ADD COLUMN best_id integer;
```

## Credits

- **Photography**: Arno Klein
- **Annotations**: Deepanjana Klein
- **Website**: Arno Klein

## License

Photographs copyright Arno Klein. All other content copyright Deepanjana Klein.
