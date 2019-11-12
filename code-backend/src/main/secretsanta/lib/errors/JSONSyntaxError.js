'use strict';

/*
Thrown when json payload sent to lambda handler is invalid.
*/
module.exports = class JSONSyntaxError extends Error {
    constructor(message, error) {
        super(message);

        //shortcut name
        this.name = this.constructor.name;

        //capture stack
        Error.captureStackTrace(this, this.constructor);

        //set additional
        this.cause = error;
        this.status = 400;

        //set client data
        this.clientData = {
            code: 'ss-400-2',
            validation: [
                {
                    type: 'payload'
                }
            ]
        };
    }
};
