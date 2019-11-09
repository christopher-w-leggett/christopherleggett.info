'use strict';

const jwe = require('../../lib/jwe');

module.exports = class Selection {
    constructor(name) {
        if(!name) {
            throw new Error('Selection name is required.');
        }

        this.name = name;
    }

    static async decrypt(token, secret) {
        const payload = await jwe.readPayload(token, secret);
        if(!payload || !payload.name) {
            throw new Error('Invalid token provided.');
        }

        return new Selection(payload.name);
    }

    async encrypt(secret) {
        const payload = {
            name: this.name
        };
        return jwe.create(payload, secret);
    }

    getName() {
        return this.name;
    }
};
