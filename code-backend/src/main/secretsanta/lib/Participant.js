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
    constructor(name, mobileNumber, selected, selectedParticipant) {
        if(!name || !mobileNumber) {
            throw new Error('Participant name and mobile number are required.');
        }

        this.name = name;
        this.mobileNumber = mobileNumber;
        this.selected = !!selected;
        this.selectedParticipant = !!selectedParticipant;
    }

    static fromJson(json) {
        if(!json) {
            throw new Error('Participant json is required.')
        }

        return new Participant(json.name, json.mobileNumber, json.selected, json.selectedParticipant);
    }

    toJson() {
        return {
            name: this.name,
            mobileNumber: this.mobileNumber,
            selected: this.selected,
            selectedParticipant: this.selectedParticipant
        };
    }

    isSameAs(participant) {
        return participant.getName() === this.name
            && participant.getMobileNumber() === this.mobileNumber
            && participant.wasSelected() === this.selected
            && participant.hasSelected() === this.selectedParticipant;
    }

    getName() {
        return this.name;
    }

    getMobileNumber() {
        return this.mobileNumber;
    }

    wasSelected() {
        return this.selected;
    }

    hasSelected() {
        return this.selectedParticipant;
    }
};
