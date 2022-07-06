const { PubSub } = require('@google-cloud/pubsub')

const pubSubClient = new PubSub({
  projectId: 'iot-lowtouch-jumpstart-f03i',
  keyFileName: './key.json',
})

// const batVolt = 4.101
// const batteryLevel = (batVolt / 4.1) * 100
// const dateTime = Date.now()
// const macId = 'C4BE847489B90000'

const payload = {
  type: 'inboundDataEventMsg',
  networkId: 'tilt-network',
  deviceId: '5678',
  aliasKey: 'serialNumber',
  data: [
    { path: 'tiltAngle/xAxis', value: 0 },
    { path: 'tiltAngle/yAxis', value: 0 },
    { path: 'status/netLQI', value: 0 },
    { path: 'status/batVolt', value: 0 },
    { path: 'status/batteryLevel', value: 0 },
    { path: 'macId', value: '1234' }
  ]
}

pubSubClient.topic('default-processor').publishMessage({ data: Buffer.from(JSON.stringify(payload)) })