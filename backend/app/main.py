from contextlib import asynccontextmanager

from pathlib import Path
from fastapi.responses import FileResponse
from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    auth,
    categories,
    customers,
    ledger,
    products,
    purchases,
    reports,
    returns,
    sales,
    suppliers,
    users,
)
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    auth.router,
    users.router,
    categories.router,
    products.router,
    suppliers.router,
    customers.router,
    purchases.router,
    sales.router,
    returns.router,
    ledger.router,
    reports.router,
):
    app.include_router(router, prefix="/api")


@app.get("/health")
@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "app": settings.app_name}




# Serve the built React frontend from the same Render service.
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    index_file = FRONTEND_DIST / "index.html"

    if not index_file.is_file():
        raise HTTPException(
            status_code=404,
            detail="Frontend build not found. Check the Render build command.",
        )

    requested_file = (FRONTEND_DIST / full_path).resolve()

    # Serve existing frontend assets safely.
    if (
        requested_file.is_file()
        and FRONTEND_DIST.resolve() in requested_file.parents
    ):
        return FileResponse(requested_file)

    # Don't return index.html for missing JavaScript, CSS or image files.
    if Path(full_path).suffix:
        raise HTTPException(status_code=404, detail="File not found")

    # React Router routes such as /login, /admin and /billing.
    return FileResponse(index_file)
