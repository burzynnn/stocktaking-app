import { Joi } from "celebrate";

import Validator from "../../utils/validator.util";

const authValidator = new Validator({
    postRegister: {
        body: {
            companyName: Validator.commonFields.companyName,
            companyEmail: Validator.commonFields.email,
            userName: Validator.commonFields.userName,
            userEmail: Validator.commonFields.email,
            userPassword: Validator.commonFields.password,
            repeatUserPassword: Joi.any().valid(Joi.ref("userPassword")).required().messages({
                "any.only": "\"repeatPassword\" value needs to match password provided in previous input.",
            }),
            _csrf: Validator.commonFields.csrf,
        },
    },

    postLogIn: {
        body: {
            email: Validator.commonFields.email,
            password: Validator.commonFields.password,
            _csrf: Validator.commonFields.csrf,
        },
    },

    getUserActivation: {
        query: {
            hash: Validator.commonFields.hash,
        },
    },

    getCompanyActivation: {
        query: {
            hash: Validator.commonFields.hash,
        },
    },

    postForgotPassword: {
        body: {
            email: Validator.commonFields.email,
        },
    },

    postResetPassword: {
        body: {
            newPassword: Validator.commonFields.password,
            repeatNewPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
                "any.only": "\"newPassword\" value needs to match password provided in first input.",
            }),
        },
        query: {
            hash: Validator.commonFields.hash,
        },
    },

    postSetPassword: {
        body: {
            newPassword: Validator.commonFields.password,
        },
        query: {
            hash: Validator.commonFields.hash,
        },
    },
});

export default authValidator.proxy;
