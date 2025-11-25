from fastapi import APIRouter
from sqlalchemy import text
from app.database import engine

router = APIRouter()

@router.get("/{image_id}")
def get_image(image_id: int):
    with engine.connect() as conn:
        image = conn.execute(text('''
            SELECT i."image_ID", i.image_file, i.image_subject, i.image_description,
                   i.image_motifs, i.image_medium, i."image_cave_ID", i."image_plan_ID",
                   i.image_plan_x_num, i.image_plan_y_num,
                   i.image_plan_x_norm, i.image_plan_y_norm,
                   p.plan_floor
            FROM images i
            LEFT JOIN plans p ON i."image_plan_ID" = p."plan_ID"
            WHERE i."image_ID" = :id
        '''), {"id": image_id}).fetchone()
        if not image:
            return {"error": "Image not found"}
        return {
            "id": image[0],
            "file_path": image[1],
            "subject": image[2],
            "description": image[3],
            "motifs": image[4],
            "medium": image[5],
            "cave_id": image[6],
            "plan_id": image[7],
            "floor_number": image[12],
            "coordinates": {
                "plan_x_px": image[8],
                "plan_y_px": image[9],
                "plan_x_norm": float(image[10]) if image[10] else None,
                "plan_y_norm": float(image[11]) if image[11] else None
            } if image[8] else None,
            "image_url": f"/images/caves_1200px/{image[1]}",
            "thumbnail_url": f"/images/caves_thumbs/{image[1]}"
        }
