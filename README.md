# Ellora Caves Website

Complete photographic documentation of Ellora cave temples.

## Architecture

```
Users → Cloudflare DNS/CDN
         ├─→ Cloudflare Pages (Next.js SSG)
         │    └─→ Cloudflare Images (optimized images)
         └─→ Supabase Edge Functions (search only)
              └─→ Supabase PostgreSQL
```

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- Supabase account with project created
- Cloudflare account with Images enabled

### 1. Set Up Environment

```bash
cd frontend

# Copy environment template and fill in values
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Cloudflare credentials
```

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CF_IMAGES_ACCOUNT=your-cloudflare-account-hash
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000/explore?cave=10&floor=1

## Deployment

### Database Migration (Supabase)

1. Create a Supabase project at https://supabase.com
2. Run the schema migration:
   ```bash
   psql $SUPABASE_DB_URL -f supabase/migrations/001_initial_schema.sql
   ```
3. Run the seed data:
   ```bash
   psql $SUPABASE_DB_URL -f supabase/migrations/002_seed_data.sql
   ```

### Image Upload (Cloudflare Images)

```bash
cd scripts
python upload_cloudflare.py ../images/caves_1200px YOUR_CF_API_TOKEN
```

Then update the database with Cloudflare image IDs:
```bash
python update_image_ids.py upload_log.csv
```

### Frontend Deployment (Cloudflare Pages)

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build settings:
   - Framework preset: Next.js (Static HTML Export)
   - Build command: `npm run build`
   - Build output directory: `out`
4. Set environment variables in Cloudflare Pages dashboard

### Search Function (Supabase)

Deploy the edge function:
```bash
cd supabase
supabase functions deploy search
```

## Project Structure

```
├── frontend/           # Next.js frontend (Cloudflare Pages)
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/ # React components
│   │   └── lib/       # API client, Supabase, helpers
│   └── next.config.js # Static export config
├── supabase/          # Supabase configuration
│   ├── migrations/    # Database schema and seed data
│   └── functions/     # Edge functions (search)
├── scripts/           # Utility scripts
│   ├── upload_cloudflare.py    # Upload images to CF
│   ├── update_image_ids.py     # Update DB with CF IDs
│   └── migrate_to_supabase.py  # Generate migration SQL
└── images/            # Local images (for reference)
```

## Services

| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend | Cloudflare Pages | Static Next.js hosting |
| Database | Supabase | PostgreSQL + auto-generated API |
| Images | Cloudflare Images | Optimized image delivery |
| Search | Supabase Edge Functions | Full-text search |
| DNS | Cloudflare | DNS, DDoS protection |

## Cost Estimate

| Service | Monthly Cost |
|---------|-------------|
| Cloudflare Pages | $0 (free tier) |
| Cloudflare Images | $5-6 |
| Supabase | $0 (free tier <500MB) |
| **Total** | **$5-6/month** |

## Environment Variables

### Frontend (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Cloudflare Images
NEXT_PUBLIC_CF_IMAGES_ACCOUNT=xxx

# Optional: Local API fallback (development only)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Supabase Edge Functions

Set in Supabase dashboard:
```bash
CF_IMAGES_ACCOUNT=xxx
```

## Development Workflow

1. Make changes to frontend code
2. Test locally with `npm run dev`
3. Push to GitHub
4. Cloudflare Pages auto-deploys

## Database Changes

1. Update `supabase/migrations/` with new SQL
2. Apply to Supabase:
   ```bash
   psql $SUPABASE_DB_URL -f supabase/migrations/xxx.sql
   ```

## Legacy Backend (Deprecated)

The `backend/` directory contains the old FastAPI backend.
It is kept for reference but is no longer used in production.
All API functionality has been migrated to:
- Supabase auto-generated REST API (for CRUD operations)
- Supabase Edge Functions (for search)

## License

Photographs copyright Arno Klein. All other content copyright Deepanjana Klein.
