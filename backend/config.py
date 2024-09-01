from decouple import config
from pydantic import BaseModel

class Settings(BaseModel):
    mongo_uri: str = config("MONGO_URL")

CONFIG = Settings()