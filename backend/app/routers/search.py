from fastapi import APIRouter, Query
from sqlalchemy import text
from app.database import engine

router = APIRouter()

@router.get("")  # Changed from "/" to ""
def search_images(
    q: str = Query(..., min_length=1),
    cave_id: int = Query(None),
    floor_number: int = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    fuzzy: bool = Query(True)  # Enable fuzzy search by default
):
    skip = (page - 1) * page_size
    with engine.connect() as conn:
        where_clauses = ["image_rank = 1"]
        params = {"query": q, "skip": skip, "limit": page_size}
        
        if cave_id:
            where_clauses.append('"image_cave_ID" = :cave_id')
            params["cave_id"] = cave_id
            
        if floor_number:
            # Join with plans table to filter by floor
            where_clauses.append('EXISTS (SELECT 1 FROM plans p WHERE p."plan_ID" = images."image_plan_ID" AND p.plan_floor = :floor_number)')
            params["floor_number"] = floor_number
            
        where_sql = " AND ".join(where_clauses)
        
        # Build search condition with fuzzy matching
        if fuzzy:
            # Use both full-text search AND trigram similarity for fuzzy matching
            search_condition = '''(
                search_vector @@ plainto_tsquery('english', :query)
                OR similarity(image_subject, :query) > 0.3
                OR similarity(image_description, :query) > 0.2
                OR similarity(image_motifs, :query) > 0.3
            )'''
        else:
            # Exact full-text search only
            search_condition = "search_vector @@ plainto_tsquery('english', :query)"
        
        # Get total count
        count_query = f'''
            SELECT COUNT(*) FROM images
            WHERE {where_sql}
            AND {search_condition}
        '''
        total = conn.execute(text(count_query), params).scalar()
        
        # Get results with relevance ranking
        search_query = f'''
            SELECT "image_ID", image_file, image_subject, image_description,
                   "image_cave_ID",
                   COALESCE(
                       ts_rank(search_vector, plainto_tsquery('english', :query)),
                       0
                   ) + 
                   COALESCE(similarity(image_subject, :query), 0) * 2 +
                   COALESCE(similarity(image_description, :query), 0) +
                   COALESCE(similarity(image_motifs, :query), 0) as relevance
            FROM images
            WHERE {where_sql}
            AND {search_condition}
            ORDER BY relevance DESC, image_file
            OFFSET :skip LIMIT :limit
        '''
        results = conn.execute(text(search_query), params).fetchall()
        return {
            "results": [{
                "image": {
                    "id": r[0],
                    "file_path": r[1],
                    "subject": r[2],
                    "description": r[3],
                    "cave_id": r[4],
                    "image_url": f"/images/caves_1200px/{r[1]}",
                    "thumbnail_url": f"/images/caves_thumbs/{r[1]}"
                }
            } for r in results],
            "total": total,
            "page": page,
            "page_size": page_size,
            "query": q
        }

@router.get("/stats")
def get_search_stats():
    with engine.connect() as conn:
        total = conn.execute(text("SELECT COUNT(*) FROM images WHERE image_rank = 1")).scalar()
        return {
            "total_images": total
        }
