"use strict";

const jose = require('node-jose');

async function createKey(secret) {
    return await new Promise((resolve, reject) => {
        jose.JWK.asKey({
            'kty': 'oct',
            'k': secret
        }).then((result) => {
            resolve(result);
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    create: async function(payload, secret) {
        const key = await createKey(secret);

        return new Promise((resolve, reject) => {
            jose.JWE.createEncrypt({format: 'compact'}, key).update(JSON.stringify(payload)).final().then((result) => {
                    resolve(result);
                }).catch((error) => {
                    reject(error);
                });
        });
    },
    readPayload: async function(jwe, secret) {
        const key = await createKey(secret);

        return new Promise((resolve, reject) => {
            jose.JWE.createDecrypt(key).decrypt(jwe).then((result) => {
                    resolve(JSON.parse(result.payload.toString('utf8')));
                }).catch((error) => {
                    reject(error);
                });
        });
    }
};
