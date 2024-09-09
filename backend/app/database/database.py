from fastapi import FastAPI
from config import CONFIG
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.users import UserDocument
from app.models.settings import SettingDocument

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.db = AsyncIOMotorClient(CONFIG.mongo_uri).repmachina
    await init_beanie(app.db, document_models=[
        UserDocument,
        SettingDocument
    ])
    yield