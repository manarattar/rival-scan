import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers import analysis, competitors, updates
from .services.seeder import seed_demo_data

app = FastAPI(title="RivalScan API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(competitors.router, prefix="/api")
app.include_router(updates.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")


@app.on_event("startup")
def startup():
    os.makedirs("./data", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
