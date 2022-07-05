// subscriber.js 
const mqtt = require('mqtt')
const client = mqtt.connect("mqtt://34.128.84.160:1883")

var xAxisData;
var yAxisData;
var rawData;

// client.subscribe('test-data/#');

client.subscribe('parsedData/inclinoMeter/C4BE847489B90000/#');



client.on('message', function (topic, message, packet) {
    // if (topic === 'parsedData/inclinoMeter/C4BE847489B90000/#') {
    //     rawData = message;
    // }

    var variable = topic.split('/')[3]
    var stringData = message.toString()

    console.log(
        'topic:', topic, '\n',
        'variable:', variable, '\n', 
        'data:', stringData
    );

});
