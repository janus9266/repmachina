from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.database.database import lifespan
from app.routers.auth import router as AuthRouter

app = FastAPI(
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(AuthRouter)

@app.get("/api")
def read_root():
    return {"Hello": "World"}

if __name__=="__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)