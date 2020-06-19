require('dotenv').config({ path: '.robot.env'});   

const socketIO = require("socket.io-client");
const socketClient = socketIO.connect(process.env.SERVER_URL);
//const socketClient = socketIO.connect('http://35.222.226.8:8000');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

socketClient.on('health_check', () => {
    console.log('receive healthcheck message');
    socketClient.emit('health_check', {'name':`${process.env.NAME}`, 'base':'kube'});    
});