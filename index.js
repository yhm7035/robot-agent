require('dotenv').config({ path: '.robot.env'});   

const socketIO = require("socket.io-client");
const socketClient = socketIO.connect('http://35.192.106.203:8000');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

socketClient.on('health_check', () => {
    console.log('receive healthcheck message');
    socketClient.emit('health_check', `${process.env.NAME}`);    
});

socketClient.on('run', async function(data) {
    const command = `sudo docker run -d ${data.imageSrc} ${data.command}`
    const result = await exec(command);
    console.log(result);
});

socketClient.on('status', async function(fn) {
    const result = await exec('sudo docker container ls');
    await fn(result.stdout);
});