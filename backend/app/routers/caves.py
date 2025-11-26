from fastapi import APIRouter, Query
from sqlalchemy import text
from typing import List, Optional
from app.database import engine

router = APIRouter()

@router.get("/")
def list_caves(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    tradition: Optional[str] = Query(None)
):
    with engine.connect() as conn:
        where_clause = ""
        params = {"skip": skip, "limit": limit}
        
        if tradition:
            where_clause = 'WHERE cave_religion = :tradition'
            params["tradition"] = tradition
        
        query = f'''
            SELECT "cave_ID", cave_name, cave_religion, cave_dates, cave_description,
                   (SELECT COUNT(*) FROM images WHERE "image_cave_ID" = caves."cave_ID" AND image_rank = 1) as image_count,
                   (SELECT COUNT(DISTINCT plan_floor) FROM plans WHERE "plan_cave_ID" = caves."cave_ID") as floor_count
            FROM caves
            {where_clause}
            ORDER BY "cave_ID"
            OFFSET :skip LIMIT :limit
        '''
        
        caves = conn.execute(text(query), params).fetchall()
        
        return [{
            "id": c[0],
            "cave_number": str(c[0]),
            "name": c[1] or f"Cave {c[0]}",
            "tradition": c[2],
            "date_range": c[3],
            "description": c[4],
            "image_count": c[5],
            "floor_count": c[6]
        } for c in caves]

@router.get("/{cave_number}")
def get_cave(cave_number: str):
    with engine.connect() as conn:
        cave = conn.execute(text('''
            SELECT "cave_ID", cave_name, cave_religion, cave_dates, cave_description
            FROM caves
            WHERE "cave_ID" = :cave_id
        '''), {"cave_id": int(cave_number)}).fetchone()
        
        if not cave:
            return {"error": "Cave not found"}
        
        plans = conn.execute(text('''
            SELECT "plan_ID", plan_floor, plan_image, plan_width, plan_height,
                   (SELECT COUNT(*) FROM images WHERE "image_plan_ID" = plans."plan_ID" AND image_rank = 1) as image_count
            FROM plans
            WHERE "plan_cave_ID" = :cave_id
            ORDER BY plan_floor
        '''), {"cave_id": cave[0]}).fetchall()
        
        return {
            "id": cave[0],
            "cave_number": str(cave[0]),
            "name": cave[1] or f"Cave {cave[0]}",
            "tradition": cave[2],
            "date_range": cave[3],
            "description": cave[4],
            "plans": [{
                "id": p[0],
                "floor_number": p[1],
                "plan_image": p[2],
                "plan_width": p[3],
                "plan_height": p[4],
                "image_count": p[5]
            } for p in plans]
        }

@router.get("/{cave_number}/floors/{floor_number}/images")
def get_cave_floor_images(cave_number: str, floor_number: int):
    with engine.connect() as conn:
        cave = conn.execute(text('SELECT "cave_ID" FROM caves WHERE "cave_ID" = :id'), 
                          {"id": int(cave_number)}).fetchone()
        if not cave:
            return {"error": "Cave not found"}
        
        plan = conn.execute(text('''
            SELECT "plan_ID" FROM plans 
            WHERE "plan_cave_ID" = :cave_id AND plan_floor = :floor
        '''), {"cave_id": cave[0], "floor": floor_number}).fetchone()
        
        if not plan:
            return []
        
        images = conn.execute(text('''
            SELECT "image_ID", image_file, image_subject, image_description,
                   image_plan_x_num, image_plan_y_num, 
                   image_plan_x_norm, image_plan_y_norm,
                   image_thumbnail
            FROM images
            WHERE "image_plan_ID" = :plan_id 
            AND image_rank = 1
            ORDER BY image_file
        '''), {"plan_id": plan[0]}).fetchall()
        
        return [{
            "id": img[0],
            "file_path": img[1],
            "subject": img[2],
            "description": img[3],
            "coordinates": {
                "plan_x_px": img[4],
                "plan_y_px": img[5],
                "plan_x_norm": float(img[6]) if img[6] else None,
                "plan_y_norm": float(img[7]) if img[7] else None
            } if img[4] else None,
            "image_url": f"/images/caves_1200px/{img[1]}",
            "thumbnail_url": f"/images/caves_thumbs/{img[8] or img[1]}"
        } for img in images]
