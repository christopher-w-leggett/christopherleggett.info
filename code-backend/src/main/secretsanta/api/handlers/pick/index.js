'use strict';

const sms = require('../../../../lib/sms');
const Hat = require('../../../lib/Hat');
const Participant = require('../../../lib/Participant');
const Selection = require('../../../lib/Selection');
const hatRepo = require('../../../lib/hatrepository');
const response = require('../../../lib/response');
const ClientError = require('../../../lib/errors/ClientError.js');

module.exports.handler = async (event, context) => {
    try {
        //grab payload details
        const data = JSON.parse(event.body);
        const hatToken = data.hattoken;
        const hatSecret = process.env.HAT_SECRET;
        const selectionPassword = data.selectionpassword;

        //validate payload
        if(!hatToken) {
            throw new ClientError('A hat must be provided to pick from.', null, 'ss-400-1', {
                validation: [
                    {
                        type: 'field',
                        path: 'hattoken'
                    }
                ]
            });
        }
        //TODO: regex to validate hat token
        if(!selectionPassword) {
            throw new ClientError('A selection password is required to secure the selection.', null, 'ss-400-1', {
                validation: [
                    {
                        type: 'field',
                        path: 'selectionpassword'
                    }
                ]
            });
        }

        //decrypt hat
        let hat;
        try {
            hat = await Hat.decrypt(hatToken, hatSecret);
        } catch(error) {
            throw new ClientError('Unable to decrypt provided hat.', error, 'ss-400-2', {
                validation: [
                    {
                        type: 'field',
                        path: 'hattoken'
                    }
                ]
            });
        }

        //verify hat is valid
        const hatExists = await hatRepo.hasHat(hat);
        if(!hatExists) {
            throw new ClientError('Invalid hat provided or name has already been selected.', null, 'ss-400-2', {
                validation: [
                    {
                        type: 'field',
                        path: 'hattoken'
                    }
                ]
            });
        }

        //pick a selection
        const selectedParticipant = hat.pick();
        const selection = new Selection(selectedParticipant.getName());

        //encrypt selection
        const selectionToken = await selection.encrypt(selectionPassword);
        const selectionUrl = `${process.env.SECRETSANTA_ROOT_URL}/secret-santa.html?selection=${selectionToken}`;
        await sms.send(`Secret Santa: See your selection at ${selectionUrl}`, hat.getOwner().getMobileNumber());

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
            await hatRepo.writeHat(nextHat);

            //encrypt payload
            const nextHatToken = await nextHat.encrypt(hatSecret);

            //construct hat url
            const nextHatUrl = `${process.env.SECRETSANTA_ROOT_URL}/secret-santa.html?hat=${nextHatToken}`;

            //send SMS
            await sms.send(`Secret Santa: Pick your name at ${nextHatUrl}`, nextHat.getOwner().getMobileNumber());
        }

        //cleanup
        await hatRepo.deleteHat(hat);

        return response.ok({
            name: selectedParticipant.getName()
        });
    } catch (error) {
        console.error(error);
        return response.error(error);
    }
};
