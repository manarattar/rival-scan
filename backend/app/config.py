from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    model_name: str = "gpt-4o-mini"
    mock_mode: bool = False
    cors_origins: str = "*"

    @property
    def use_mock(self) -> bool:
        return self.mock_mode or not self.openai_api_key.strip()

    @property
    def cors_origins_list(self) -> list:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "protected_namespaces": ("settings_",)}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
