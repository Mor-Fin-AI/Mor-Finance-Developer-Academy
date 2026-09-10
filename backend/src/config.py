from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    cors_origins: List[str] = ["http://localhost:5173", "https://mor-finance-developer-academy.onrender.com", "https://morfinance.ai"]
    mongodb_uri: str = "mongodb://localhost:27017/devjobs"
    secret_key: str = "dev_secret_jwt_key_fallback_12345"
    jwt_algorithm: str = "HS256"

    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:5173"

    default_llm: str = "openclaw" 
    claude_api_key: str = ""
    hermes_api_url: str = "http://localhost:11434/v1"
    hermes_model: str = "hermes-3-llama-3.1-8b"
    mentor_api_url: str = "https://frontend-v2-eta-red.vercel.app/api/agents/mentors/ask"
    mentor_bearer_token: str = ""
    web3_career_api_key: str = ""
    web3_career_token: str = ""


settings = Settings()
