'use strict'

const jwe = require('./lib/jwe/index.js');
const AWS = require('aws-sdk');
const secretSanta = require('./secretsanta');

module.exports.initialize = async (event, context) => {
    try {
        //grab payload
        const data = JSON.parse(event.body);
        const hatSecret = process.env.HAT_SECRET;

        //create hat
        const hat = new secretSanta.Hat();

        //add participants
        if(data.participants && data.participants.length) {
            data.participants.forEach((participant) => {
                hat.addParticipant(secretSanta.Participant.fromJson(participant));
            });
        }

        //select owner
        hat.pickNewOwner();

        //encrypt payload
        const hatToken = await hat.encrypt(hatSecret);
        //TODO: create hat url and send to first participant

        return {
            'statusCode': 200,
            'body': JSON.stringify({
                hatJson: hat.toJson(),
                hat: hatToken
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports.pickName = async (event, context) => {
    try {
        //grab payload
        const data = JSON.parse(event.body);
        const hatSecret = process.env.HAT_SECRET;
//        const hatToken = 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUEJFUzItSFMyNTYrQTEyOEtXIiwia2lkIjoiVE5WdkdlU2VqOUVMTHZqbi0yQmJsVHJTc1BwSWVjSllIT1F1VTdLQzZOUSIsInAycyI6IndQeC1tV0pqUnVTNXJkWkFpOVFZdEEiLCJwMmMiOjgxOTJ9.x7m55W6YF1Jc1rbppwRtEJ_u0JX5rytRpQOKF1TQnsUSawvrCeaeIA.BESIl2n-K4ZCM5LpnZG0HA.Eu7GR7b0mmr4nbCYiLJscGI9ZuUe_G8phBQ65NRnGTtkjpti1SrUiOlkFqYmQN0itIDrCWL-fDae_hqXyYbc84yXaQUQ82tV6Wy0SoZyp3Y8SMmjVulrdUm-ItNK5m3gdSwuOPXX-BB9ObGXmV7KUAbYMjm_ddVUBzNuURn91OJIpmAMUS6YScwod5qsSmvZj07stGxt7z1IPBNPk-NFSAhJb1O9_QwabEWZjm0AnsDA_ZRg9WwdUm1otI7rdIWY_niKmaALq3G3vSsG6mdEAQkbZ3OPj1U9x92aimOqVNEbk7U-OBXT3wyv_cSTSuQYIepLuF1D_6KUCQvjc-n622iajjDfgoHjQQCqY803pWWx9lFxoY75Ks-qIGi0Nln9I7eZHJ6HqJj-BDpUIn9tqbDnf_A101aw2EvUd1lFEpA.zDOtDVa45hgEvTAPPzNhSw';
        const hatToken = data.hattoken;
        //TODO: read password from json post data
        const selectionPassword = 'test';
        const hatPayload = await jwe.readPayload(hatToken, hatSecret);

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
        const selectionToken = await jwe.create(selectionPayload, selectionPassword);
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
            nextHatToken = await jwe.create(nextHatPayload, hatSecret);
            const nextHatUrl = `https://${process.env.ROOT_DOMAIN_NAME}/index.html?hat=${nextHatToken}`;

            //send SMS
            const sns = new AWS.SNS();
            const params = {
                Message: nextHatUrl,
                MessageStructure: 'string',
                PhoneNumber: nextToSelect.sms
            };
            await new Promise((resolve, reject) => {
                sns.publish(params, (error, data) => {
                    if(error) {
                        reject(error);
                    } else {
                        console.log(JSON.stringify(data));
                        resolve(data);
                    }
                });
            });
        }

        //TODO: don't return hat
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
            },
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

module.exports.revealName = async (event, context) => {
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
            'headers': {
                'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
            },
            'body': JSON.stringify({
                name: selectionPayload.name
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
