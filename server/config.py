from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    env: str = "dev"
    firebase_project_id: str = ""
    firebase_api_key: str = ""
    save_to_file: str = "no"

    model_config = ConfigDict(env_file="../.env")


settings = Settings()
