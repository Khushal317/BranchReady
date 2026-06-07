from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import admin, public
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.schemas.health import HealthResponse


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(public.router, prefix="/api")
    app.include_router(admin.router, prefix="/api/admin")

    @app.get("/health", response_model=HealthResponse)
    def health_check() -> HealthResponse:
        return HealthResponse(status="ok", app=settings.app_name)

    return app


app = create_app()
