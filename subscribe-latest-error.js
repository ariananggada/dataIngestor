// subscriber.js
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://34.101.133.187:1883");

// client.subscribe('C4BE847489B90000/SENSOR/3');
// client.subscribe('C4BE847489B90000/SENSOR/4');
// client.subscribe('C4BE847489B90000/UPDATE');

function pad_with_zeroes(number, length) {
  var my_string = "" + number;
  while (my_string.length < length) {
    my_string = "0" + my_string;
  }

  return my_string;
}

client.subscribe("C4BE847489B90000/#");

console.log("start subscribing....");

var updateTopicList = []
var sensorTopicList = []

client.on("message", function (topic, message, packet) {


  if (topic === "C4BE847489B90000/UPDATE") {
    var updateTopicData = {}

    // netLqi
    var netLqi = {};
    netLqi.topic = "netLQI";
    netLqi.payload = message[28];
    updateTopicData.netLqi = netLqi

    // deviceBat
    var deviceBat = {};
    deviceBat.topic = "deviceBat";
    // verify if it's from LDC mode
    if (message[42] != 0x0) {
      // by returning nothing, the next node will receive nothing which mean it will not start
      deviceBat.payload = 0x0000;
      deviceBat.payload |= message[42];
      deviceBat.payload |= message[43] << 8;
      deviceBat.payload = deviceBat.payload / 1000;
    }
    updateTopicData.deviceBat = deviceBat

    //dateTime
    var dateTime = {};
    dateTime.topic = "dateTime";

    var year;
    var month;
    var date;
    var hour;
    var minutes;
    var second;

    // verify if it's from LDC mode
    year = 0x0000;
    year |= message[17];
    year |= message[18] << 8;

    month = pad_with_zeroes(message[19], 2);
    date = pad_with_zeroes(message[20], 2);
    hour = pad_with_zeroes(message[21], 2);
    minutes = pad_with_zeroes(message[22], 2);
    seconds = pad_with_zeroes(message[23], 2);

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

    updateTopicData.dateTime = dateTime
    updateTopicList.push(updateTopicData)
  }



  // parse sensor topic
  if (topic === "C4BE847489B90000/SENSOR/#") {
    var sensorTopicData = {}

    if (message[1] != 0x01) {
      message = "";
    }
  }

  // parse data process from sensor3 and sensor4
  var deviceType = {};
  var dacType = {};
  var channelId = {};
  var time = {};
  var data = {};

  deviceType.payload = message[0];
  dacType.payload = message[1];
  channelId.payload = message[2];

  // Reference Time (in unix format) (4 bytes)
  time.payload = [];
  for (i = 0; i < 4; i++) {
    time.payload[i] = message[3 + i];
  }

  // data in 3 bytes
  data.payload = [];
  for (i = 0; i < 3; i++) {
    data.payload[i] = message[7 + i];
  }

  const parseDataResult = [deviceType, dacType, channelId, time, data];
  console.log(parseDataResult)

  sensorTopicData.parseResult = parseDataResult
  sensorTopicList.push(sensorTopicData)

  // if (updateTopicData && sensorTopicData){
  //   console.log(' topic:', topic, '\n\n', 'updateTopicData:', updateTopicData, '\n\n\n' )
  // }
});
