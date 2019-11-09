'use strict';

const sms = require('../../../../lib/sms');
const Hat = require('../../../lib/Hat');
const Selection = require('../../../lib/Selection');

module.exports.handler = async (event, context) => {
    try {
        //grab payload details
        const data = JSON.parse(event.body);
        const hatToken = data.hattoken;
        const hatSecret = process.env.HAT_SECRET;
        const selectionPassword = data.selectionpassword;

        //decrypt hat
        const hat = await Hat.decrypt(hatToken, hatSecret);

        //pick a selection
        const selectedParticipant = hat.pick();
        const selection = new Selection(selectedParticipant.getName());

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
        //TODO: return error response.
        console.error(err);
        throw err;
    }
};
