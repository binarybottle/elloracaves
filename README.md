# Ellora Caves Documentation

This website represents a comprehensive photographic documentation of the Ellora cave temples, a UNESCO World Heritage Site in Maharashtra, India.

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

## Maintaining the Site

A simple push to the GitHub repo will update the website for basic text edits, via GitHub actions (see Settings → Secrets and variables → Actions)

### Admin page (`/admin`)

The Admin page lets you bulk-review and edit image metadata: reassign images to different caves or plans, set `rank`, group images with `best_id`, and compare similar shots side-by-side.

- **URL**: `/admin` (e.g. `elloracaves.org/admin`)
- **Writes to**: Supabase `images` table (rank, cave_id, plan_id, best_id)
- **Requires**: anon write access enabled in Supabase (see below)

### Edit mode (`&edit`)

Adding `&edit` to any Explore or group URL activates Edit mode:

| URL | What you can do |
|-----|-----------------|
| `/explore?cave=10&edit` | Drag floor plan markers, set image rank, group images by `best_id`, toggle marker visibility |
| `/caves/group/ganeshleni?edit` | See sub-group sections with **Edit →** links to each constituent cave's edit page |

Edit mode markers are cyan (repositioned) vs green (original position). All rank images are shown on the floor plan in edit mode; only rank 1 images are shown to visitors.

### Enabling and disabling write access

**The live site uses the Supabase anon key, which is public.** By default, Supabase's Row Level Security (RLS) blocks all writes from that key. You must temporarily enable a policy to allow Admin or Edit mode to save changes, and **disable it when done**.

Run in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```sql
-- ENABLE before editing (Admin page or Edit mode)
CREATE POLICY "Allow anon update on images"
  ON images FOR UPDATE TO anon
  USING (true) WITH CHECK (true);
```

```sql
-- DISABLE when done — run this as soon as you finish editing
DROP POLICY IF EXISTS "Allow anon update on images" ON images;
```

```sql
-- Check whether write access is currently on
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'images';
```

> Write access gives anyone who visits the site the ability to modify the database while it is enabled. Keep the window short.

### Updating default images

The default image for each cave (shown first in galleries and on the About page) is controlled by the `default_priority` column. The script `scripts/set_default_images.sql` sets all defaults at once.

**Workflow:**

1. Edit `scripts/set_default_images.sql` — add or change the image IDs listed
2. Run it in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) — paste and execute the full file
3. The verification `SELECT` at the bottom of the script shows what was set

To set a single image without running the full script:

```sql
UPDATE images SET default_priority = 10 WHERE image_id = 1234;
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
│   └── plans/                        # Floor plan images (.svg preferred, .jpg fallback)
└── package.json
│
scripts/                              # Upload/sync scripts for Cloudflare Images
└── process_svgs.py                   # Crops SVG floor plans to tight bounding box (Inkscape)
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

## Floor Plan SVGs

Floor plan SVGs are served as static files from `frontend/public/plans/`, deployed with the Cloudflare Pages build. The frontend tries the SVG first and falls back to the JPG:

1. **Static SVG** — `/plans/<plan_image_basename>.svg` (inverted via `filter: invert(1)` for white-on-black)
2. **Static JPG** — `/plans/<plan_image>` (final fallback, not inverted)

### Adding or updating SVG plans

1. Place the `.svg` file in `frontend/public/plans/` with the same base name as the `.jpg` (e.g. `plan34_rotate_crop_480px.svg` alongside `plan34_rotate_crop_480px.jpg`).

2. Crop all SVGs to their drawing bounds (removes whitespace, stabilises the coordinate space for markers). Safe to re-run — produces identical output on already-cropped files:
   ```bash
   python3 dev/process_svgs.py
   ```
   Requires Inkscape (`/Applications/Inkscape.app`).

3. Deploy:
   ```bash
   cd frontend && npm run pages:build && npm run deploy
   ```

### Interactively correcting marker positions

Markers can be dragged to their correct positions directly in the browser and saved to the database. This uses two new columns, `mx` and `my`, on the `images` table.

**Enabling writes**: enable the anon write policy first (see [Enabling and disabling write access](#enabling-and-disabling-write-access) above), then disable it when done.

**Workflow:**

1. Run `npm run dev` (hot-reload dev server).
2. Open `http://localhost:3000/explore?cave=10&edit` (add `&edit` to any `/explore` URL).
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

## Credits

- **Photography**: Arno Klein
- **Annotations**: Deepanjana Klein
- **Website**: Arno Klein

## License

Photographs copyright Arno Klein except where noted. 
Text annotations of Arno's photographs are copyright Deepanjana Klein.
