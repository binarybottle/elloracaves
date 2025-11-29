# Ellora Caves Website

Complete photographic documentation of Ellora cave temples.

## Quick Start

### 1. Start Backend (if not running)
```bash
cd /Users/arno/elloracaves
docker-compose up backend
```

Wait for: `Uvicorn running on http://0.0.0.0:8000`

### 2. Start Frontend
```bash
cd /Users/arno/elloracaves/frontend
npm run dev
```

Wait for: `ready started server on 0.0.0.0:3000`

### 3. Open Explorer
Open browser: **http://localhost:3000/explore?cave=10&floor=1**

## View the Site

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Connection

Uses Unix socket to connect to local PostgreSQL:
- Database: elloracaves
- User: arno
- Connection: postgresql://arno@/elloracaves

Make sure your PostgreSQL database is running with the elloracaves database.

## Project Structure

- `backend/` - FastAPI backend
- `frontend/` - Next.js frontend
- `images/` - Image storage
- `docker-compose.yml` - Service orchestration

## Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Success Checklist

You should see:
- [ ] Black background with gradient cave map
- [ ] Clickable cave numbers positioned on contour
- [ ] "The Ellora caves" title in top left
- [ ] Floor plans on left (if cave has multiple floors)
- [ ] Interactive floor plan with markers
- [ ] Large image display in center
- [ ] Info panel on right
- [ ] Thumbnail gallery at bottom

## Common Issues

### Issue: "Cannot GET /explore"
**Solution**: Make sure you installed dependencies first:
```bash
cd frontend
npm install
npm run dev
```

### Issue: Images not loading
**Solution**: Make sure backend is running:
```bash
docker-compose up backend
```

### Issue: Map not showing
**Solution**: Verify map files exist:
```bash
ls -lh frontend/public/images/maps/
# Should show:
# map_260x1024px_gradient.png (69KB)
# map_260x1024px_photo.png (358KB)
```

### Issue: Cave numbers not positioned
**Solution**: 
1. Open browser console (F12)
2. Check for errors
3. Verify CaveMap.tsx imported correctly

### Issue: API errors in console
**Solution**: Check backend is accessible:
```bash
curl http://localhost:8000/api/v1/caves/10
# Should return JSON data
```

## Test URLs

Try these different caves:

**Buddhist Caves:**
```
http://localhost:3000/explore?cave=5&floor=1
http://localhost:3000/explore?cave=10&floor=1  # Cave 10 (Vishvakarma)
http://localhost:3000/explore?cave=12&floor=1  # Cave 12 (Teen Tal)
```

**Hindu Caves:**
```
http://localhost:3000/explore?cave=16&floor=1  # ⭐ Kailasa Temple
http://localhost:3000/explore?cave=16&floor=2  # Kailasa Floor 2
http://localhost:3000/explore?cave=29&floor=1  # Dhumar Lena
```

**Jain Caves:**
```
http://localhost:3000/explore?cave=32&floor=1  # ⭐ Indra Sabha
http://localhost:3000/explore?cave=32&floor=2  # Indra Sabha Floor 2
http://localhost:3000/explore?cave=33&floor=1
```

## Setup

1. Copy your images to:
   - `images/caves_1200px/` - Web images
   - `images/caves_thumbs/` - Thumbnails
   - `images/plans/` - Floor plans

2. Access the site at http://localhost:3000

3. Customize colors in `frontend/tailwind.config.js`

## Database Backup

### Quick Backup

Create a backup of the entire database:

```bash
# Backup to a file with timestamp
pg_dump -d elloracaves > backup_elloracaves_$(date +%Y%m%d_%H%M%S).sql

# Or specify the full path
/opt/homebrew/Cellar/postgresql@17/17.7/bin/pg_dump -d elloracaves > backup_elloracaves_$(date +%Y%m%d_%H%M%S).sql
```

### Backup with Compression

For large databases, use compression:

```bash
pg_dump -d elloracaves | gzip > backup_elloracaves_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore from Backup

```bash
# From uncompressed backup
psql -d elloracaves < backup_elloracaves_20251129_120000.sql

# From compressed backup
gunzip -c backup_elloracaves_20251129_120000.sql.gz | psql -d elloracaves
```

### Backup Specific Tables

If you only want to backup specific tables:

```bash
# Backup only caves and images tables
pg_dump -d elloracaves -t caves -t images -t plans > backup_core_tables.sql
```

### Automated Backups

Create a backup script (`scripts/backup_db.sh`):

```bash
#!/bin/bash
BACKUP_DIR="$HOME/elloracaves_backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -d elloracaves | gzip > "$BACKUP_DIR/elloracaves_$TIMESTAMP.sql.gz"
echo "✅ Backup created: $BACKUP_DIR/elloracaves_$TIMESTAMP.sql.gz"

# Optional: Keep only last 10 backups
ls -t "$BACKUP_DIR"/elloracaves_*.sql.gz | tail -n +11 | xargs rm -f
```

Make it executable and run:
```bash
chmod +x scripts/backup_db.sh
./scripts/backup_db.sh
```

### Backup Before Major Changes

Always backup before:
- Renaming cave IDs
- Bulk updates to image priorities
- Schema changes
- Importing new data

```bash
# Quick backup with descriptive name
pg_dump -d elloracaves > backup_before_cave_rename_$(date +%Y%m%d).sql
```
