require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
var fs = require('fs')

const mongoose = require('mongoose');
const PhoneEngine = require('./supervisor-engine');
const RingCentral = require('@ringcentral/sdk').SDK

const authRouter = require('./routes/authRoutes');
const settingRouter = require('./routes/settingRoutes');

const Keyword = require('./models/keywords')

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Could not connect to MongoDB", err));

var monitoredAgents = []
var supervisorExtensionId = ""
let supervisor = new PhoneEngine()
var eventResponse = null
var g_subscriptionId = ""
var keyWordStrings = []

var rcAppClientId = ""
var rcAppClientSecret = ""
var rcUserJwt = ""
var sipInfoUsername = ""
var sipInfoPassword = ""
var sipInfoDeviceId = ""

var platform = null

// Create the server
const app = express()

app.use(express.static(path.join(__dirname, 'client/build')))
app.use(express.json())
app.use(cors({
  origin: '*'
}));

app.use('/api/auth', authRouter);
app.use('/api/settings', settingRouter);

// Receiving RingCentral webhooks notifications
app.post('/webhookcallback', function (req, res) {
  if (req.headers.hasOwnProperty("validation-token")) {
    res.setHeader('Validation-Token', req.headers['validation-token']);
    res.statusCode = 200;
    res.end();
  } else {
    console.log("WebHookCallback")
    var body = req.body
    var jsonObj = JSON.parse(JSON.stringify(body))
    if (jsonObj.subscriptionId == g_subscriptionId) {
      for (var party of jsonObj.body.parties) {
        if (party.status.code === "Proceeding") {
          var agent = monitoredAgents.find(o => o.id == party.extensionId)
          if (agent) {
            agent.status = party.status.code
            sendPhoneEvent('ringing')
          }
        } else if (party.status.code === "Answered") {
          console.log("Answered")
          var agent = monitoredAgents.find(o => o.id == party.extensionId)
          if (agent) {
            if (agent.status == "Hold")
              return
            agent.status = party.status.code
            getCallSessionInfo(jsonObj, agent, party.direction)
          }
        } else if (party.status.code === "Hold") {
          var agent = monitoredAgents.find(o => o.id == party.extensionId)
          if (agent) {
            agent.status = party.status.code
            // Can pause recording/monitoring for this party
          }
        } else if (party.status.code === "Disconnected") {
          var agent = monitoredAgents.find(o => o.id == party.extensionId)
          if (agent) {
            agent.status = party.status.code
            sendPhoneEvent('idle')
          }
        }
      }
      res.statusCode = 200;
      res.end();
    }
  }
})

app.post('/api/platform/login', async (req, res) => {
  var setting = req.body;

  rcAppClientId = setting.client_id;
  rcAppClientSecret = setting.client_secret;
  rcUserJwt = setting.jwt_token;
  sipInfoUsername = setting.user_name;
  sipInfoPassword = setting.password;
  sipInfoDeviceId = setting.device_id;

  const rcsdk = new RingCentral({
    server: process.env.RC_SERVER_URL,
    clientId: rcAppClientId,
    clientSecret: rcAppClientSecret
  })

  platform = rcsdk.platform();

  await platform.login({
    jwt: rcUserJwt
  })

  await login();

  keyWordStrings = await Keyword.find({});
})

app.get('/api/events', async (req, res) => {
  console.log("METHOD EVENTS")
  res.set({
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Content-Encoding': 'none'
  });

  res.statusCode = 200;

  if (supervisorExtensionId != "") {
    supervisor.initializePhoneEngine(sipInfoUsername, sipInfoPassword, sipInfoDeviceId)
  }

  req.on('close', () => {
    console.log('Client disconnected');
    res.end();
  });
  eventResponse = res
});

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})

