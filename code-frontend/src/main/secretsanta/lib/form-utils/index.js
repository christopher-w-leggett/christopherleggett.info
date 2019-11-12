'use strict';

module.exports = {
    toJson: function(form) {
        const obj = {};
        const elements = form.querySelectorAll("input, select, textarea");
        for(let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const name = element.name;
            const value = element.value;

            if(name) {
                obj[name] = value;
            }
        }

        return obj;
    }
};
