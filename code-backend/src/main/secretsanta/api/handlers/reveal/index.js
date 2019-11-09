'use strict';

const Selection = require('../../../lib/Selection');

module.exports.handler = async (event, context) => {
    try {
        //grab payload details
        const data = JSON.parse(event.body);
        const selectionToken = data.selectiontoken;
        const selectionPassword = data.selectionpassword;

        //decrypt selection
        const selection = await Selection.decrypt(selectionToken, selectionPassword);

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
        //TODO: return error response.
        console.error(err);
        throw err;
    }
};
