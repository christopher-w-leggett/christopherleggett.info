'use strict';

//TODO: remove when more robust auth is implemented
function buildAllowAllPolicy (event, principalId) {
    //parse event method ARN.
    const arnParts = event.methodArn.split(':');
    const awsRegion = arnParts[3];
    const awsAccountId = arnParts[4];
    const apiGatewayArnParts = arnParts[5].split('/');
    const restApiId = apiGatewayArnParts[0];
    const stage = apiGatewayArnParts[1];

    //generate api ARN
    const apiArn = `arn:aws:execute-api:${awsRegion}:${awsAccountId}:${restApiId}/${stage}/*/*`;

    //generate policy
    const policy = {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: [apiArn]
                }
            ]
        }
    };

    return policy;
}

module.exports.handler = async function (event, context) {
    //grab authorization header
    const authorization = event.headers.Authorization;

    //unauthorized if no header
    if(!authorization) {
        throw new Error('Unauthorized');
    }

    //validate authorization type
    const authorizationParts = authorizationHeader.split(' ');
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

    //return access policy
    return buildAllowAllPolicy(event, username);
}
