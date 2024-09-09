from typing import Annotated, Any, Optional
from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import Optional

class Setting(BaseModel):
    user_id: str = Field(...)
    client_id: str = Field(...)
    client_secret: str = Field(...)
    jwt_token: str = Field(...)
    user_name: str = Field(...)
    password: str = Field(...)
    ext_number: str = Field(...)

class SettingDocument(Document, Setting):
    class Settings:
        name = "settings"

async def read_all_settings() -> list[SettingDocument]:
    return await SettingDocument.find_all().to_list()

async def create_setting(setting: SettingDocument) -> SettingDocument:
    return await setting.insert()

async def retrieve_with_userid(userid: str) -> SettingDocument:
    return await SettingDocument.find_one({"user_id": userid})

async def update_setting(setting_id: str, setting_update: dict) -> SettingDocument:
    setting = await SettingDocument.get(setting_id)
    if setting:
        setting = await setting.update({"$set": setting_update})
    return setting