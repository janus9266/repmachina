from datetime import datetime
from typing import Annotated, Any, Optional
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class User(BaseModel):
    name: str = Field(...)
    email: str = Field(...)

class UserDocument(Document, User):
    class Settings:
        name = "users"