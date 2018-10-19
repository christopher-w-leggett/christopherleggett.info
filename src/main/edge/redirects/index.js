'use strict'

module.exports.handler = async (event, context) => {
    const request = event.Records[0].cf.request;
    if (request.headers.host[0].value === 'www.christopherleggett.info') {
        let url = 'https://christopherleggett.info';
        if (request.uri) {
            url += request.uri;
        }
        if (request.querystring) {
            url += '?' + request.querystring;
        }

        return {
            status: '301',
            statusDescription: 'Moved Permanently',
            headers: {
                location: [{
                    key: 'Location',
                    value: url
                }]
            }
        };
    } else {
        return request;
    }
};
