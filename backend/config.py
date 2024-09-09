from decouple import config
from pydantic import BaseModel

class Config(BaseModel):
    mongo_uri: str = config("MONGO_URL")
    
    authjwt_secret_key: str = config("JWT_SECRET_KEY")
    salt: bytes = config("SALT").encode()

    rc_user_jwt: str = config("RC_USER_JWT")
    rc_app_client_id: str = config("RC_APP_CLIENT_ID")
    rc_app_client_secret: str = config("RC_APP_CLIENT_SECRET")

CONFIG = Config()