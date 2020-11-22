import { Joi } from "celebrate";

import Validator from "../validator";

export default class AuthValidator extends Validator {
    postLogin = {
        body: Joi.object().options({ abortEarly: false }).keys({
            email: this.getField("email"),
            password: Joi.string().trim().required(),
            _csrf: this.getField("_csrf"),
        }),
    }

    postRegister = {
        body: Joi.object().options({ abortEarly: false }).keys({
            companyName: Joi.string().min(1).trim().required(),
            companyEmail: this.getField("email"),
            userName: Joi.string().min(1).trim().required(),
            userEmail: this.getField("email"),
            userPassword: Joi.string().min(8).trim().required(),
            userRepeatPassword: Joi.any().valid(Joi.ref("userPassword")).required().messages({
                "any.only": "\"userPassword\" value has to match \"userRepeatPassword\" value",
            }),
            _csrf: this.getField("_csrf"),
        }),
    }

    getRegistrationVerification = {
        query: Joi.object().options({ abortEarly: false }).keys({
            hash: Joi.string().length(128).trim().required(),
            type: Joi.string().valid("company", "user").required(),
        }),
    }

    postForgotPassword = {
        body: Joi.object().options({ abortEarly: false }).keys({
            email: this.getField("email"),
            _csrf: this.getField("_csrf"),
        }),
    }

    postResetPassword = {
        query: Joi.object().options({ abortEarly: false }).keys({
            hash: Joi.string().length(128).required(),
        }),
        body: Joi.object().options({ abortEarly: false }).keys({
            newPassword: Joi.string().min(8).trim().required(),
            repeatNewPassword: Joi.any().valid(Joi.ref("newPassword")).required(),
            _csrf: this.getField("_csrf"),
        }),
    }
}
