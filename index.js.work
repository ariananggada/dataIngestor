// import google pub sub module 
const { PubSub } = require('@google-cloud/pubsub')

const pubSubClient = new PubSub( {
  projectId: 'iot-lowtouch-jumpstart-f03i',
  keyFileName: './key.json',
} )


// import mqtt module
const mqtt = require('mqtt')
const client = mqtt.connect("mqtt://34.128.84.160:1883")

const deviceTopic = 'C4BE847489B90000'
const constTopic = 'parsedData/inclinoMeter/'

const fullTopicName = constTopic+deviceTopic

client.subscribe(fullTopicName, '/#')

client.on('message', function (topic, message, packet) {
  if (topic === 'parsedData/inclinoMeter/C4BE847489B90000/XAxisDat') {
    var xAxisData = message.toString();
  }

  if (topic === 'parsedData/inclinoMeter/C4BE847489B90000/YAxisDat') {
    var yAxisData = message.toString();
  }

  if (topic === 'parsedData/inclinoMeter/C4BE847489B90000/batVolt') {
    var batVoltData = message.toString();
    var batLevelData = batVoltData/4.1*100
  }

  if (topic === 'parsedData/inclinoMeter/C4BE847489B90000/dateTime') {
    var dateTimeData = message.toString();
  }

  if (topic === 'parsedData/inclinoMeter/C4BE847489B90000/netLQI') {
    var netLqiData = message.toString();
  }

  // var variable = topic.split('/')[3]
  // var stringData = message

  console.log(
      'topic:', topic, '\n',
      'variable:', variable, '\n', 
      'data:', stringData
  );

  const payload = {
    type : 'inboundDataEventMsg',
    networkId: 'tilt-network',
    deviceId: '1VqG8RcpEvKbxJJ5Z8c6TU',
    aliasKey: 'macId',
    time: Date.now(),
    historical: true,
  
    data: [
      {path: 'tiltAngle/xAxis', value: xAxisData},
      {path: 'tiltAngle/yAxis', value: yAxisData},
      {path: 'status/netLQI', value: netLqiData},
      {path: 'status/batVolt', value: batVoltData},
      {path: 'status/batteryLevel', value: batLevelData},
    ]
  }
  
  pubSubClient.topic( 'default-processor' ).publishMessage( { data: Buffer.from(JSON.stringify(payload) ) } )

});

