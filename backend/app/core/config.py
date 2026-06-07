from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "BranchReady API"
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/branchready"
    )
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    admin_username: str = "admin"
    admin_password: str = "change-me"
    admin_token: str = "change-me-admin-token"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
