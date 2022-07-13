// import google pub sub module 
const { PubSub } = require('@google-cloud/pubsub')

const pubSubClient = new PubSub( {
  projectId: 'iot-general-dev-2jg0',
  keyFileName: '../application_default_credentials.json',
} )


// import mqtt module
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://34.101.133.187:1883");

const deviceMacId = 'C4BE847489B90000'
client.subscribe("C4BE847489B90000/#");

console.log("start subscribing....");

function pad_with_zeroes(number, length) {
  let my_string = "" + number;
  while (my_string.length < length) {
    my_string = "0" + my_string;
  }

  return my_string;
}

var onMessageMqttCounter = 0;

var batLevelArray = [];
var dateTimeArray = [];
var netLqiArray = [];
var xAxisDataArray = [];
var yAxisDataArray = [];


client.on('message', function (topic, message, packet) {
  // // data from sensors are separated into 2 main topic,
  // // sensorId/UPDATE
  // // sensorId/SENSOR/x
  var updateTopicData = {};
  var sensorTopicData = {};

  // // parse sensorId/UPDATE topic
  if (topic === "C4BE847489B90000/UPDATE") {
    let updateMessage = message;

    if (updateMessage) {
      // // // netlqi parse
      let netLqi = {};
      netLqi.topic = "netLQI";
      netLqi.payload = updateMessage[28];
      updateTopicData.netLqi = netLqi;

      // // // deviceBat parse
      let deviceBat = {};
      deviceBat.topic = "deviceBat";
      if (updateMessage[42] != 0x0) {
        // // // // by returning nothing, the next node will receive nothing which mean it will not start
        deviceBat.payload = 0x0000;
        deviceBat.payload |= updateMessage[42];
        deviceBat.payload |= updateMessage[43] << 8;
        deviceBat.payload = deviceBat.payload / 1000;
      }
      updateTopicData.deviceBat = deviceBat;

      // // // dateTime parse
      let dateTime = {};
      dateTime.topic = "dateTime";
      // // // // verify if it's from LDC mode
      year = 0x0000;
      year |= updateMessage[17];
      year |= updateMessage[18] << 8;

      month = pad_with_zeroes(updateMessage[19], 2);
      date = pad_with_zeroes(updateMessage[20], 2);
      hour = pad_with_zeroes(updateMessage[21], 2);
      minutes = pad_with_zeroes(updateMessage[22], 2);
      seconds = pad_with_zeroes(updateMessage[23], 2);

      dateTime.payload =
        date +
        "/" +
        month +
        "/" +
        year +
        " " +
        hour +
        ":" +
        minutes +
        ":" +
        seconds;

      updateTopicData.dateTime = dateTime;
    }

    // console.log(" topic:", topic, "\n", "message: ", updateTopicData);
  }

  // // parse sensorId/SENSOR topic
  if (
    topic === "C4BE847489B90000/SENSOR/3" ||
    topic === "C4BE847489B90000/SENSOR/4"
  ) {
    // // // do frame verification
    // // // because the static topic is not reserved only for LowDutyCycle mode data
    let sensorMessage = message;
    if (sensorMessage[1] != 0x01) {
      sensorMessage = null;
    }

    if (sensorMessage) {
      // // // declare variable for each object
      let deviceTypeParse = {};
      let dacTypeParse = {};
      let channelIdParse = {};
      let timeParse = {};
      let dataParse = {};

      // // // deviceType 1 byte
      deviceTypeParse.payload = sensorMessage[0];

      // // // dacType 1 byte
      dacTypeParse.payload = sensorMessage[1];

      // // // channelId 1 byte
      channelIdParse.payload = sensorMessage[2];

      // // // time (in unix format) (4 bytes)
      timeParse.payload = [];
      for (i = 0; i < 4; i++) {
        timeParse.payload[i] = sensorMessage[3 + i];
      }

      // // // data in 3 bytes
      dataParse.payload = [];
      for (i = 0; i < 3; i++) {
        dataParse.payload[i] = sensorMessage[7 + i];
      }

      let tempSensorTopicData = {};
      tempSensorTopicData.deviceTypeParse = deviceTypeParse;
      tempSensorTopicData.dacTypeParse = dacTypeParse;
      tempSensorTopicData.channelIdParse = channelIdParse;
      tempSensorTopicData.timeParse = timeParse;
      tempSensorTopicData.dataParse = dataParse;

      // // // GET DEVICE TYPE
      let deviceType = {};
      deviceType.topic = "deviceType";
      switch (tempSensorTopicData.deviceTypeParse.payload) {
        case 0x01:
          deviceType.payload = "AX 3D";
          break;
        case 0x02:
          deviceType.payload = "HI- INC MONO";
          break;
        case 0x03:
          deviceType.payload = "HI- INC BI";
          break;
        case 0x04:
          deviceType.payload = "X- INC MONO";
          break;
        case 0x05:
          deviceType.payload = "X- INC BI";
          break;
        case 0x06:
          deviceType.payload = "AX 3DS";
          break;
        default:
          deviceType.payload = "Unknow";
          break;
      }

      // // // GET DAC TYPE
      let dacMode = {};
      dacMode.topic = "dacMode";
      switch (tempSensorTopicData.dacTypeParse.payload) {
        case 0x01:
          dacMode.payload = "LowDutyCycle";
          break;
        case 0x02:
          dacMode.payload = "Alarm";
          break;
        case 0x03:
          dacMode.payload = "Streaming";
          break;
        case 0x04:
          dacMode.payload = "Shock Detection";
          break;
        case 0x05:
          dacMode.payload = "later";
          break;
        case 0x06:
          dacMode.payload = "S.E.T";
          break;
        default:
          dacMode.payload = "Unknow";
          break;
      }

      // // // GET CHANNEL NAME
      let channelName = {};
      channelName.topic = "channelName";
      switch (tempSensorTopicData.channelIdParse.payload) {
        case 0x00:
          channelName.payload = "Ch_Z";
          break;
        case 0x01:
          channelName.payload = "Ch_X";
          break;
        case 0x02:
          channelName.payload = "Ch_Y";
          break;
        case 0x03:
          channelName.payload = "Inc_X";
          break;
        case 0x04:
          channelName.payload = "Inc_Y";
          break;
        default:
          channelName.payload = "Unknow";
          break;
      }

      // // // GET TIMESTAMP
      let time_timeStamp = {};
      time_timeStamp.topic = "time_timestamp";
      // timestamp
      time_timeStamp.payload = 0x00000000;
      time_timeStamp.payload |= tempSensorTopicData.timeParse.payload[0];
      time_timeStamp.payload |= tempSensorTopicData.timeParse.payload[1] << 8;
      time_timeStamp.payload |= tempSensorTopicData.timeParse.payload[2] << 16;
      time_timeStamp.payload |= tempSensorTopicData.timeParse.payload[3] << 24;

      // // // GET DATA
      // // // // input
      let dataHexTemp = tempSensorTopicData.dataParse.payload;
      // // // // output
      let getDataTemp = {};
      getDataTemp.topic = "data";
      // // // // measurement in 3 bytes , LSB first and last bit is a sign bit
      // // // // convert hex to decimal
      getDataTemp.payload = 0x000000;
      getDataTemp.payload |= dataHexTemp[0];
      getDataTemp.payload |= dataHexTemp[1] << 8;
      getDataTemp.payload |= dataHexTemp[2] & (0x7f << 16);

      // // // // if sign bit equal 1 the measurement is negative
      if ((dataHexTemp[2] & 0x80) == 0x80) {
        getDataTemp.payload *= -1;
      }

      // // // // divide data by 1000 to get the real measurement
      getDataTemp.payload = getDataTemp.payload / 1000;

      // // // GET XAXIS DATA
      var xAxisTemp = {};
      xAxisTemp.topic = "XAxisData";
      if (channelName.payload.includes("X")) {
        xAxisTemp.payload = getDataTemp.payload;
      }

      // // // GET YAXIS DATA
      var yAxisTemp = {};
      yAxisTemp.topic = "YAxisData";
      if (channelName.payload.includes("Y")) {
        yAxisTemp.payload = getDataTemp.payload;
      }
    }

    // console.log(" xAxis:", xAxisTemp, "\n", "yAxis:", yAxisTemp);
    sensorTopicData.xAxisData = xAxisTemp;
    sensorTopicData.yAxisData = yAxisTemp;
  }

  // const resultData = Object.assign({}, updateTopicData, sensorTopicData)

  // // creating a list for storing 5 idx data od batLevel, dateTime
  // // netLQI, XAxisDat, YAxisDat



  // // // batLevelCheck
  if (updateTopicData.deviceBat) {
    let batLevelTick;
    batLevelTick = updateTopicData.deviceBat.payload || null
    if (batLevelTick) {
      if (batLevelArray.length > 1) {
        batLevelArray.shift()
      }
      batLevelArray.push(batLevelTick)
    }
  }

  // // // dateTimeCheck
  if (updateTopicData.dateTime) {
    let dateTimeTick;
    dateTimeTick = updateTopicData.dateTime.payload || null
    if (dateTimeTick) {
      if (dateTimeArray.length > 1) {
        dateTimeArray.shift()
      }
      dateTimeArray.push(dateTimeTick)
    }
  }  

  // // // netLQICheck
  if (updateTopicData.netLqi) {
    let netLqiTick;
    netLqiTick = updateTopicData.netLqi.payload || null
    if (netLqiTick) {
      if (netLqiArray.length > 1) {
        netLqiArray.shift()
      }
      netLqiArray.push(netLqiTick)
    }
  }  

  // // // XAxisDatCheck
  if (sensorTopicData.xAxisData) {
    let xAxisDataTick;
    xAxisDataTick = sensorTopicData.xAxisData.payload || null
    if (xAxisDataTick) {
      if (xAxisDataArray.length > 1) {
        xAxisDataArray.shift()
      }
      xAxisDataArray.push(xAxisDataTick)
    }
  }  

  // // // YAxisDatCheck
  if (sensorTopicData.yAxisData) {
    let yAxisDataTick;
    yAxisDataTick = sensorTopicData.yAxisData.payload || null
    if (yAxisDataTick) {
      if (yAxisDataArray.length > 1) {
        yAxisDataArray.shift()
      }
      yAxisDataArray.push(yAxisDataTick)
    }
  }  

  if (
    batLevelArray.length < 1 ||
    dateTimeArray.length < 1 ||
    netLqiArray.length < 1 ||
    xAxisDataArray < 1 ||
    yAxisDataArray < 1
  ) {
    //pass
  }
  else {
    const resultData = {
      batLevel: batLevelArray[0],
      dateTime: dateTimeArray[0],
      netLQI: netLqiArray[0],
      XAxisDat: xAxisDataArray[0],
      YAxisDat: yAxisDataArray[0],
    };

    const pubSubPayload = {
      type : 'inboundDataEventMsg',
      networkId: 'tilt-network',
      deviceId: deviceMacId,
      aliasKey: 'macId',
      time: Date.now(),
      historical: true,
    
      data: [
        {path: 'status/batVolt', value: resultData.batLevel},
        {path: 'status/batteryLevel', value: resultData.batLevel},
        {path: 'status/netLQI', value: resultData.netLQI},
        {path: 'tiltAngle/xAxis', value: resultData.XAxisDat},
        {path: 'tiltAngle/yAxis', value: resultData.YAxisDat},
        {path: 'macId', value: 'testdummy'}
      ]
    }
    
    pubSubClient.topic( 'default-processor' ).publishMessage( { data: Buffer.from(JSON.stringify(pubSubPayload) ) } )
    console.log(onMessageMqttCounter, resultData, "\n");
  }

  onMessageMqttCounter += 1;
});

