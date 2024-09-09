from fastapi import Request, APIRouter
from ringcentral import SDK
import json
from config import CONFIG

router = APIRouter (
    prefix="/api/supervision",
    tags=["users"],
)

@router.post("/start")
async def start_subscription():
    login()


# @app.post("/webhook")
# async def webhook(request: Request):
#     body = await request.json()
#     print("Received event: ", body)
#     return {"status": "ok"}

# @app.on_event("startup")
# async def setup_subscription():
#     events = [
#         '/restapi/v1.0/account/~/extension/~/telephony/sessions'
#     ]

#     subscription = rcsdk.create_subscription()
#     subscription.add_events(events)
#     subscription.set_listener(lambda message: print(message))
#     subscription.subscribe()

def read_agent_active_calls(agentExtensionId, supervisorDeviceId):
    try:
        endpoint = f'/restapi/v1.0/account/~/extension/agentExtensionId/active-calls'
        resp = platform.get(endpoint)
        jsonobj = resp.json()
        for record in jsonobj.records:
            if record.result == "In Progress":
                submit_call_supervise_request(record.telephonySessionId, agentExtensionId, supervisorDeviceId)
                break
    except Exception as e:
        print("Unable to read agent's active calls. " + str(e))

def submit_call_supervise_request(telephonySessionId, agentExtensionId, supervisorDeviceId):
    try:
        endpoint = f'/restapi/v1.0/account/~/telephony/sessions/{telephonySessionId}/supervise'
        bodyParams = {
            'mode': 'Listen',
            'supervisorDeviceId': supervisorDeviceId,
            'agentExtensionId': agentExtensionId
        }
        resp = platform.post(endpoint, bodyParams)
        jsonObj = resp.json_dict()
        print(json.dumps(jsonObj, indent=2, sort_keys=True))
    except Exception as e:
        print("Unable to supervise this call. " + str(e))


def read_call_monitoring_groups():
    try:
        endpoint = "/restapi/v1.0/account/~/call-monitoring-groups"
        resp = platform.get(endpoint)
        jsonObj = resp.json()
        print ("Call monitoring groups:")
        for group in jsonObj.records:
            print (f'Call monitoring group name: {group.name} / {group.id}')
            read_call_monitoring_group_members(group.id)
    except Exception as e:
      print ("Unable to call list call monitoring groups." + str(e))

def read_call_monitoring_group_members(groupId):
    try:
        endpoint = f'/restapi/v1.0/account/~/call-monitoring-groups/{groupId}/members'
        resp = platform.get(endpoint)
        jsonObj = resp.json_dict()
        print ("Call monitoring group members:")
        for member in jsonObj['records']:
            print (json.dumps(member, indent=2, sort_keys=True))
    except Exception as e:
        print ("Unable to read members of this call monitoring group." + str(e))

def login():
    try:
        platform.login(jwt=CONFIG.rc_user_jwt)
        read_call_monitoring_groups()
    except Exception as e:
        print("Unable to authenticate to platform. Check credentials. " + str(e))

rcsdk = SDK(CONFIG.rc_app_client_id, CONFIG.rc_app_client_secret, "https://platform.ringcentral.com")
platform = rcsdk.platform()