async function getCallSessionInfo(payload, agent, direction) {
  console.log('Get Call Session Info')
  var body = payload.body
  var endpoint = `/restapi/v1.0/account/~/telephony/sessions/${body.telephonySessionId}`
  var res = await platform.get(endpoint)
  var json = await res.json()

  agent.mergedTranscription = {
    index: -1,
    customer: [],
    agent: []
  }
  const forLoop = async _ => {
    for (var party of json.parties) {
      if (party.status.code != "Answered")
        continue
      var params = {
        ownerId: payload.ownerId,
        telSessionId: json.id,
        extensionId: agent.id.toString() //
      }
      if (direction == "Inbound") { // Inbound call
        if (party.direction == "Outbound") {
          params['partyId'] = party.id
          params['speakerName'] = (party.from.name) ? party.from.name : "Customer"
          params['speakerId'] = 0 // a customer
        } else {
          if (party.extensionId == agent.id.toString()) {
            params['partyId'] = party.id
            params['speakerName'] = (party.to.name) ? party.to.name : "Agent"
            params['speakerId'] = 1 // an agent
          }
        }
      } else { // Outbound call
        if (party.direction == "Outbound") {
          if (party.extensionId == agent.id.toString()) {
            params['partyId'] = party.id
            params['speakerName'] = "Agent" // (party.from.name) ? party.from.name : "Agent"
            params['speakerId'] = 1 // a customer
          }
        } else {
          params['partyId'] = party.id
          params['speakerName'] = "Customer" // (party.from.name) ? party.from.name : "Customer"
          params['speakerId'] = 0 // an agent
        }
      }
      await submitSuperviseRequest(params)
    }
  }
  forLoop()
}

async function submitSuperviseRequest(inputParams) {
  try {
    console.log("SubmitSupervise: ", inputParams);
    var endpoint = `/restapi/v1.0/account/~/telephony/sessions/`
    endpoint += `${inputParams.telSessionId}/parties/${inputParams.partyId}/supervise`
    var agentObj = {}
    agentObj['speakerName'] = inputParams.speakerName
    agentObj['partyId'] = inputParams.partyId
    agentObj['speakerId'] = inputParams.speakerId
    agentObj['agentId'] = inputParams.extensionId
    supervisor.setChannel(agentObj)
    var params = {
      mode: 'Listen',
      supervisorDeviceId: sipInfoDeviceId,
      agentExtensionid: inputParams.extensionId
    }
    params['agentExtensionId'] = inputParams.extensionId
    await platform.post(endpoint, params)
    console.log("POST supervise succeeded")
  } catch (e) {
    console.log("POST supervise failed")
    console.log(e)
  }
}

function sendKeywordEvent(text) {
  console.log("Analyze: ", text);
  var words = text.split(" ");
  for (var word of words) {
    for (var keyword of keyWordStrings) {
      if (keyword.keyword === word) {
        var t = JSON.stringify({"keyword": keyword.keyword, "text": keyword.text})
        var res = 'event: keyEvent\ndata: ' + t + '\n\n';
        eventResponse.write(res);
      }
    }
  }
}

function sendPhoneEvent(status) {
  console.log("Phone Status: ", status);
  var res = 'event: phoneEvent\ndata: ' + status + '\n\n'
  console.log("Event Response: ", res)
  if (eventResponse != null) {
    if (!eventResponse.finished) {
      console.log("Event Statues")
      eventResponse.write(res);
    } else {
      console.log("eventResponse is finished")
    }
  } else {
    console.log("eventResponse is null")
  }
}

function sendTranscriptEvents(transcript) {
  var t = JSON.stringify(transcript)
  var res = 'event: transcriptUpdate\ndata: ' + t + '\n\n'
  if (eventResponse != null) {
    if (!eventResponse.finished) {
      eventResponse.write(res);
    } else {
      console.log("eventResponse is finished")
    }
  } else {
    console.log("eventResponse is null")
  }
}

