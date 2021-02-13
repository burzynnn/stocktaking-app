import { Joi } from "celebrate";

import Validator from "../../utils/validator.util";

const userValidator = new Validator({
    userUUID: {
        params: {
            userUUID: Validator.commonFields.uuid,
        },
    },

    postEditName: {
        body: {
            name: Validator.commonFields.userName,
        },
    },

    postEditEmail: {
        body: {
            email: Validator.commonFields.email,
        },
    },

    postEditPassword: {
        body: {
            password: Validator.commonFields.password,
            repeatPassword: Joi.any().valid(Joi.ref("password")).required().messages({
                "any.only": "\"repeatPassword\" needs to match new password field value.",
            }),
        },
    },

    postCreate: {
        body: {
            name: Validator.commonFields.userName,
            email: Validator.commonFields.email,
        },
    },
});

export default userValidator.proxy;
