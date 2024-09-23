from fastapi import FastAPI, Request, Header, Response
from starlette.middleware.cors import CORSMiddleware
from app.database.database import lifespan
from app.routers.auth import router as AuthRouter
from app.routers.supervision import (
    router as SupervisionRouter,
    monitoredAgents,
)
from app.routers.setting import router as SettingRouter
from typing import Optional
import uvicorn
import json

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
app.include_router(SupervisionRouter)
app.include_router(SettingRouter)

def send_phone_event(event):
    # Placeholder function for sending phone event
    print(f'Phone event: {event}')

def get_call_session_info(json_obj, agent, direction):
    # Placeholder function to get call session info
    print(f'Call session info: {json_obj}, Agent: {agent}, Direction: {direction}')


@app.get("/api")
def read_root():
    return {"Hello": "World"}

@app.post("/webhook")
async def webhook(request: Request, validation_token: Optional[str] = Header(None)):
    print(f"monitoredAgnets: {monitoredAgents}")

    if (validation_token is not None):
        headers ={
            'Content-type': 'application/json',
            'Validation-Token': validation_token,
        }
        return Response(
            status_code=200,
            headers=headers)

    body = await request.body()
    body_json = json.loads(body)

    # if body_json and body_json.get('subscriptionId') == g_subscriptionId:
    for party  in body_json.get('body', {}).get('parties', []):
        extension_id = party.get('extentionId')
        status_code = party.get('status', {}).get('code')
        agent = next((a for a in monitoredAgents if a['id'] == extension_id), None)

        if agent:
            if status_code == "Processing":
                agent['status'] = status_code
                send_phone_event('ringing')
            elif status_code == 'Answered':
                if agent['status'] == 'Hold':
                    return Response(status_code = 200)
                agent['status'] = status_code
                get_call_session_info(body_json, agent, party.get('direction'))
            elif status_code == 'Hold':
                agent['status'] = status_code
            elif status_code == 'Disconnected':
                agent['status'] = status_code
                send_phone_event('idle')
    print("WebHook is received")
    return Response(status_code=200)

if __name__=="__main__":    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)