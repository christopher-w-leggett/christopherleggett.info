"use strict";

const crypto = require('crypto');
const jose = require('node-jose');

async function createKey(secret) {
    const key = await new Promise((resolve, reject) => {
        crypto.scrypt(Buffer.from(secret), Buffer.from(''), 32, (error, derivedKey) => {
            if(error) {
                reject(error);
            } else {
                resolve(derivedKey);
            }
        });
    });

    return await new Promise((resolve, reject) => {
        jose.JWK.asKey({
            'kty': 'oct',
            'alg': 'A256GCM',
            'k': key
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
            jose.JWE.createEncrypt({format: 'compact'}, key).update(Buffer.from(JSON.stringify(payload))).final().then((result) => {
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
