# Ellora Caves Documentation

A comprehensive photographic documentation of the Ellora cave temples, a UNESCO World Heritage Site in Maharashtra, India.

## Live Site

🌐 **[elloracaves.org](https://elloracaves.org)** (or your Cloudflare Pages URL)

## Architecture

```
Users → Cloudflare DNS/CDN
         ├─→ Cloudflare Pages (Next.js)
         │    └─→ Cloudflare Images (7,400+ photos)
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
cp .env.local.example .env.local  # Add your Supabase/Cloudflare credentials
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

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `frontend`

### 3. Set Environment Variables

In Cloudflare Pages → Settings → Environment variables, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `NEXT_PUBLIC_CF_IMAGES_ACCOUNT` | `your_account_hash` |
| `NODE_VERSION` | `18` |

### 4. Deploy

Click **Save and Deploy**. Cloudflare will build and deploy your site.

Later deployments:
cd /Users/arno/Software/www/elloracaves/frontend
npx wrangler pages deploy .vercel/output/static --project-name=elloracaves

### 5. Custom Domain (optional)

1. Pages → Your project → Custom domains
2. Add `elloracaves.org` (or your domain)
3. Follow DNS setup instructions

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── about/        # About page
│   │   ├── caves/        # Cave detail pages
│   │   ├── explore/      # Main exploration interface
│   │   ├── images/       # Images page
│   │   └── search/       # Search page
│   ├── components/       # React components
│   └── lib/              # API, Supabase client, helpers
├── public/
│   └── images/           # Static images (maps, contributors)
└── package.json
```

## Features

- 📍 Interactive floor plans with image markers
- 🔍 Full-text search with fuzzy matching & synonyms
- 🖼️ 7,400+ photographs with Cloudflare Images optimization
- 📱 Responsive design (mobile, tablet, desktop)
- ⌨️ Keyboard navigation (arrow keys, Cmd/Ctrl+K for search)

## Credits

- **Photography**: Arno Klein
- **Annotations**: Deepanjana Klein
- **Website**: Arno Klein

## License

Photographs copyright Arno Klein. All other content copyright Deepanjana Klein.
