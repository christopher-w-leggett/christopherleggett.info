'use strict';

/*
Thrown when client is unable to be authenticated.
*/
module.exports = class AuthenticationError extends Error {
    constructor(message, error, code) {
        super(message);

        //shortcut name
        this.name = this.constructor.name;

        //capture stack
        Error.captureStackTrace(this, this.constructor);

        //set additional
        this.cause = error;
        this.status = 401;

        //set client data
        this.clientData = {
            code
        };
    }
};
