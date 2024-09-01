from fastapi import APIRouter, HTTPException

router = APIRouter (
    prefix="/api/auth",
    tags=["auth"],
)

@router.post("/login")
async def google_signin(token: str):
    print("************ Token ************", token)
    return