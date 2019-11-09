'use strict';

const sms = require('../../../../lib/sms');
const Hat = require('../../../lib/Hat');
const Participant = require('../../../lib/Participant');

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

        //create hat
        const hat = new Hat();

        //add participants
        if(data.participants && data.participants.length) {
            data.participants.forEach((participant) => {
                hat.addParticipant(Participant.fromJson(participant));
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
