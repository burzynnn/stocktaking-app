import { celebrate, Joi, Segments } from "celebrate";

export default class Validator {
    constructor(rules) {
        this.rules = rules;
        this.proxy = new Proxy(this.rules, {
            get: (target, prop) => {
                if (prop in target) {
                    const validatorReference = target[prop];
                    const extendedValidator = {};
                    if (validatorReference.body) {
                        extendedValidator[Segments.BODY] = this.convertToJoiValidator(
                            validatorReference.body,
                        );
                    }
                    if (validatorReference.query) {
                        extendedValidator[Segments.QUERY] = this.convertToJoiValidator(
                            validatorReference.query,
                        );
                    }
                    if (validatorReference.params) {
                        extendedValidator[Segments.PARAMS] = this.convertToJoiValidator(
                            validatorReference.params,
                        );
                    }
                    return celebrate(extendedValidator);
                }
                throw new Error(`there is no validator like ${prop}`);
            },
        });
    }

    convertToJoiValidator = (validator) => Joi
        .object()
        .options({ abortEarly: false })
        .keys(validator);

    static commonFields = {
        email: Joi.string().email().trim().required(),
        csrf: Joi.string().trim().length(36).required(),
        password: Joi.string().min(8).trim().required(),
        hash: Joi.string().length(128).trim().required(),
        uuid: Joi.string().uuid({ version: "uuidv4" }),
        userName: Joi.string().regex(/^[a-zA-Z0-9,.-_ ]*$/, "alphanumerics, comma, dot, hyphen and underscore characters").min(2).trim()
            .required(),
        companyName: Joi.string().regex(/^[a-zA-Z0-9,.-_ ]*$/, "alphanumerics, comma, dot, hyphen and underscore characters").min(2).trim()
            .required(),
    }
}
