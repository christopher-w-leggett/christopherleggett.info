'use strict';

module.exports.ok = function(data) {
	const headers= {
        'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
    };

	const response = {
        'statusCode': 200,
        'headers': headers
    };

	if(data) {
	    response.body = JSON.stringify(data);
	}

	return response;
};

module.exports.error = function(error) {
    const status = error.status || 500;

    const responseBody = {
        "error": Object.assign({}, error.clientData, {status: status})
    };

    return {
        statusCode: status,
        headers: {
            'Access-Control-Allow-Origin': `https://${process.env.ROOT_DOMAIN_NAME}`
        },
        body: JSON.stringify(responseBody)
    };
};
