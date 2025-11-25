# Ellora Caves Website

Complete photographic documentation of Ellora cave temples.

## Quick Start

1. Make sure your PostgreSQL database is running with the elloracaves database

2. Start the services:
```bash
docker-compose up -d
```

3. View the site:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

4. View logs:
```bash
docker-compose logs -f
```

## Database Connection

Uses Unix socket to connect to local PostgreSQL:
- Database: elloracaves
- User: arno
- Connection: postgresql://arno@/elloracaves

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
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Next Steps

1. Copy your images to:
   - `images/caves_1200px/` - Web images
   - `images/caves_thumbs/` - Thumbnails
   - `images/plans/` - Floor plans

2. Access the site at http://localhost:3000

3. Customize colors in `frontend/tailwind.config.js`
