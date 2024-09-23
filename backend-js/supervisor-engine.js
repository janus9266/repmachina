const fs = require('fs')
const RtpPacket = require('werift-rtp')
const Softphone = require('ringcentral-softphone').default
var server = require('./index')
const TranscriptionEngine = require('./trasncription-engine')

var MAXBUFFERSIZE = 20480

function PhoneEngine() {
  this.channels = []
  this.softphone = null
  return this
}

PhoneEngine.prototype = {
  initializePhoneEngine: async function (username, password, deviceId) {
    this.softphone = new Softphone({
      username: username,
      password: password,
      authorizationId: deviceId
    });
    // this.softphone.enableDebugMode();

    if (this.softphone) {
      console.log("Has been initialized")
    } else {
      console.log("SP initialization failed")
      return
    }

    try {
      await this.softphone.register();
      server.sendPhoneEvent('ready')
      // detect inbound call
      this.softphone.on('invite', async (sipMessage) => {

        console.log("SIP Invite")
        var headers = sipMessage.headers['p-rc-api-ids'].split(";")
        if (sipMessage.headers['p-rc-api-monitoring-ids']) {
          console.log("p-rc-api-monitoring-ids ", sipMessage.headers['p-rc-api-monitoring-ids'])
          headers = sipMessage.headers['p-rc-api-monitoring-ids'].split(";")
        }

        var partyId = headers[0].split("=")[1]
        var channelIndex = 0

        for (channelIndex = 0; channelIndex < this.channels.length; channelIndex++) {
          if (this.channels[channelIndex].partyId == partyId) {
            this.channels[channelIndex].callId = sipMessage.headers['Call-Id']
            this.channels[channelIndex].transcription = new TranscriptionEngine(this.channels[channelIndex].speakerName, this.channels[channelIndex].speakerId, this.channels[channelIndex].agentId)
            break
          }
        }

        // answer the call
        this.channels[channelIndex].callSession = await this.softphone.answer(sipMessage);
        server.sendPhoneEvent('connected')

        // receive audio
        var buffer = null
        // var speachRegconitionReady = true

        // Create Transcription engine
        // this.channels[channelIndex].transcription.createSocket(8000, (err, res) => {
        //     if (!err) {
        //       speachRegconitionReady = true
        //       console.log("TranscriptionSocket created! " + res)
        //     }else{
        //       console.log("TranscriptionSocket creation failed!!!!!")
        //     }
        // })

        this.channels[channelIndex].callSession.on('audioPacket', (rtpPacket) => {
          if (this.channels[channelIndex].doRecording)
            this.channels[channelIndex].audioStream.write(rtpPacket.payload)

          if (buffer != null) {
            buffer = Buffer.concat([buffer, Buffer.from(rtpPacket.payload)])
          } else {
            buffer = Buffer.from(rtpPacket.payload)
          }
          if (buffer.length > MAXBUFFERSIZE) {
            console.log(buffer.length, buffer)
            this.channels[channelIndex].transcription.transcribe(buffer.toString('base64'))
            // if (speachRegconitionReady){
            //   console.log("Transcribe===")
            //   this.channels[channelIndex].transcription.transcribe(buffer)
            // }else{
            //   console.log(`Dumping data of party ${this.channels[channelIndex].partyId} / ${this.channels[channelIndex].speakerName}`)
            // }
            buffer = null
          }
        });

        // Either the agent or the customer hang up
        this.channels[channelIndex].callSession.once('disposed', () => {
          console.log("RECEIVE BYE MESSAGE => Hanged up now for this channel:")
          console.log("Stop recording!")

          console.log(`Agent callId: ${this.channels[channelIndex].callId}`)
          console.log(`Agent party id: ${this.channels[channelIndex].partyId}`)
          server.sendPhoneEvent('ready')
          if (this.channels[channelIndex].doRecording) {
            this.channels[channelIndex].audioStream.end()
            this.channels[channelIndex].audioStream.close()
            this.channels[channelIndex].audioStream = null
          }

          var thisClass = this
          setTimeout(function (partyId) {
            var index = thisClass.channels.findIndex(c => c.partyId === partyId)
            if (index >= 0) {
              thisClass.channels[index].transcription = null
              thisClass.channels.splice(index, 1)
            }
          }, 10000, this.channels[channelIndex].partyId)
        });
      });
    } catch (e) {
      console.log("FAILED REGISTER?")
      console.log(e)
    }
  },
  setChannel: function (agentObj) {
    var channel = {
      speakerName: agentObj.speakerName,
      speakerId: agentObj.speakerId,
      agentId: agentObj.agentId,
      doRecording: false,
      doTranslation: false,
      partyId: agentObj.partyId,
      callId: "",
      // watson: null,
      callSession: null,
      audioStream: null
    }
    this.channels.push(channel)
  },
}
module.exports = PhoneEngine;
