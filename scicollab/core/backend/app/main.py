// main entry point for FastAPI application

import importlib
import pkgutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.responses import create_success_response
from app.core.audit import init_audit_logger

app = FastAPI(title="SciCollab Backend", version="0.1.0")

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto‑discover routers in modules/*/backend/router.py
def include_module_routers():
    package_name = "modules"
    package = importlib.import_module(package_name)
    for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
        if not is_pkg:
            continue
        try:
            router_mod = importlib.import_module(f"{package_name}.{module_name}.backend.router")
            router = getattr(router_mod, "router")
            app.include_router(router, prefix=f"/api/{module_name}")
        except ModuleNotFoundError:
            # module does not expose a router – skip
            continue

include_module_routers()

# Health check endpoint (core)
@app.get("/health", response_model=dict)
def health_check():
    return create_success_response(data={"status": "ok"})

# Initialize audit logger (creates DB table if missing)
@app.on_event("startup")
async def on_startup():
    await init_audit_logger()

@app.on_event("shutdown")
async def on_shutdown():
    # placeholder for graceful shutdown
    pass
