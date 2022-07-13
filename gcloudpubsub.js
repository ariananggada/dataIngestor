const { PubSub } = require('@google-cloud/pubsub')

const pubSubClient = new PubSub({
  projectId: '',
  keyFileName: './application_default_credentials.json',
})

// const batVolt = 4.101
// const batteryLevel = (batVolt / 4.1) * 100
// const dateTime = Date.now()
// const macId = 'C4BE847489B90000'

const payload = {
  type: 'inboundDataEventMsg',
  networkId: 'tilt-network',
  deviceId: 'C4BE847489B90000',
  aliasKey: 'macId',
  data: [
    { path: 'tiltAngle/xAxis', value: 0 },
    { path: 'tiltAngle/yAxis', value: 0 },
    { path: 'status/netLQI', value: 218 },
    { path: 'status/batVolt', value: 3 },
    { path: 'status/batteryLevel', value: 90.30 },
    { path: 'macId', value: 'test' }
  ]
}

pubSubClient.topic('default-processor').publishMessage({ data: Buffer.from(JSON.stringify(payload)) })