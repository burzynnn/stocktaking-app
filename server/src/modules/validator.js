import { celebrate, Joi, Segments } from "celebrate";

export default class Validator {
    constructor() {
        this.fields = {
            email: Joi.string().email().trim().required(),
            _csrf: Joi.string().trim().length(36).required(),
        };
    }

    getField = (field) => this.fields[field];

    returnValidator = (validator) => {
        const validatorReference = this[validator];
        const extendedValidator = {};
        if (validatorReference.body) {
            extendedValidator[Segments.BODY] = validatorReference.body;
        }
        if (validatorReference.query) {
            extendedValidator[Segments.QUERY] = validatorReference.query;
        }
        if (validatorReference.params) {
            extendedValidator[Segments.PARAMS] = validatorReference.params;
        }
        return celebrate(extendedValidator);
    }
}
