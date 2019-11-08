'use strict'

const jwe = require('./lib/jwe/index.js');

function readData(event) {
    try {
        return JSON.parse(event.body);
    } catch (error) {
        throw error;
    }
}

/*
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

*/

module.exports.pickName = async (event, context, callback) => {
    try {
        //grab payload
        const data = readData(event);
        const hatSecret = process.env.HAT_SECRET;
//        const hatToken = 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUEJFUzItSFMyNTYrQTEyOEtXIiwia2lkIjoiVE5WdkdlU2VqOUVMTHZqbi0yQmJsVHJTc1BwSWVjSllIT1F1VTdLQzZOUSIsInAycyI6IndQeC1tV0pqUnVTNXJkWkFpOVFZdEEiLCJwMmMiOjgxOTJ9.x7m55W6YF1Jc1rbppwRtEJ_u0JX5rytRpQOKF1TQnsUSawvrCeaeIA.BESIl2n-K4ZCM5LpnZG0HA.Eu7GR7b0mmr4nbCYiLJscGI9ZuUe_G8phBQ65NRnGTtkjpti1SrUiOlkFqYmQN0itIDrCWL-fDae_hqXyYbc84yXaQUQ82tV6Wy0SoZyp3Y8SMmjVulrdUm-ItNK5m3gdSwuOPXX-BB9ObGXmV7KUAbYMjm_ddVUBzNuURn91OJIpmAMUS6YScwod5qsSmvZj07stGxt7z1IPBNPk-NFSAhJb1O9_QwabEWZjm0AnsDA_ZRg9WwdUm1otI7rdIWY_niKmaALq3G3vSsG6mdEAQkbZ3OPj1U9x92aimOqVNEbk7U-OBXT3wyv_cSTSuQYIepLuF1D_6KUCQvjc-n622iajjDfgoHjQQCqY803pWWx9lFxoY75Ks-qIGi0Nln9I7eZHJ6HqJj-BDpUIn9tqbDnf_A101aw2EvUd1lFEpA.zDOtDVa45hgEvTAPPzNhSw';
        const hatToken = data.hattoken;
        //TODO: read password from json post data
        const selectionPassword = 'test';
        const hatPayload = await jwe.readJWE(hatToken);

        //grab hat owner details
        const hatOwner = hatPayload.participants.filter((participant) => {
            return participant.id === hatPayload.hatOwnerId;
        });

        //create selectable list and randomly select user
        const selectableParticipants = hatPayload.participants.filter((participant) => {
            //subject to selection if they have not been selected and are not holding the hat.
            return participant.hasBeenSelected === false && participant.id !== hatPayload.hatOwnerId;
        });
        let selection;
        if(selectableParticipants.length === 2) {
            //2 choices left, so we need to make sure we don't end up with an orphaned participant
            //if one of the participants has not selected and has not been selected, then they must be selected.
            const possibleOrphans = selectableParticipants.filter((selectableParticipant) => {
                return selectableParticipant.hasBeenSelected === false && selectableParticipant.hasSelectedName === false;
            });
            if(possibleOrphans.length === 1) {
                selection = possibleOrphans[0];
            }
        }
        if(!selection) {
            //no required selection, so we can randomly choose.
            selection = selectableParticipants[Math.floor(Math.random() * selectableParticipants.length)];
        }

        //generate selection token
        const selectionPayload = {
            name: selection.name
        };
        const selectionToken = await jwe.createJWE(selectionPayload);
        //TODO: generate selection URL
        //TODO: SMS selection URL to hatOwner.sms

        //create list of users that still need to pick a name and randomly select next user
        const needToSelect = hatPayload.participants.filter((participant) => {
            //subject to selecting next
            return participant.hasSelectedName === false && participant.id !== hatPayload.hatOwnerId;
        });
        const nextToSelect = needToSelect[Math.floor(Math.random() * needToSelect.length)];

        //generate next hat token
        let nextHatToken = '';
        if(nextToSelect) {
            const nextHatPayload = {
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

                    return newParticipant;
                })
            };
            nextHatToken = await jwe.createJWE(nextHatPayload);
            //TODO: generate hat URL
            //TODO: SMS hat URL to nextToSelect.sms
        }

        //TODO: don't return hat
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                selection: (selection.name + (nextToSelect ? ' - ' + nextToSelect.name : '')),
                hat: nextHatToken || 'All Done'
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
