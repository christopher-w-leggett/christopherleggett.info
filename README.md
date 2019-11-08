# christopherleggett.info

A personal website project that provides information about myself as well as a
playground for learning new technologies.

##Deploy
gulp deploy
ENV_PROPERTIES=prod gulp run

##Run Local
gulp run
ENV_PROPERTIES=prod gulp run

##JWE Payload
```
const hatPayload = {
    hatOwnerId: 2,
    participants: [
        {
            id: 1,
            name: 'John',
            sms: '+15555555555',
            hasBeenSelected: false,
            hasSelectedName: false
        },
        {
            id: 2,
            name: 'Sarah',
            sms: '+15555552222',
            hasBeenSelected: false,
            hasSelectedName: false
        },
        {
            id: 3,
            name: 'Sam',
            sms: '+15555553333',
            hasBeenSelected: false,
            hasSelectedName: false
        }
    ]
};
```