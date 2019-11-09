'use strict';

const jwe = require('../../lib/jwe');
const Participant = require('./Participant.js');

/*
{
    ownerId: 2,
    participants: [Participant, ...]
}
*/
module.exports = class Hat {
    constructor() {
        this.ownerId = -1;
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

    assignNewOwner() {
        const potentialOwners = this.participants.reduce((acc, participant, index) => {
            //subject to selecting next
            if(participant.hasSelected() === false && this.ownerId !== index) {
                acc.push(index);
            }
            return acc;
        }, []);
        if(potentialOwners.length) {
            this.ownerId = potentialOwners[Math.floor(Math.random() * potentialOwners.length)];
        } else {
            this.ownerId = -1;
        }
    }

    pick() {
        if(this.ownerId < 0) {
            throw new Error('Hat must have an owner to pick a selection.  Please call assignNewOwner().');
        }
        if(!this.participants.length) {
            throw new Error('Hat must have participants to pick.  Please add participants using addParticipant(participant).');
        }
        if(this.participants[this.ownerId].hasSelected()) {
            throw new Error('Hat owner already selected.  Participants can only select once.')
        }

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

        //mark owner has selected and mark participant was selected
        this.participants[this.ownerId].markHasSelected();
        selectedParticipant.markWasSelected();

        //return selected participant
        return selectedParticipant;
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

    getOwner() {
        if(this.ownerId > -1) {
            return this.participants[this.ownerId];
        } else {
            return null;
        }
    }

    getParticipants() {
        return this.participants;
    }
};
