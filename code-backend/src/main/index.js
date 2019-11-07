'use strict'

module.exports.pickName = async (event, context, callback) => {
    try {
        //grab payload
        const hatPayload = {
            hatOwnerId: 2,
            participants: [
                {
                    id: 1,
                    name: 'Chris',
                    sms: '555-555-5555',
                    hasBeenSelected: false,
                    hasSelectedName: false
                },
                {
                    id: 2,
                    name: 'Stacy',
                    sms: '555-555-2222',
                    hasBeenSelected: false,
                    hasSelectedName: false
                },
                {
                    id: 3,
                    name: 'Karen',
                    sms: '555-555-3333',
                    hasBeenSelected: false,
                    hasSelectedName: false
                }
            ]
        };
        const selectionPassword = 'test';
        //TODO: decrypt payload

        //grab hat owner details
        const hatOwner = hatPayload.participants.filter((participant) => {
            return participant.id === hatPayload.hatOwnerId;
        });

        //create selectable list and randomly select user
        const selectableParticipants = hatPayload.participants.filter((participant) => {
            return participant.hasBeenSelected === false && participant.id !== hatPayload.hatOwnerId;
        });
        const selection = selectableParticipants[Math.floor(Math.random() * selectableParticipants.length)];

        //generate selection token
        const selectionToken = {
            name: selection.name
        };
        //TODO: encrypt selectionToken and generate selection URL
        //TODO: SMS selection URL to hatOwner.sms

        //create list of users that still need to pick a name and randomly select next user
        const needToSelect = hatPayload.participants.filter((participant) => {
            return participant.hasSelectedName === false && participant.id !== hatPayload.hatOwnerId;
        });
        const nextToSelect = needToSelect[Math.floor(Math.random() * needToSelect.length)];

        //generate next hat token
        const nextHatToken = {
            hatOwnerId: nextToSelect.id,
            participants: hatPayload.participants.map((participant) => {
                const newParticipant = Object.assign({}, participant);

                //select participant if applicable
                if(participant.id === selection.id) {
                    newParticipant.hasBeenSelected = true;
                }

                //mark participant as has selected if applicable
                if(participant.id === hatPayload.hatOwnerId) {
                    newParticipant.hasSelectedName = true;
                }
            })
        };
        //TODO: encrypt nextHatToken and generate hat URL
        const nextHatUrl = '';
        //TODO: SMS hat URL to nextToSelect.sms

        //TODO: return name
        //TODO: don't return hat
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                selection: selection.name,
                hat: nextHatUrl || 'test'
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports.revealName = async (event, context, callback) => {
    try {
        //grab payload & selection password
        const selectionPayload = {
            name: 'Chris'
        };
        const selectionPassword = 'test';
        //TODO: decrypt payload

        //TODO: return name
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                name: selectionPayload.name
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
