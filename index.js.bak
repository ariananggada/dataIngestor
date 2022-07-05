const { PubSub } = require('@google-cloud/pubsub')

const pubSubClient = new PubSub( {
  projectId: 'iot-lowtouch-jumpstart-f03i',
  keyFileName: './key.json',
} )

const batVolt = 4.101
const batteryLevel = (batVolt / 4.1) * 100

const payload = {
  type : 'inboundDataEventMsg',
  networkId: 'tilt-network',
  deviceId: '1VqG8RcpEvKbxJJ5Z8c6TU',
  aliasKey: 'macId',
  time: 1657018543,
  historical: true,

  data: [
    {path: 'tiltAngle/xAxis', value: '0.125'},
    {path: 'tiltAngle/yAxis', value: '-0.099'},
    {path: 'status/netLQI', value: '-0.099'},
    {path: 'status/batVolt', value: batVolt},
    {path: 'status/batteryLevel', value: batteryLevel},
  ]
}

pubSubClient.topic( 'default-processor' ).publishMessage( { data: Buffer.from(JSON.stringify(payload) ) } )