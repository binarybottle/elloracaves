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

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js pages
│   │   ├── page.tsx                  # Home/landing page
│   │   ├── about/                    # About page
│   │   ├── explore/                  # Main exploration interface
│   │   ├── caves/[caveNumber]/       # Cave detail pages
│   │   │   └── floor/[floorNumber]/  # Floor-specific views
│   │   ├── images/[imageId]/         # Individual image detail pages
│   │   └── search/                   # Search results page
│   ├── components/                   # React components
│   │   ├── cave/                     # Floor plans, image display, gallery strip, info panel
│   │   ├── caves/                    # Cave detail wrapper
│   │   ├── image/                    # Image gallery, fallback handling
│   │   └── search/                   # Search overlay, search results
│   └── lib/                          # API client, Supabase queries, Cloudflare Images helpers
├── public/
│   ├── images/                       # Static images (book cover, contributors, maps)
│   └── plans/                        # Floor plan images
└── package.json
```

## Features

- Interactive floor plans with image markers
- Full-text search with fuzzy matching and synonym support
- 8,400+ photographs with Cloudflare Images optimization
- Responsive design (mobile, tablet, desktop)
- Keyboard navigation (arrow keys, Cmd/Ctrl+K for search)

## Credits

- **Photography**: Arno Klein
- **Annotations**: Deepanjana Klein
- **Website**: Arno Klein

## Database Schema: `images` Table

The `images` table contains ~8,400 rows. Each row represents a photograph with its metadata and floor plan coordinates.

### Columns Displayed in the UI

| Column | Type | Description |
|--------|------|-------------|
| `image_id` | int | Primary key. Used for URL routing (`/images/[imageId]`) and all lookups |
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

### Columns Used Behind the Scenes (not displayed)

| Column | Type | Description |
|--------|------|-------------|
| `rank` | int | `1` = shown in the UI; `> 1` = hidden. All queries filter on `rank = 1` |
| `default_priority` | int | Sort order (descending): higher values appear first in image galleries. `0` (default) = no special priority, shown last |
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

## License

Photographs copyright Arno Klein. All other content copyright Deepanjana Klein.
