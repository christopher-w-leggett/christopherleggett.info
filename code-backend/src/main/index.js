'use strict'

module.exports.pickName = async (event, context, callback) => {
    try {
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                selection: 'selection-token',
                hat: 'new-hat'
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports.revealName = async (event, context, callback) => {
    try {
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                name: 'Chris'
            })
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
