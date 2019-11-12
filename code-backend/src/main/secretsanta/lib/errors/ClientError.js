'use strict';

/*
Thrown when client sends invalid data.
*/
module.exports = class ClientError extends Error {
    constructor(message, error, code, clientData) {
        super(message);

        //shortcut name
        this.name = this.constructor.name;

        //capture stack
        Error.captureStackTrace(this, this.constructor);

        //set additional
        this.cause = error;
        this.status = 400;

        //set client data
        this.clientData = Object.assign({}, clientData || {}, {code});
    }
};
