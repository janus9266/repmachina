from fastapi import APIRouter, HTTPException, Header
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime
from typing import Optional
import jwt
from config import CONFIG
from app.models.users import (
    UserUpdate,
    update_user,
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
    prefix="/api/users",
    tags=["users"],
)

@router.put("/{user_id}", response_model=UserUpdate)
async def updateUser(user_id: str, user: UserUpdate):
    updatedUser = await update_user(user_id, user)
    if updatedUser:
        return updatedUser
    raise HTTPException(status_code=404, detail="User is not found.")