'use strict';

const jwe = require('../lib/jwe');
const Participant = require('./Participant.js');

/*
{
    ownerId: 2,
    participants: [Participant, ...]
}
*/
module.exports = class Hat {
    constructor() {
        this.ownerId = null;
        this.participants = [];
    }

    static async decrypt(token, secret) {
        const payload = await jwe.readPayload(token, secret);
        if(!payload) {
            throw new Error('Invalid token provided.');
        }

        const hat = new Hat();
        hat.ownerId = payload.ownerId;
        hat.participants = payload.participants.map((participantJson) => {
            return Participant.fromJson(participantJson);
        });
        return hat;
    }

    async encrypt(secret) {
        return jwe.create(this.toJson(), secret);
    }

    toJson() {
        return {
            ownerId: this.ownerId,
            participants: this.participants.map((participant, index) => {
                return Object.assign({id: index}, participant.toJson());
            })
        }
    }

    pickNewOwner() {
        const potentialOwners = this.participants.filter((participant, index) => {
            //subject to selecting next
            return participant.hasSelected() === false && (!this.ownerId || this.ownerId !== index);
        });
        this.ownerId = Math.floor(Math.random() * potentialOwners.length);
    }

    addParticipant(participant) {
        if(!participant) {
            throw new Error('Participant is required.');
        }
        if(!(participant instanceof Participant)) {
            throw new Error('Invalid participant provided.');
        }

        this.participants.push(participant);
    }

    getOwnerId() {
        return this.ownerId;
    }

    getParticipants() {
        return this.participants;
    }
};
