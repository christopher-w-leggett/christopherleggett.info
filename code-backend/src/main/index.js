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
        const hatUrl = `https://${process.env.ROOT_DOMAIN_NAME}/index.html?hat=${hatToken}`;
        await sms.send(hatUrl, hat.getOwner().getMobileNumber());

        return {
            'statusCode': 200,
            'body': JSON.stringify({})
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
        const selectionPassword = data.selectionpassword;

        //decrypt hat
        const hat = await secretSanta.Hat.decrypt(hatToken, hatSecret);

        //pick a selection
        const selectedParticipant = hat.pick();
        const selection = new secretSanta.Selection(selectedParticipant.getName());

        //encrypt selection
        const selectionToken = await selection.encrypt(selectionPassword);
        const selectionUrl = `https://${process.env.ROOT_DOMAIN_NAME}/index.html?selection=${selectionToken}`;
        await sms.send(selectionUrl, hat.getOwner().getMobileNumber());

        //assign a new owner
        hat.assignNewOwner();

        //if another owner has been assigned, send the hat to the assigned owner
        let nextHatToken = '';
        if(hat.getOwner()) {
            //encrypt payload
            nextHatToken = await hat.encrypt(hatSecret);

            //construct hat url
            const nextHatUrl = `https://${process.env.ROOT_DOMAIN_NAME}/index.html?hat=${nextHatToken}`;

            //send SMS
            await sms.send(nextHatUrl, hat.getOwner().getMobileNumber());
        }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
            },
            'body': JSON.stringify({
                name: selectedParticipant.getName()
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports.revealName = async (event, context) => {
    try {
        //grab payload details
        const data = JSON.parse(event.body);
        const selectionToken = data.selectiontoken;
        const selectionPassword = data.selectionpassword;

        //decrypt selection
        const selection = await secretSanta.Selection.decrypt(selectionToken, selectionPassword);

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
            },
            'body': JSON.stringify({
                name: selection.getName()
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
