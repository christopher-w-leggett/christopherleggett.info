'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

module.exports = {
    writeHat: async function(hat) {
        if(process.env.ENABLE_DYNAMO_DB === 'true') {
            //get dynamo api
            const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

            //create request params
            const params = {
                TableName: process.env.SECRETSANTA_HAT_TABLE_NAME,
                Item: {
                    'hatId': {S: hat.getHatId()}
                }
            };

            //write hat id
            await new Promise((resolve, reject) => {
                dynamo.putItem(params, function(error, data) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });
        } else {
            console.log(`Writing Hat: ${hat.getHatId()}`);
        }
    },
    hasHat: async function(hat) {
        if(process.env.ENABLE_DYNAMO_DB === 'true') {
            //get dynamo api
            const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

            //create request params
            const params = {
                TableName: process.env.SECRETSANTA_HAT_TABLE_NAME,
                Key: {
                    'hatId': {S: hat.getHatId()}
                }
            };

            //read hat id
            const data = await new Promise((resolve, reject) => {
                dynamo.getItem(params, function(error, data) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });

            //{ Item: { hatId: { S: 'd277d5e2-e426-42fb-a656-618ef401b00f' } } }
            return data && data.Item && data.Item.hatId && data.Item.hatId.S === hat.getHatId();
        } else {
            return true;
        }
    },
    deleteHat: async function(hat) {
        if(process.env.ENABLE_DYNAMO_DB === 'true') {
            //get dynamo api
            const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

            //create request params
            const params = {
                TableName: process.env.SECRETSANTA_HAT_TABLE_NAME,
                Key: {
                    'hatId': {S: hat.getHatId()}
                }
            };

            //delete hat id
            await new Promise((resolve, reject) => {
                dynamo.deleteItem(params, function(error, data) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            });
        } else {
            console.log(`Deleting Hat: ${hat.getHatId()}`);
        }
    }
};
