from ringcentral import SDK
import json
from config import CONFIG

rcsdk = SDK("RC_APP")

def read_call_monitoring_groups():
    try:
        endpoint = "/restapi/v1.0/account/~/call-monitoring-groups"
        resp = platform.get(endpoint)
        jsonObj = resp.json()
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

login()