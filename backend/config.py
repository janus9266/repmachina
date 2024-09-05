from decouple import config
from pydantic import BaseModel

class Settings(BaseModel):
    mongo_uri: str = config("MONGO_URL")
    
    authjwt_secret_key: str = config("JWT_SECRET_KEY")
    salt: bytes = config("SALT").encode()

CONFIG = Settings()