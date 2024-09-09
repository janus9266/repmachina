from fastapi import APIRouter, HTTPException, Header, Request
from app.models.settings import (
    Setting,
    SettingDocument,
    read_all_settings,
    create_setting,
    retrieve_with_userid,
    update_setting
)

router = APIRouter (
    prefix="/api/settings",
    tags=["settings"],
)

@router.get("/")
async def getAllSettings(request: Request):
    settings = await read_all_settings()
    return settings

@router.get("/{user_id}")
async def retrieveSetting(user_id: str):
    setting = await retrieve_with_userid(user_id)
    if setting:
        return setting
    raise HTTPException(status_code=404, detail="Setting is not found")

@router.post("/", response_model=Setting)
async def createSetting(setting: Setting):
    setting_doc = SettingDocument(**setting.model_dump())
    setting_inserted = await create_setting(setting_doc)
    if setting_inserted:
        return setting_inserted
    raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{setting_id}", response_model=Setting)
async def updateSetting(setting_id: str, setting: Setting):
    updatedSetting = await update_setting(setting_id, setting.model_dump())
    if updatedSetting:
        return updatedSetting
    raise HTTPException(status_code=404, details="Setting is not found.")