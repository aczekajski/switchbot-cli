const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const { makeRequest } = require('./switchbot');

const getAuthFilePath = () => {
    return path.join(process.cwd(), 'AUTH');
}

const readAuth = () => {
    try {
        const raw = readFileSync(getAuthFilePath())?.toString();
        const [token, secret] = raw.split(',');
        if (!token || !secret) {
            throw new Error('Cannot read auth config. Did you create it first with "config auth"?');
        }

        return { token, secret };
    } catch (e) {
        throw new Error('Cannot read auth config. Did you create it first with "config auth"?');
    }
}

const getInputLine = async (question) => {
    return new Promise((resolve, reject) => {
        const readline = require('readline');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

const groups = {
    devices: async (params) => {
        const [id, cmd, cmdParams] = params;

        if (!id) {
            return groups.devicesList();
        }

        if (!cmd) {
            const result = await makeRequest(readAuth(), `devices/${id}/status`, 'GET');
            console.log(result);
            return;
        }

        let command = cmd;
        let commandType = 'command';
        const customCommandPrefix = 'custom/';
        if (cmd.startsWith(customCommandPrefix)) {
            command = cmd.substring(customCommandPrefix.length);
            commandType = 'customize';
        }

        const body = {
            command,
            parameter: cmdParams ?? 'default',
            commandType
        };
        const result = await makeRequest(readAuth(), `devices/${id}/commands`, 'POST', body);
        console.log(result);
    },
    devicesList: async () => {
        const result = await makeRequest(readAuth(), 'devices', 'GET');

        const physicalDevices = JSON.parse(result).body.deviceList;
        const virtualDevices = JSON.parse(result).body.infraredRemoteList;
        physicalDevices.forEach(device => {
            console.log(device.deviceId + '\t' + device.deviceType + '\t' + device.deviceName);
        });
        virtualDevices.forEach(device => {
            console.log(device.deviceId + '\t' + device.remoteType + '\t' + device.deviceName);
        });
    },
    scenes: async (params) => {
        const [id, cmd = 'execute'] = params;

        if (!id) {
            return groups.scenesList();
        }

        const result = await makeRequest(readAuth(), `scenes/${id}/${cmd}`, 'POST');
        console.log(JSON.parse(result));
    },
    scenesList: async () => {
        const result = await makeRequest(readAuth(), 'scenes', 'GET');
        const scenes = JSON.parse(result).body;
        scenes.forEach(scene => {
            console.log(scene.sceneId + '\t' + scene.sceneName);
        });
    },
    config: async (params) => {
        const [cmd] = params;

        if (cmd === 'auth') {
            console.log('You need to abtain "token" and "secret" from app: https://support.switch-bot.com/hc/en-us/articles/12822710195351-How-to-obtain-a-Token-');
            const token = await getInputLine('token: ');
            const secret = await getInputLine('secret: ');

            writeFileSync(getAuthFilePath(), `${token},${secret}`);
            return;
        }
    }
};

const main = async () => {
    const [, , ...argv2] = process.argv;
    const [group, ...params] = argv2;
    console.log(argv2);

    const groupFn = groups[group];

    if (!groupFn) {
        console.error('Wrong commands group name:', group);
        process.exit(1);
    }

    await groupFn(params);
};

main();