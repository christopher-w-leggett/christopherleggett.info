"use strict";

const jose = require('node-jose');

const hatSecret = process.env.HAT_SECRET;

async function createKey() {
    return await new Promise((resolve, reject) => {
        jose.JWK.asKey({
            'kty': 'oct',
            'k': hatSecret
        }).then((result) => {
            resolve(result);
        }).catch((error) => {
            reject(error);
        });
    });
}

module.exports = {
    createJWE: async function(payload) {
        const key = await createKey();

        return await new Promise((resolve, reject) => {
            jose.JWE.createEncrypt({format: 'compact'}, key).update(JSON.stringify(payload)).final().then((result) => {
                    resolve(result);
                }).catch((error) => {
                    reject(error);
                });
        });
    },
    readJWE: async function(jwe) {
        const key = await createKey();

        return await new Promise((resolve, reject) => {
            jose.JWE.createDecrypt(key).decrypt(jwe).then((result) => {
                    resolve(JSON.parse(result.payload.toString('utf8')));
                }).catch((error) => {
                    reject(error);
                });
        });
    }
};