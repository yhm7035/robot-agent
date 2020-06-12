require('dotenv').config({ path: '.robot.env'});   

const socketIO = require("socket.io-client");
const socketClient = socketIO.connect(process.env.SERVER_URL);
//const socketClient = socketIO.connect('http://127.0.0.1:8000');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

socketClient.on('health_check', () => {
    console.log('receive healthcheck message');
    socketClient.emit('health_check', `${process.env.NAME}`);    
});

socketClient.on('run', async function(data) {
    const command = `sudo docker run ${data.options} ${data.imageSrc} ${data.command}`
    const result = await exec(command);
    console.log(result);
});

socketClient.on('status', async function(fn) {
    const result = await exec('sudo docker container ls');
    await fn(result.stdout);
});

socketClient.on('stop', async function(data) {
    await exec(`sudo docker stop ${data.containerID}`);
});

socketClient.on('stopAll', async function(data) {
    await exec('sudo docker stop $(sudo docker ps -a -q)');
});