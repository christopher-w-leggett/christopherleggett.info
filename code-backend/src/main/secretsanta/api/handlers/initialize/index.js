'use strict';

const sms = require('../../../../lib/sms');
const Hat = require('../../../lib/Hat');
const Participant = require('../../../lib/Participant');
const hatRepo = require('../../../lib/hatrepository');

function handleAuth(event, context) {
    //grab authorization header
    const authorization = event.headers['Authorization'];

    //unauthorized if no header
    if(!authorization) {
        throw new Error('Unauthorized');
    }

    //validate authorization type
    const authorizationParts = authorization.split(' ');
    if(authorizationParts.length !== 2 || authorizationParts[0] !== 'Basic') {
        throw new Error('Unauthorized');
    }

    //grab credentials
    const credentials = (new Buffer(authorizationParts[1], 'base64')).toString().split(':');
    const username = credentials[0];
    const password = credentials[1];

    //validate credentials
    if(!(username === process.env.SECRETSANTA_ADMIN_USER && password === process.env.SECRETSANTA_ADMIN_PASS)) {
        throw new Error('Unauthorized');
    }
}

//TODO: Implement more robust authentication
module.exports.handler = async (event, context) => {
    try {
        //ensure authorization
        handleAuth(event, context);

        //grab payload
        const data = JSON.parse(event.body);
        const hatSecret = process.env.HAT_SECRET;

        //validate payload
        if(!data.participants || !data.participants.length) {
            //TODO: Throw specific error
            throw new Error('Invalid payload.  No participants provided.');
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
        const hatUrl = `${process.env.SECRETSANTA_ROOT_URL}/index.html?hat=${hatToken}`;
        await sms.send(hatUrl, hat.getOwner().getMobileNumber());

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
            },
            'body': JSON.stringify({})
        };
    } catch (err) {
        //TODO: return error response.
        console.error(err);
        throw err;
    }
};
