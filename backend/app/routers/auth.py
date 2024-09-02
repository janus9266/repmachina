from fastapi import APIRouter, HTTPException, Header
from typing import Optional

router = APIRouter (
    prefix="/api/auth",
    tags=["auth"],
)

@router.post("/login")
async def google_signin(authorization: Optional[str] = Header(None)):
    print("************ Token ************", authorization)
    if authorization is None:
        raise HTTPException(status_code=400, detail="Authentication Failed")
    return {"User-Agent": "Test User"}
