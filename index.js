const { readFileSync, writeFileSync } = require("fs");
const path = require("path");
const { makeRequest } = require('./switchbot');

const getAuthFilePath = () => {
    return path.join(process.cwd(), 'SWITCHBOT-AUTH');
}

const extractOptions = (params) => {
    const commands = [];
    const options = {};

    let endOfOptions = false;
    params.forEach(param => {
        let match;
        if (!endOfOptions && (match = param.match(/^--?([^=]+)(=(.*))?$/))) {
            const [, name, hasArg, arg] = match;
            options[name] = hasArg ? (arg ?? '') : true;
        } else {
            commands.push(param);
            endOfOptions = true;
        }
    });

    return { commands, options };
}

const globalAuth = {
    active: false,
    token: undefined,
    secret: undefined,
    interactive: false,
};

const getAuth = async () => {
    if (globalAuth.active) {
        if (globalAuth.interactive) {
            return await askForAuthData();
        }

        return {
            token: globalAuth.token,
            secret: globalAuth.secret
        };
    }

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
};

const askForAuthData = async () => {
    console.log('You need to obtain "token" and "secret" from app: https://support.switch-bot.com/hc/en-us/articles/12822710195351-How-to-obtain-a-Token-');
    const token = await getInputLine('token: ');
    const secret = await getInputLine('secret: ');

    return { token, secret };
}

const globalOptionsProcessors = {
    auth: (arg) => {
        const [token, secret] = arg.split(',');
        if (token && secret) {
            globalAuth.active = true;
            globalAuth.secret = secret;
            globalAuth.token = token;
        } else {
            throw new Error('Wrong argument for --auth');
        }
    },
    authInteractive: () => {
        globalAuth.active = true;
        globalAuth.interactive = true;
    }
};

const processGlobalOptions = (options) => {
    for (const name in options) {
        if (Object.hasOwnProperty.call(options, name)) {
            const arg = options[name];
            const processor = globalOptionsProcessors[name];
            if (!processor) { throw new Error(`Wrong option: ${name}`); }

            processor(arg);
        }
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
            const result = await makeRequest(await getAuth(), `devices/${id}/status`, 'GET');
            if (result?.statusCode === 100) {
                console.log(JSON.stringify(result?.body));
            } else {
                throw new Error(JSON.stringify(result));
            }
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
        const result = await makeRequest(await getAuth(), `devices/${id}/commands`, 'POST', body);
        if (result?.statusCode === 100) {
            console.log(JSON.stringify(result?.body));
        } else {
            throw new Error(JSON.stringify(result));
        }
    },
    devicesList: async () => {
        const result = await makeRequest(await getAuth(), 'devices', 'GET');

        const physicalDevices = result.body.deviceList;
        const virtualDevices = result.body.infraredRemoteList;
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

        await makeRequest(await getAuth(), `scenes/${id}/${cmd}`, 'POST');
        console.log('OK');
    },
    scenesList: async () => {
        const result = await makeRequest(await getAuth(), 'scenes', 'GET');
        const scenes = result?.body;
        scenes.forEach(scene => {
            console.log(scene.sceneId + '\t' + scene.sceneName);
        });
    },
    config: async (params) => {
        const [cmd] = params;

        if (cmd === 'auth') {
            const { token, secret } = await askForAuthData();

            writeFileSync(getAuthFilePath(), `${token},${secret}`);
            return;
        }
    }
};

const main = async () => {
    try {
        const [, , ...argv2] = process.argv;

        const { commands, options } = extractOptions(argv2);
        processGlobalOptions(options);

        const [group, ...params] = commands;
        const groupFn = groups[group];

        if (!groupFn) {
            throw new Error(`Wrong main command name: ${group}`);
        }

        await groupFn(params);
    } catch (e) {
        console.error('Sth went wrong :<');
        console.error(e);
        process.exit(1);
    }
};

main();