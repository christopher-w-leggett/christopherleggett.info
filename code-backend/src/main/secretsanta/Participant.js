'use strict';

/*
{
    name: 'John',
    mobileNumber: '+15555555555',
    selected: false,
    selectedParticipant: false
}
*/
module.exports = class Participant {
    constructor() {
        this.name = null;
        this.mobileNumber = null;
        this.selected = false;
        this.selectedParticipant = false;
    }

    static newParticipant(name, mobileNumber) {
        if(!name || !mobileNumber) {
            throw new Error('Participant name and mobile number are required.');
        }

        const participant = new Participant();
        participant.name = name;
        participant.mobileNumber = mobileNumber;
        return participant;
    }

    static fromJson(json) {
        if(!json) {
            throw new Error('Participant json is required.')
        }
        if(!json.name || !json.mobileNumber) {
            throw new Error('Participant json must contain a name and mobile number.')
        }

        const participant = new Participant();
        participant.name = json.name;
        participant.mobileNumber = json.mobileNumber;
        participant.selected = json.selected || false;
        participant.selectedParticipant = json.selectedParticipant || false;
        return participant;
    }

    toJson() {
        return {
            name: this.name,
            mobileNumber: this.mobileNumber,
            selected: this.selected,
            selectedParticipant: this.selectedParticipant
        };
    }

    wasSelected() {
        return this.selected;
    }

    markWasSelected() {
        this.selected = true;
    }

    hasSelected() {
        return this.selectedParticipant;
    }

    markHasSelected() {
        this.selectedParticipant = true;
    }

    getName() {
        return this.name;
    }

    getMobileNumber() {
        return this.mobileNumber;
    }
};
