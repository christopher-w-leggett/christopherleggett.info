'use strict';

const sms = require('../../../../lib/sms');
const Hat = require('../../../lib/Hat');
const Participant = require('../../../lib/Participant');
const Selection = require('../../../lib/Selection');

module.exports.handler = async (event, context) => {
    try {
        //grab payload details
        const data = JSON.parse(event.body);
        const hatToken = data.hattoken;
        const hatSecret = process.env.HAT_SECRET;
        const selectionPassword = data.selectionpassword;

        //validate payload
        if(!hatToken) {
            throw new Error('A hat must be provided to pick from.');
        }
        if(!selectionPassword) {
            throw new Error('A selection password is required to secure the selection.');
        }

        //decrypt hat
        const hat = await Hat.decrypt(hatToken, hatSecret);

        //pick a selection
        const selectedParticipant = hat.pick();
        const selection = new Selection(selectedParticipant.getName());

        //encrypt selection
        const selectionToken = await selection.encrypt(selectionPassword);
        const selectionUrl = `https://${process.env.ROOT_DOMAIN_NAME}/index.html?selection=${selectionToken}`;
        await sms.send(selectionUrl, hat.getOwner().getMobileNumber());

        //generate a new list of participants for our next hat.
        let allSelected = true;
        const participants = hat.getParticipants().map((participant) => {
            //grab participant details
            const name = participant.getName();
            const mobileNumber = participant.getMobileNumber();
            const wasSelected = participant.wasSelected() || participant.isSameAs(selectedParticipant);
            const hasSelected = participant.hasSelected() || participant.isSameAs(hat.getOwner());

            //track if anybody still needs to select
            allSelected = allSelected && hasSelected;

            //return new participant
            return new Participant(name, mobileNumber, wasSelected, hasSelected);
        });

        //if not everybody selected, send a new hat to the next participant
        if(!allSelected) {
            //create next hat
            const nextHat = new Hat(participants);

            //encrypt payload
            const nextHatToken = await nextHat.encrypt(hatSecret);

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
