from fastapi import FastAPI, Request, APIRouter, Response, Header
from starlette.middleware.cors import CORSMiddleware
from app.database.database import lifespan
from ringcentral import SDK
from typing import Optional
from config import CONFIG
import json
import uvicorn

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

monitoredAgents = []
supervisorDeviceId = "963210043"


def send_phone_event(event):
    # Placeholder function for sending phone event
    print(f'Phone event: {event}')

def get_call_session_info(telephonySessionId, agent, direction):
    # Placeholder function to get call session info
    print(f'Call session info: {telephonySessionId}, Agent: {agent}, Direction: {direction}')

    try:
        endpoint = f'restapi/v1.0/account/~/telephony/sessions/{telephonySessionId}/supervise'
        bodyParams = {
            'mode': 'Listen',
            'supervisorDeviceId': supervisorDeviceId,
            'agentExtensionid': agent.get("id")
        }
        resp = platform.post(endpoint, bodyParams)
        jsonObj = resp.json_dict()
        print(json.dumps(jsonObj, indent=2, sort_keys=True))
    except Exception as e:
        print("Unable to superivse this call. " + str(e))

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/webhook")
async def webhook(request: Request, validation_token: Optional[str] = Header(None)):
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
    parties = body_json.get('body').get('parties')
    telephonySessionId = body_json.get('body').get('telephonySessionId')

    for party  in parties:
        extension_id = party['extensionId']
        status_code = party.get('status').get('code')
        agent = next((a for a in monitoredAgents if a.get("id") == extension_id), None)

        if agent:
            if status_code == "Processing":
                agent['status'] = status_code
                send_phone_event('ringing')
            elif status_code == 'Answered':
                if agent['status'] == 'Hold':
                    return Response(status_code = 200)
                agent['status'] = status_code
                get_call_session_info(telephonySessionId, agent, party.get('direction'))
            elif status_code == 'Hold':
                agent['status'] = status_code
            elif status_code == 'Disconnected':
                agent['status'] = status_code
                send_phone_event('idle')

    print("WebHook is received")
    return Response(status_code=200)

def login():
    try:
        monitoredAgents.clear()
        platform.login(jwt=CONFIG.rc_user_jwt)
        read_call_monitoring_groups()
    except Exception as e:
        print("Unable to authenticate to platform. Check credentials. " + str(e))

def read_call_monitoring_group_members(groupId):
    try:
        endpoint = f'/restapi/v1.0/account/~/call-monitoring-groups/{groupId}/members'
        resp = platform.get(endpoint)
        jsonObj = resp.json_dict()
        for member in jsonObj['records']:
            if member.get("permissions")[0] == "Monitored":
                agentInfo = {
                    "id": member.get("id"),
                    "status": 'Disconnected',
                    "mergedTransription": {
                        "index": -1,
                        "customer": [],
                        "agent": []
                    }
                }
                monitoredAgents.append(agentInfo)
            elif member.get("permissions")[0] == "Monitoring":
                read_supervision_devices(member.get("uri"))
    except Exception as e:
        print ("Unable to read members of this call monitoring group." + str(e))

def read_call_monitoring_groups():
    try:
        endpoint = "/restapi/v1.0/account/~/call-monitoring-groups"
        resp = platform.get(endpoint)
        jsonObj = resp.json()
        for group in jsonObj.records:
            read_call_monitoring_group_members(group.id)
    except Exception as e:
      print ("Unable to call list call monitoring groups." + str(e))

def read_supervision_devices(uri: str):
    try:
        endpoint = f'{uri}/device'
        resp = platform.get(endpoint)
        jsonObj = resp.json_dict()
        supervisorDeviceId = jsonObj['records'][0].get("id")
        print(f"Supervisor Device ID: ", supervisorDeviceId)
    except Exception as e:
        print ("Unable to read devices of this call monitoring group." + str(e))

rcsdk = SDK(CONFIG.rc_app_client_id, CONFIG.rc_app_client_secret, "https://platform.ringcentral.com")
platform = rcsdk.platform()

login()

if __name__=="__main__":
    uvicorn.run("webhook-server:app", host="0.0.0.0", port=5000, reload=True)
