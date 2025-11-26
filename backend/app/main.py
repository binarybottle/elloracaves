from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import caves, images, search

app = FastAPI(
    title="Ellora Caves API",
    description="REST API for Ellora cave temples documentation",
    version="1.0.0"
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount images directory - check both Docker and local paths
if os.path.exists("/app/images"):
    app.mount("/images", StaticFiles(directory="/app/images"), name="images")
elif os.path.exists("../images"):
    app.mount("/images", StaticFiles(directory="../images"), name="images")
elif os.path.exists("images"):
    app.mount("/images", StaticFiles(directory="images"), name="images")

app.include_router(caves.router, prefix="/api/v1/caves", tags=["caves"])
app.include_router(images.router, prefix="/api/v1/images", tags=["images"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])

@app.get("/")
async def root():
    return {
        "message": "Ellora Caves API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
