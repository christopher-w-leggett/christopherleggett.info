'use strict';

const sms = require('../../../../lib/sms');
const Hat = require('../../../lib/Hat');
const Participant = require('../../../lib/Participant');
const hatRepo = require('../../../lib/hatrepository');
const payload = require('../../../lib/payload');
const response = require('../../../lib/response');
const AuthenticationError = require('../../../lib/errors/AuthenticationError.js');
const ClientError = require('../../../lib/errors/ClientError.js');

function handleAuth(event, context) {
    //grab authorization header
    const authorization = event.headers['Authorization'];

    //unauthorized if no header
    if(!authorization) {
        throw new AuthenticationError('No authentication credentials found.', null, 'ss-401-1');
    }

    //validate authorization type
    const authorizationParts = authorization.split(' ');
    if(authorizationParts.length !== 2 || authorizationParts[0] !== 'Basic') {
        throw new AuthenticationError('Unsupported authentication credentials found.', null, 'ss-401-2');
    }

    //grab credentials
    const credentials = (new Buffer(authorizationParts[1], 'base64')).toString().split(':');
    const username = credentials[0];
    const password = credentials[1];

    //validate credentials
    if(!(username === process.env.SECRETSANTA_ADMIN_USER && password === process.env.SECRETSANTA_ADMIN_PASS)) {
        throw new AuthenticationError('Invalid authentication credentials provided.', null, 'ss-401-3');
    }
}

//TODO: Implement more robust authentication
module.exports.handler = async (event, context) => {
    try {
        //ensure authorization
        handleAuth(event, context);

        //grab payload
        const data = payload.readJson(event);
        const hatSecret = process.env.HAT_SECRET;

        //validate payload
        if(!data || !data.participants || !data.participants.length) {
            throw new ClientError('No participants provided.', null, 'ss-400-1', {
                validation: [
                    {
                        type: 'field',
                        path: 'participants'
                    }
                ]
            });
        }

        //create participants
        const participants = data.participants.map((participant) => {
            return Participant.fromJson(participant);
        });

        //create hat
        const hat = new Hat(participants);
        await hatRepo.writeHat(hat);

        //encrypt payload
        const hatToken = await hat.encrypt(hatSecret);
        const hatUrl = `${process.env.SECRETSANTA_ROOT_URL}/secret-santa.html?hat=${hatToken}`;
        await sms.send(hatUrl, hat.getOwner().getMobileNumber());

        return response.ok();
    } catch (error) {
        console.error(error);
        return response.error(error);
    }
};
