'use strict'

//load dependencies
const validator = require('./validator.js');
const inquirer = require('inquirer');

//reused validation configs
const s3BucketRegex = /^[a-z0-9\.\-]+$/;

//define properties
const PROPERTY_DEFINITIONS = {
    'backend-s3-bucket': {
        'validation': {
            'required': true,
            'regex': s3BucketRegex
        },
        'prompt': {
            'type': 'input',
            'name': 'backend-s3-bucket',
            'message': 'Please provide a valid S3 bucket:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['backend-s3-bucket'].validation)) {
                    return true;
                } else {
                    return 'Invalid S3 bucket provided.';
                }
            }
        }
    },
    'backend-archive-name': {
        'validation': {
            'required': true,
            'regex': /^[a-z0-9\.\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'backend-archive-name',
            'message': 'Please provide a valid name for the built code archive:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['backend-archive-name'].validation)) {
                    return true;
                } else {
                    return 'Invalid code archive name provided.';
                }
            }
        }
    },
    'backend-files': {
        'validation': {
            'required': true
        }
    },
    'backend-build-dir': {
        'validation': {
            'required': true
        }
    },
    'frontend-s3-bucket': {
        'validation': {
            'required': true,
            'regex': s3BucketRegex
        },
        'prompt': {
            'type': 'input',
            'name': 'frontend-s3-bucket',
            'message': 'Please provide a valid S3 bucket:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['frontend-s3-bucket'].validation)) {
                    return true;
                } else {
                    return 'Invalid S3 bucket provided.';
                }
            }
        }
    },
    'frontend-content-files': {
        'validation': {
            'required': true
        }
    },
    'frontend-build-dir': {
        'validation': {
            'required': true
        }
    },
    'frontend-config-src-file': {
        'validation': {
            'required': true
        }
    },
    'frontend-config-dst-file': {
        'validation': {
            'required': true
        }
    },
    'frontend-module-dirs': {
        'validation': {
            'required': true
        }
    },
    'stack-name': {
        'validation': {
            'required': true,
            'regex': /^[a-zA-Z0-9\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'stack-name',
            'message': 'Please provide a valid stack name:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['stack-name'].validation)) {
                    return true;
                } else {
                    return 'Invalid stack name provided.';
                }
            }
        }
    },
    'profile': {
        'validation': {
            'regex': /^[a-zA-Z0-9\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'profile',
            'message': 'Please provide AWS CLI profile to use [Optional]:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['profile'].validation)) {
                    return true;
                } else {
                    return 'Invalid AWS CLI profile provided.';
                }
            }
        }
    },
    'stack-root-domain-name': {
        'validation': {
            'required': true,
            'regex': /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/
        },
        'prompt': {
            'type': 'input',
            'name': 'stack-root-domain-name',
            'message': 'Please provide a valid root domain name:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['stack-root-domain-name'].validation)) {
                    return true;
                } else {
                    return 'Invalid root domain name provided.';
                }
            }
        }
    },
    'stack-hat-secret': {
        'validation': {
            'required': true,
            'regex': /^[a-zA-Z0-9\-]+$/
        },
        'prompt': {
            'type': 'input',
            'name': 'stack-hat-secret',
            'message': 'Please provide a valid hat secret:',
            'validate': (input) => {
                if (validator.valid(input, PROPERTY_DEFINITIONS['stack-hat-secret'].validation)) {
                    return true;
                } else {
                    return 'Invalid hat secret provided.';
                }
            }
        }
    }
};

//load properties
const PROPERTIES_FILE = './properties-' + (process.env.ENV_PROPERTIES || 'local') + '.json';
let properties = {};
try {
    properties = require(PROPERTIES_FILE);
} catch (error) {
    console.debug('Properties file "' + PROPERTIES_FILE + '" not found.')
}

//validate loaded properties
Object.keys(properties).forEach((key) => {
    if (PROPERTY_DEFINITIONS[key] && PROPERTY_DEFINITIONS[key].validation) {
        if (!validator.valid(properties[key], PROPERTY_DEFINITIONS[key].validation)) {
            console.warn('Property ' + key + ' in "' + PROPERTIES_FILE + '" is invalid.  Ignoring value.');
            delete properties[key];
        }
    }
});

module.exports = {
    read: async (name, prompt) => {
        let value;

        if (!properties.hasOwnProperty(name)) {
            if (PROPERTY_DEFINITIONS[name]) {
                if (prompt && PROPERTY_DEFINITIONS[name].prompt) {
                    console.info('Configure ' + name + ' property in "' + PROPERTIES_FILE + '" to suppress prompt.');
                    let promptValue = await inquirer.prompt([PROPERTY_DEFINITIONS[name].prompt]);
                    value = promptValue[name];
                } else if (!PROPERTY_DEFINITIONS[name].validation.required) {
                    value = null;
                } else {
                    throw new Error('Required property ' + name + ' not configured in ' + PROPERTIES_FILE + '.');
                }
            } else {
                throw new Error('Invalid property ' + name + ' being requested.');
            }
        } else {
            value = properties[name];
        }

        return value;
    }
};
