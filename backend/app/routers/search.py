from fastapi import APIRouter, Query
from sqlalchemy import text
from app.database import engine

router = APIRouter()

# Synonym mapping for variant spellings (Indian names, Sanskrit transliterations)
SYNONYM_MAP = {
    'siva': ['siva', 'shiva'],
    'shiva': ['siva', 'shiva'],
    'vishnu': ['vishnu', 'visnu'],
    'visnu': ['vishnu', 'visnu'],
    'krishna': ['krishna', 'krsna'],
    'krsna': ['krishna', 'krsna'],
    'ganesh': ['ganesh', 'ganesha', 'ganesa'],
    'ganesha': ['ganesh', 'ganesha', 'ganesa'],
    'ganesa': ['ganesh', 'ganesha', 'ganesa'],
    'durga': ['durga', 'durgah'],
    'parvati': ['parvati', 'parvathi'],
    'lakshmi': ['lakshmi', 'laksmi'],
    'laksmi': ['lakshmi', 'laksmi'],
    'brahma': ['brahma', 'brahmaa'],
    'indra': ['indra', 'indrah'],
}

def expand_query_with_synonyms(query: str) -> str:
    """Expand query to include synonym variants for better matching"""
    # Check each word in the query
    words = query.lower().split()
    expanded_parts = []
    
    for word in words:
        # Remove common punctuation
        clean_word = word.strip('.,!?;:')
        
        # Check if word has synonyms
        if clean_word in SYNONYM_MAP:
            # Create OR clause with all variants using tsquery syntax (| for OR)
            variants = ' | '.join(SYNONYM_MAP[clean_word])
            expanded_parts.append(f"({variants})")
        else:
            expanded_parts.append(word)
    
    # Join with & (AND) for tsquery
    return ' & '.join(expanded_parts)

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
    
    # Expand query with synonyms for better variant matching
    expanded_query = expand_query_with_synonyms(q)
    
    with engine.connect() as conn:
        where_clauses = ["image_rank = 1"]
        params = {
            "query": q,  # Original for similarity matching
            "expanded_query": expanded_query,  # Expanded for full-text search
            "skip": skip, 
            "limit": page_size
        }
        
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
            # Use both full-text search (with synonyms) AND trigram similarity for fuzzy matching
            search_condition = '''(
                search_vector @@ to_tsquery('english', :expanded_query)
                OR similarity(image_subject, :query) > 0.3
                OR similarity(image_description, :query) > 0.2
                OR similarity(image_motifs, :query) > 0.3
            )'''
        else:
            # Exact full-text search only (with synonyms)
            search_condition = "search_vector @@ to_tsquery('english', :expanded_query)"
        
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
                       ts_rank(search_vector, to_tsquery('english', :expanded_query)),
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
