const crypto = require('crypto');
const https = require('https');

const makeRequest = async ({ token, secret }, path, method, body) => {

    const t = Date.now();
    const nonce = `t${t}`;
    const data = token + t + nonce;

    const signTerm = crypto.createHmac('sha256', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest();
    const sign = signTerm.toString("base64");

    const serializedBody = JSON.stringify(body) || '';

    const options = {
        hostname: 'api.switch-bot.com',
        port: 443,
        path: `/v1.1/${path}`,
        method: method,
        headers: {
            "Authorization": token,
            "sign": sign,
            "nonce": nonce,
            "t": t,
            'Content-Type': 'application/json',
            'Content-Length': serializedBody?.length || 0,
        },
    };

    // console.log(options);
    // console.log(body);

    return new Promise((resolve, reject) => {
        try {
            const req = https.request(options, res => {
                res.on('data', d => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(d.toString()));
                    } else {
                        console.error(`statusCode: ${res.statusCode}`);
                        reject(d.toString());
                    }
                });
            });

            req.on('error', error => {
                console.error('request error', error);
                reject(error);
            });

            req.write(serializedBody);
            req.end();
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = { makeRequest };