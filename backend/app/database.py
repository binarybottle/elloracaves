from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://arno@/elloracaves")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def execute_query(query, params=None):
    with engine.connect() as conn:
        if params:
            result = conn.execute(text(query), params)
        else:
            result = conn.execute(text(query))
        return result.fetchall()
