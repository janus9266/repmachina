from fastapi import APIRouter, HTTPException, Header
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime
from typing import Optional
import jwt
from config import CONFIG
from app.models.users import (
    AccessToken,
    RefreshToken,
    UserDocument,
    ACCESS_EXPIRES,
    REFRESH_EXPIRES,
    ALGORITHM,
    create_user,
    retrieve_with_email
)


router = APIRouter (
    prefix="/api/auth",
    tags=["auth"],
)


def verify_oauth_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request())

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return None
        
        return idinfo
    except ValueError:
        return None
    
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expiration = datetime.utcnow() + ACCESS_EXPIRES
    to_encode.update({"exp": expiration})
    encoded_jwt = jwt.encode(to_encode, CONFIG.authjwt_secret_key, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expiration = datetime.utcnow() + REFRESH_EXPIRES
    to_encode.update({"exp": expiration})
    encoded_jwt = jwt.encode(to_encode, CONFIG.authjwt_secret_key, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/login")
async def google_signin(authorization: Optional[str] = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=400, detail="Authentication Failed")
    
    payload = verify_oauth_token(authorization[7:])

    if payload is not None:
        user = await retrieve_with_email(payload["email"])
        
        if user is None:
            user = await create_user(UserDocument(name = payload["name"], email = payload["email"], avatar = payload["picture"]))

        access_token = create_access_token({"sub": user.jwt_subject})
        refresh_token = create_refresh_token({"sub": user.jwt_subject})

        return RefreshToken(access_token = access_token, refresh_token = refresh_token)
    else:
        raise HTTPException(status_code=400, detail="Authentication Failed")        