function mergingChannels(speakerId, transcript, agentId) {
  var agentInfo = monitoredAgents.find(o => o.id == agentId)
  if (speakerId == 0) { // customer
    for (let i = 0; i < agentInfo.mergedTranscription.customer.length; i++) {
      if (agentInfo.mergedTranscription.customer[i].index === transcript.index) {
        transcript.index = agentInfo.mergedTranscription.index
        return sendTranscriptEvents(transcript)
      }
    }
    agentInfo.mergedTranscription.index++
    var item = {
      index: transcript.index,
      text: transcript.text
    }
    agentInfo.mergedTranscription.customer.push(item)
    transcript.index = agentInfo.mergedTranscription.index
    sendTranscriptEvents(transcript)
  } else { // agent
    for (let i = 0; i < agentInfo.mergedTranscription.agent.length; i++) {
      if (agentInfo.mergedTranscription.agent[i].index === transcript.index) {
        transcript.index = agentInfo.mergedTranscription.index
        return sendTranscriptEvents(transcript)
      }
    }
    agentInfo.mergedTranscription.index++
    var item = {
      index: transcript.index,
      text: transcript.text
    }
    agentInfo.mergedTranscription.agent.push(item)
    transcript.index = agentInfo.mergedTranscription.index
    sendTranscriptEvents(transcript)
  }
}

async function login() {
  var loggedIn = await platform.loggedIn()
  if (loggedIn) {
    console.log("Still logged in => good to call APIs")
    await readCallMonitoringGroup()
    console.log("supervisorExtensionId: " + supervisorExtensionId)
    startNotification()
  }
}

function startNotification() {
  console.log("startNotification")
  try {
    g_subscriptionId = fs.readFileSync("subscriptionid.txt")
    if (g_subscriptionId != "") {
      console.log("saved subId: " + g_subscriptionId)
      checkRegisteredWebHookSubscription()
    } else {
      startWebhookSubscription()
    }
  } catch (e) {
    console.log("The subscriptionid.txt file does not exist.")
    startWebhookSubscription()
  }
}

async function startWebhookSubscription() {
  console.log("startWebhookSubscription")
  var eventFilters = []
  for (var agent of monitoredAgents) {
    eventFilters.push(`/restapi/v1.0/account/~/extension/${agent.id}/telephony/sessions`)
  }
  console.log(eventFilters)
  var bodyParams = {
    eventFilters: eventFilters,
    deliveryMode: {
      transportType: 'WebHook',
      address: process.env.WEBHOOK_DELIVERY_ADDRESS
    }
  }

  try {
    var res = await platform.post('/restapi/v1.0/subscription', bodyParams)
    console.log("Subscribed")
    var jsonObj = await res.json()
    console.log("Ready to receive telephonyStatus notification via WebHook.")
    g_subscriptionId = jsonObj.id
    fs.writeFileSync("subscriptionid.txt", jsonObj.id)
  } catch (e) {
    console.log("Failed? ", e.message)
  }
}

async function readCallMonitoringGroup() {
  var resp = await platform.get('/restapi/v1.0/account/~/call-monitoring-groups')
  var jsonObj = await resp.json()
  monitoredAgents = []
  for (var group of jsonObj.records) {
    var resp = await platform.get(`/restapi/v1.0/account/~/call-monitoring-groups/${group.id}/members`)
    var jsonObj1 = await resp.json()
    for (var member of jsonObj1.records) {
      if (member.permissions[0] == "Monitored") {
        console.log("Monitored Agent: " + member.extensionNumber)
        var agentInfo = {
          id: member.id,
          status: 'Disconnected',
          mergedTranscription: {
            index: -1,
            customer: [],
            agent: []
          }
        }
        monitoredAgents.push(agentInfo)
      } else if (member.permissions[0] == "Monitoring") {
        supervisorExtensionId = member.id
      }
    }
  }
}

async function checkRegisteredWebHookSubscription() {
  console.log("checkRegisteredWebHookSubscription");
  try {
    let response = await platform.get('/restapi/v1.0/subscription')
    let jsonObj = await response.json()
    if (jsonObj.records.length > 0) {
      for (var record of jsonObj.records) {
        console.log("Subscription exist => delete it then subscribe a new one")
        await platform.delete('/restapi/v1.0/subscription/' + record.id)
      }
    }
    startWebhookSubscription()
  } catch (e) {
    console.log("checkRegisteredWebHookSubscription ERROR")
    console.log(e)
    login()
  }
}

module.exports.mergingChannels = mergingChannels;
module.exports.sendPhoneEvent = sendPhoneEvent;
module.exports.sendKeywordEvent = sendKeywordEvent;