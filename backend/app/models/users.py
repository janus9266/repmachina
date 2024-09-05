from datetime import datetime
from typing import Annotated, Any, Optional
from datetime import datetime, timedelta
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

ACCESS_EXPIRES = timedelta(hours=6)
REFRESH_EXPIRES = timedelta(days=3)
ALGORITHM = "HS256"

class AccessToken(BaseModel):
    access_token: str
    access_token_expires: timedelta = ACCESS_EXPIRES

class RefreshToken(AccessToken):
    refresh_token: str
    refresh_token_expires: timedelta = REFRESH_EXPIRES

class User(BaseModel):
    name: str = Field(...)
    email: str = Field(...)
    avatar: str = Field(...)

class UserUpdate(User):
    client_id: str = Field(...)
    client_secret: str = Field(...)
    jwt_token: str = Field(...)
    client_name: str = Field(...)
    client_password: str = Field(...)
    ext_number: str = Field(...)

class UserDocument(Document, UserUpdate):
    class Settings:
        name = "users"

    @property
    def jwt_subject(self) -> dict[str, Any]:
        return {"name": self.name, "email": self.email, "avatar": self.avatar, "id": str(self.id)}

async def create_user(user: UserDocument) -> UserDocument:
    return await user.insert()

async def retrieve_with_email(email: str) -> UserDocument:
    return await UserDocument.find_one({"email": email})    

async def update_user(user_id: str, user_update: dict) -> UserDocument:
    user = await UserDocument.get(user_id)
    if user:
        user = await user.update({"$set": user_update})
    return user