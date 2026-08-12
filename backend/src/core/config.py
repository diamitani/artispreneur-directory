"""Artispreneur v3 backend settings."""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Artispreneur v3"
    debug: bool = False
    jwt_secret: str = os.getenv("JWT_SECRET", "artispreneur-dev-secret-change-in-prod")
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7
    cors_origins: list[str] = ["http://localhost:3000", "https://artispreneur.com"]

    # LLM providers
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    default_provider: str = "anthropic"
    default_model: str = "claude-sonnet-4-20250514"

    # AgentCore (optional Bedrock integration)
    agentcore_harness_arn: str = os.getenv("AGENTCORE_HARNESS_ARN", "")
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")

    # Data
    data_dir: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

    model_config = {"env_prefix": "ARTIS_", "case_sensitive": False}


settings = Settings()
