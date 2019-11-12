'use strict';

const Selection = require('../../../lib/Selection');
const response = require('../../../lib/response');
const ClientError = require('../../../lib/errors/ClientError.js');

module.exports.handler = async (event, context) => {
    try {
        //grab payload details
        const data = JSON.parse(event.body);
        const selectionToken = data.selectiontoken;
        const selectionPassword = data.selectionpassword;

        //validate payload
        if(!selectionToken) {
            throw new ClientError('A selection must be provided to reveal the name.', null, 'ss-400-1', {
                validation: [
                    {
                        type: 'field',
                        path: 'selectiontoken'
                    }
                ]
            });
        }
        //TODO: regex to validate selection token
        if(!selectionPassword) {
            throw new ClientError('A selection password is required to reveal the name.', null, 'ss-400-1', {
                validation: [
                    {
                        type: 'field',
                        path: 'selectionpassword'
                    }
                ]
            });
        }

        //decrypt selection
        let selection;
        try {
            selection = await Selection.decrypt(selectionToken, selectionPassword);
        } catch(error) {
            throw new ClientError('Unable to decrypt provided selection.', error, 'ss-400-2', {
                validation: [
                    {
                        type: 'field',
                        path: 'selectiontoken'
                    }
                ]
            });
        }

        return response.ok({
            name: selection.getName()
        });
    } catch (error) {
        console.error(error);
        return response.error(error);
    }
};
