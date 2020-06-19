require('dotenv').config({ path: '.robot.env'});   


const socketIO = require("socket.io-client");
const socketClient = socketIO.connect(process.env.SERVER_URL);
const Mutex = require('async-mutex').Mutex;
const file_mutex = new Mutex();

//const socketClient = socketIO.connect('http://35.222.226.8:8000');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;
const writeFile = util.promisify(require('fs').writeFile);

socketClient.on('health_check', () => {
    console.log('receive healthcheck message');
    socketClient.emit('health_check', `${process.env.NAME}`);    
});

socketClient.on('run', async function(data) {
    console.log(`${data.imageSrc} is requested`);

    const release = await file_mutex.acquire();
    try {
        // make command
        const command = `docker run ${data.options} ${data.imageSrc} ${data.command}`
        await writeFile('deploy.sh', `${command}`, (err) => {
            if (err) throw err;
        });

        const spawned_process = spawn('bash', ['deploy.sh'], {stdio: ['ignore', 'pipe', process.stderr]});

        spawned_process.stdout.on('data', (data) => {
            console.log(data);
        });

        exec('sudo rm deploy.sh');
        release();
    } catch (e) {
        console.log(e);
        release();
    }
  
});

socketClient.on('status', async function(fn) {
    const result = await exec('sudo docker container ls');
    await fn(result.stdout);
});

socketClient.on('stop', async function(data) {
    await exec(`sudo docker stop ${data.containerID}`);
    console.log(`a container ${data.containerID} is stopped`);
});

socketClient.on('stopAll', async function(data) {
    await exec('sudo docker stop $(sudo docker ps -a -q)');
    console.log('all containers are stopped');
});