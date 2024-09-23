const server = require('./index')
const WS = require('ws')
const speech = require('@google-cloud/speech')

const client = new speech.SpeechClient({
  keyFilename: './google-cloud.json'
})

function TranscriptionEngine(speakerName, speakerId, agentId) {
  this.speakerId = speakerId
  this.agentId = agentId
  this.transcript = {
    name: speakerName,
    id: speakerId,
    index: 0,
    text: "",
  }
  return this
}

TranscriptionEngine.prototype = {
  transcribe: async function (bufferStream) {
    var thisClass = this
    const [ res ] = await client.recognize({
      audio: {
        content: bufferStream
      },
      config: {
        encoding: 'MULAW', // Adjust based on your audio format
        sampleRateHertz: 8000, // Adjust based on your audio format
        languageCode: 'en-US' // Adjust to your desired language
      }
    });
    if (res.hasOwnProperty('results') && res.results.length > 0) {
      thisClass.transcript.index = res.result_index
      thisClass.transcript.text = res.results?.[0]?.alternatives?.[0]?.transcript
      var text = res.results?.[0]?.alternatives?.[0]?.transcript
      if (text.length > 0) {
        text = text.trim()
        server.sendKeywordEvent(text);
        thisClass.transcript.text = thisClass.transcript.text?.replace(/%HESITATION/g, "")
        server.mergingChannels(thisClass.speakerId, thisClass.transcript, thisClass.agentId)
      }      
    } else {
    }
  },
  analyze: function (text, callback) {
    var parameters = {
      'text': text,
      'features': {
        'keywords': {
          'emotion': true,
          'sentiment': true,
          'limit': 3
        }
      }
    }
  }
}

module.exports = TranscriptionEngine;