'use strict';

const uuidv4 = require('uuid/v4');
const jwe = require('../../lib/jwe');
const Participant = require('./Participant.js');

/*
{
    ownerId: 2,
    participants: [Participant, ...]
}
*/
module.exports = class Hat {
    constructor(participants) {
        if(!participants || !participants.length) {
            throw new Error('Hat must have participants.  Please provide participants to construct a new hat.');
        }

        this.hatId = uuidv4();
        this.participants = participants.map((participant) => {
            if(!participant) {
                throw new Error('Participant is required.');
            }
            if(!(participant instanceof Participant)) {
                throw new Error('Invalid participant provided.');
            }

            //not concerned about reusing participant because it is immutable.
            return participant;
        });

        const potentialOwners = this.participants.reduce((acc, participant, index) => {
            //subject to selecting next
            if(participant.hasSelected() === false) {
                acc.push(index);
            }
            return acc;
        }, []);
        if(potentialOwners.length) {
            this.ownerId = potentialOwners[Math.floor(Math.random() * potentialOwners.length)];
        } else {
            throw new Error('All participants have selected.  At least one participant needs to make a selection to construct a new hat.');
        }
    }

    static async decrypt(token, secret) {
        const payload = await jwe.readPayload(token, secret);
        if(!payload) {
            throw new Error('Invalid token provided.');
        }

        const participants = payload.participants.map((participantJson) => {
            return Participant.fromJson(participantJson);
        });

        const hat = new Hat(participants);
        hat.hatId = payload.hatId;
        hat.ownerId = payload.ownerId;
        return hat;
    }

    async encrypt(secret) {
        return jwe.create(this.toJson(), secret);
    }

    toJson() {
        return {
            hatId: this.hatId,
            ownerId: this.ownerId,
            participants: this.participants.map((participant, index) => {
                return Object.assign({id: index}, participant.toJson());
            })
        }
    }

    pick() {
        //create potential selections
        const potentialSelections = this.participants.filter((participant, index) => {
            //subject to selection if they have not been selected and are not holding the hat.
            return participant.wasSelected() === false && this.ownerId !== index;
        });

        //randomly select participant
        let selectedParticipant;
        if(potentialSelections.length === 2) {
            //2 choices left, so we need to make sure we don't end up with an orphaned participant
            //if one of the participants has not selected and has not been selected, then they must be selected.
            const possibleOrphans = potentialSelections.filter((selectableParticipant) => {
                return selectableParticipant.wasSelected() === false && selectableParticipant.hasSelected() === false;
            });
            if(possibleOrphans.length === 1) {
                console.log('Selected Orphan!');
                selectedParticipant = possibleOrphans[0];
            }
        }
        if(!selectedParticipant) {
            //no required selection, so we can randomly choose.
            selectedParticipant = potentialSelections[Math.floor(Math.random() * potentialSelections.length)];
        }

        //return selected participant
        return selectedParticipant;
    }

    getHatId() {
        return this.hatId;
    }

    getOwner() {
        return this.participants[this.ownerId];
    }

    getParticipants() {
        return this.participants.slice();
    }
};
