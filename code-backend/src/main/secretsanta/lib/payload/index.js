'use strict';

const JSONSyntaxError = require('../errors/JSONSyntaxError.js');

module.exports.readJson = function(event) {
	try {
	    return JSON.parse(event.body);
	} catch(error) {
        throw new JSONSyntaxError('Error reading JSON data.', error);
	}
};
