const net = require('net');
const utils = require('./Utils');
const db = require('./queries');
const fs = require('fs');
var stream = require('stream');
var server = net.createServer();

var ClientVersion = "0.0.1"
var ENC_KEY = "XSEZ1ZiXpwonxSLIbwyoOwBnJOX9mM1n"
var IV = "byOPz5oNOIGvk1bC"

function convertData(data) {
    let encrypted = Buffer.from(data, 'hex')
    return encrypted.toString()
}

function getByteArray(filePath) {
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = []
    for (var i = 0; i < fileData.length; i += 2)
        result.push('0x' + fileData[i] + '' + fileData[i + 1])
    return result;
}

server.listen(3131, () => {
    console.log('→ Server starting...');
    console.log('└ Listening port, 3131!');

    server.on('connection', (connection) => {
        var client = {
            getBufferSize: false,
            sendData: false,
            driverData: 0,
            bufferSize: 0
        }

        console.log('__________________________');
        console.log(` → A user is connected:`);

        connection.on('data', function(data) {
            var message;
            var driverSys = getByteArray('driver.sys');
            if (!client.getBufferSize) {
                bufferSize = driverSys.length.toString();
                //console.log(bufferSize);
                connection.write(bufferSize)
                client.getBufferSize = true;
                // connection.write(result);
                // message = convertData(data)
                // console.log(message)
                // connection.write("haha");
            } else if (!client.sendData) {
                console.log(parseInt(bufferSize))
                console.log(client.driverData)
                if (client.driverData <= bufferSize) {
                    let sendByte = driverSys[client.driverData].toString();
                    connection.write(sendByte);
                    client.driverData++;
                }
            }
        });

        connection.on('error', function(msg) {
            console.log('A connection closed unexpectly!');
        });
    })
})