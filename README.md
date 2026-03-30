# Ellora Caves Documentation

A comprehensive photographic documentation of the Ellora cave temples, a UNESCO World Heritage Site in Maharashtra, India.

## Live Site

**[elloracaves.org](https://elloracaves.org)**

## Architecture

```
Users → Cloudflare DNS/CDN
         ├─→ Cloudflare Pages (Next.js)
         │    └─→ Cloudflare Images (8,400+ photos + floor plan SVGs)
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
| `/more` | Link hub for Archives, Book, Images, and 3D pages |
| `/archives` | Archival image collection with expandable image viewer |
| `/book` | Book information + all images tagged with `book_figure` and `book_page` |
| `/images` | Image browsing page — filterable by cave, floor, and rank; inline search by subject/description |
| `/3d` | 3D photogrammetry models (GLB) with interactive `<model-viewer>` |
| `/admin` | Admin/review page — bulk image management with inline editing of `rank`, `cave_id`, `plan_id`, `best_id`; multi-select comparison; images clustered by `best_id` tree |
| `/caves/[caveNumber]` | Individual cave detail page |

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

Open [http://localhost:3000](http://localhost:3000).  
This uses the standard Next.js dev server with hot reload. SVG floor plans in `public/plans/` are served directly.

### Local build test

To catch build errors before deploying, run the standard Next.js build:

```bash
cd frontend
npm run build   # compile only — no server started
npm run start   # serve the build at http://localhost:3000
```

### Cloudflare Pages preview (local)

To test the exact Cloudflare Pages build locally (including Worker/Edge runtime compatibility):

```bash
cd frontend
npm run pages:build   # builds with @cloudflare/next-on-pages → .vercel/output/static
npm run preview       # runs wrangler pages dev on that output
```

Open [http://localhost:8788](http://localhost:8788). Use this before deploying if you've changed anything that might behave differently on Cloudflare's runtime (middleware, edge routes, etc.).

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
│   │   ├── images/                   # Image browsing page
│   │   ├── admin/                    # Admin/review page (editing)
│   │   ├── search/                   # Search results page
│   │   ├── archives/                 # Archival image collection
│   │   ├── book/                     # Book page
│   │   ├── more/                     # Link hub (Archives, Book, Images, 3D)
│   │   ├── 3d/                       # 3D photogrammetry models
│   │   └── caves/[caveNumber]/       # Individual cave detail
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
│   └── plans/                        # Floor plan images (SVGs now in Cloudflare Images)
└── package.json

dev/
├── process_svgs.py                   # Crops SVG floor plans to tight bounding box (Inkscape)
├── sync_plan_cf_ids.py               # Matches uploaded SVG plans to plans table, generates SQL
├── image_scripts/                    # Upload/sync scripts for Cloudflare Images
└── elloracaves_*.sql                 # Database dump
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
| `archival` | bool | Marks archival/legacy source images. Used by `/archives` |
| `book_page` | int | Book page reference. Displayed by `/book`; not editable in `/admin` |
| `book_figure` | text | Book figure reference. Displayed by `/book`; not editable in `/admin` |

### Columns Used Behind the Scenes

| Column | Type | Description |
|--------|------|-------------|
| `rank` | int | `1` = shown in explore UI; `2` = shown only as alternate to a `best_id` parent; `> 2` = hidden entirely |
| `best_id` | int | Points to a "better" image of the same subject. Forms a tree: root has no `best_id`, children point to parent. Used to group similar images in explore view and cluster images in the review page |
| `default_priority` | int | Sort order (descending): higher values appear first in image galleries. `0` (default) = no special priority |
| `hide_plan_xy` | bool | `true` = hide this image's marker on the floor plan even though coordinates exist |
| `mx` | float | Corrected X marker position (0.0–1.0). Overrides `plan_x_norm` when set. Set via drag-to-reposition edit mode |
| `my` | float | Corrected Y marker position (0.0–1.0). Overrides `plan_y_norm` when set |
| `cloudflare_image_id` | uuid | Cloudflare Images ID for the full-size image. Used to construct `image_url` |
| `search_vector` | tsvector | Pre-computed PostgreSQL full-text search index (built from subject, motifs, description, medium) |

### Columns Not Used by the Frontend

| Column | Type | Description |
|--------|------|-------------|
| `master_id` | int | Grouping/parent ID (usually null). Intended to link variant shots of the same subject |
| `rotate` | int | Rotation value. Not applied by the frontend |
| `image_date` | text | Date the photo was taken (often empty) |
| `assignment_notes` | text | Notes about questionable assignments |
| `coordinates_questionable` | bool | Flags uncertain floor plan coordinates |
| `created_at` | timestamp | Row creation timestamp |
| `updated_at` | timestamp | Row last-updated timestamp |


## Database Schema: `plans` Table

The `plans` table has one row per floor plan (one per cave floor).

| Column | Type | Description |
|--------|------|-------------|
| `plan_id` | int | Primary key. Used in `InteractiveFloorPlan` and `planTransforms` |
| `cave_id` | int | Foreign key to `caves` |
| `plan_floor` | int | Floor number (1, 2, 3, …). Used for floor-selector tabs |
| `plan_image` | text | Filename of the floor plan image (e.g. `plan10_floor1_rotate_crop_480px.jpg`). Used as static fallback URL (`/plans/<filename>`) |
| `plan_width` | int | Width of the plan image in pixels. Sets the container aspect ratio before the image loads |
| `plan_height` | int | Height of the plan image in pixels |
| `cloudflare_image_id` | text | Cloudflare Images ID for the SVG floor plan. When set, takes priority over the static file. See [Floor Plan SVGs](#floor-plan-svgs) |

**One-time DB setup:**
```sql
ALTER TABLE plans ADD COLUMN cloudflare_image_id text;
```

## Database Schema: `models_3d` Table

The `models_3d` table stores 3D photogrammetry models (GLB files captured with Polycam). Displayed on the `/3d` page using Google's `<model-viewer>` web component.

| Column | Type | Description |
|--------|------|-------------|
| `model_id` | serial | Primary key |
| `cave_id` | int | Foreign key to `caves` table |
| `plan_id` | int | Foreign key to `plans` table (optional) |
| `title` | text | Display title for the model |
| `description` | text | Description of what was captured |
| `file_url` | text | URL to the `.glb` file (hosted on Cloudflare R2 or similar) |
| `poster_url` | text | Static preview image URL (Cloudflare Images) |
| `source_app` | text | Capture application (default: `Polycam`) |
| `photographer` | text | Who captured the model |
| `capture_date` | text | When the model was captured |
| `created_at` | timestamptz | Row creation timestamp |
| `updated_at` | timestamptz | Row last-updated timestamp |

To create this table, run `create_models_3d.sql` in the Supabase SQL Editor.


## Image Management

### How images are served

The website does **not** serve images from local files. At runtime, it only uses the `cloudflare_image_id` column in Supabase to construct Cloudflare Images URLs. The `file_path` column is just a reference string used for display and for matching during the Cloudflare sync step.

Three things must be in sync:

| System | What it stores | What matters for the website |
|--------|---------------|------------------------------|
| **Local folder tree** | Original image files (e.g. `c9/_CAV3647.jpg`) | Not used by the website; your offline archive |
| **Cloudflare Images** | Hosted copies with auto-optimization | Serves the actual images via `cloudflare_image_id` |
| **Supabase `images` table** | Metadata: `cave_id`, `plan_id`, `file_path`, `cloudflare_image_id`, etc. | Determines which cave/floor an image appears on |

### Adding new images

#### 1. Upload to Cloudflare Images

```bash
cd dev/image_scripts
python upload_cloudflare.py /path/to/new/photos YOUR_CF_API_TOKEN
```

This uploads every image and logs results to `upload_log.csv`.

#### 2. Insert rows into Supabase

Each photo needs a row in `images` with the correct `cave_id`, `plan_id`, and `file_path` (matching the uploaded filename). Look up the plan_id first:

```sql
SELECT plan_id, plan_floor FROM plans WHERE cave_id = YOUR_CAVE_ID ORDER BY plan_floor;
```

Then insert:

```sql
INSERT INTO images (image_id, cave_id, plan_id, file_path, rank, subject)
VALUES
  (nextval('images_image_id_seq'), 3016, 3016, 'c16S/photo1.jpg', 1, ''),
  (nextval('images_image_id_seq'), 3016, 3016, 'c16S/photo2.jpg', 1, '');
```

#### 3. Sync Cloudflare IDs to Supabase

This matches uploaded filenames to `file_path` values and populates `cloudflare_image_id`:

```bash
cd dev/image_scripts
CF_API_TOKEN=your_token python sync_cloudflare_ids.py
```

If Supabase credentials aren't set, it generates a `.sql` file to run manually.

### Reassigning images to different caves/plans

If you've changed `cave_id` or `plan_id` for images in Supabase (via the `/admin` page or SQL), here's what else needs updating:

**Cloudflare Images**: Nothing. Cloudflare doesn't know about caves or plans — it just stores image blobs by ID. No changes needed.

**Supabase**: Already done if you updated `cave_id`/`plan_id`. The website reads these columns to determine where images appear.

**Local folder tree** (optional): If you want your local archive to mirror the database assignments, move the files to match. For example, if you moved images from cave 4016 (16sw) to 3016 (16 Satellite), you'd move local files from `c16sw/` to `c16S/`. Then update `file_path` in Supabase to match:

```sql
UPDATE images
SET file_path = REPLACE(file_path, 'c16sw/', 'c16S/')
WHERE file_path LIKE 'c16sw/%';
```

This is cosmetic — the website doesn't use `file_path` for serving images — but keeps things consistent for your records and for the `/admin` page display.

## Floor Plan SVGs

Floor plan SVGs are uploaded to Cloudflare Images and linked via `cloudflare_image_id` on the `plans` table. The frontend loads them in priority order:

1. **Cloudflare Images** — `https://imagedelivery.net/{hash}/{cloudflare_image_id}/public` (when `cloudflare_image_id` is set)
2. **Static SVG** — `/plans/<plan_image>.svg` (fallback if no CF ID, or CF load fails)
3. **Static JPG** — `/plans/<plan_image>` (final fallback)

SVGs are displayed inverted (`filter: invert(1)`) so they appear as white lines on a black background, matching the site's dark theme. JPG fallbacks are not inverted.

### Uploading a new or updated SVG plan

1. Crop the SVG to its drawing bounds (removes whitespace, stabilises coordinate space):
   ```bash
   python3 dev/process_svgs.py
   ```
   This uses Inkscape to compute the tight bounding box and updates the SVG's `viewBox`, `width`, and `height` in place.

2. Upload the cropped SVG to Cloudflare Images (via the dashboard or any upload script).

3. Link the Cloudflare ID to the plan in Supabase:
   ```sql
   UPDATE plans SET cloudflare_image_id = '<cf_id>' WHERE plan_image = 'plan34_rotate_crop_480px.jpg';
   ```

### Syncing all plan SVG IDs at once

If you've uploaded many SVGs to Cloudflare Images, run `dev/sync_plan_cf_ids.py` to generate the SQL for all of them automatically. It lists every `.svg` in your Cloudflare Images account and matches by filename:

```bash
CF_ACCOUNT_ID=<account_id> CF_API_TOKEN=<read-images token> python3 dev/sync_plan_cf_ids.py
```

Paste the printed SQL into the Supabase SQL editor. Safe to run multiple times (idempotent).

**Credentials:**
- `CF_ACCOUNT_ID`: Cloudflare dashboard → top-right account menu → "Account ID"
- `CF_API_TOKEN`: My Profile → API Tokens → use the `read-images` token (requires `Account.Cloudflare Images` read permission)

### Interactively correcting marker positions

Markers can be dragged to their correct positions directly in the browser and saved to the database. This uses two new columns, `mx` and `my`, on the `images` table.

**One-time DB setup** (run once in Supabase SQL editor):

```sql
ALTER TABLE images ADD COLUMN mx double precision;
ALTER TABLE images ADD COLUMN my double precision;
```

**Enabling writes** (Supabase requires the anon write policy to be enabled):

```sql
-- Enable before editing
CREATE POLICY "Allow anon update" ON images FOR UPDATE TO anon USING (true) WITH CHECK (true);
-- Disable when done
DROP POLICY "Allow anon update" ON images;
```

**Workflow:**

1. Run `npm run dev` (hot-reload dev server).
2. Open `http://localhost:3000/explore?cave=10&plan_edit` (add `&plan_edit` to any `/explore` URL).
3. An amber **EDIT MODE** banner appears above each floor plan.
4. Drag any marker to its correct position — it saves automatically to `mx`/`my` in the database.
5. Repositioned markers turn **cyan**; untouched markers stay green.
6. To reset a marker to its original position, set `mx`/`my` to NULL:
   ```sql
   UPDATE images SET mx = NULL, my = NULL WHERE image_id = 1234;
   ```

**Display logic:**

- If `mx`/`my` are set, they replace `plan_x_norm`/`plan_y_norm` entirely. No `planTransforms` are applied to corrected markers.
- If `mx`/`my` are not set, the original `plan_x_norm`/`plan_y_norm` coordinates are used, with any per-plan `planTransforms` applied.

**Migrating corrected coordinates** (when all markers are correct):

```sql
-- Copy mx/my → plan_x_norm/plan_y_norm for all corrected images
UPDATE images
SET plan_x_norm = mx, plan_y_norm = my
WHERE mx IS NOT NULL AND my IS NOT NULL;

-- Then clear the correction columns
UPDATE images SET mx = NULL, my = NULL WHERE mx IS NOT NULL;
```

### Hiding all markers for a plan

To hide every marker on a given floor plan without deleting coordinates:

```sql
-- Hide all markers on plan 30 (cave 30)
UPDATE images SET hide_plan_xy = true WHERE plan_id = 30;

-- Restore
UPDATE images SET hide_plan_xy = false WHERE plan_id = 30;
```

### Caves without a floor plan

If a cave has no entry in `plans` (e.g. cave 13), the `/explore` page still shows images for that cave — it falls back to fetching all rank-1, non-archival images for the cave directly. No plan or markers are shown, just the image display and gallery strip.

### Setting a cave's default image

The image with the highest `default_priority` appears first in galleries and becomes the default on the About page:

```sql
UPDATE images SET default_priority = 10 WHERE image_id = 1234;
```

## Credits

- **Photography**: Arno Klein
- **Annotations**: Deepanjana Klein
- **Website**: Arno Klein

## License

Photographs copyright Arno Klein except where noted. 
Text annotations of Arno's photographs are copyright Deepanjana Klein.
