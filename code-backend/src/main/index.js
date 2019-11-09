'use strict'

const jwe = require('./lib/jwe');
const sms = require('./lib/sms')
const secretSanta = require('./secretsanta');

//TODO: Basic Auth for initialize
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

        //assign owner
        hat.assignNewOwner();

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
        //grab payload details
        const data = JSON.parse(event.body);
        const hatToken = data.hattoken;
        const hatSecret = process.env.HAT_SECRET;
        //TODO: read password from json post data
        const selectionPassword = 'test';

        //decrypt hat
        const hat = await secretSanta.Hat.decrypt(hatToken, hatSecret);

        //pick a selection
        const selectedParticipant = hat.pick();
        const selection = new secretSanta.Selection(selectedParticipant.getName());

        //encrypt selection
        const selectionToken = selection.encrypt(selectionPassword);
        //TODO: generate selection URL
        //TODO: SMS selection URL to hatOwner.sms

        //assign a new owner
        hat.assignNewOwner();

        //if another owner has been assigned, send the hat to the assigned owner
        let nextHatToken = '';
        if(hat.getOwnerId() > -1) {
            //encrypt payload
            nextHatToken = await hat.encrypt(hatSecret);

            //construct hat url
            const nextHatUrl = `https://${process.env.ROOT_DOMAIN_NAME}/index.html?hat=${nextHatToken}`;

            //send SMS
            await sms.send(nextHatUrl, selectedParticipant.getMobileNumber());
        }

        //TODO: don't return hat
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
            },
            'body': JSON.stringify({
                selection: (selectedParticipant.getName() + ' - ' + hat.getOwnerId()),
                hat: (nextHatToken || 'All Done') + ' - ' + JSON.stringify(hat.toJson())
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

//TODO: Implement
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
