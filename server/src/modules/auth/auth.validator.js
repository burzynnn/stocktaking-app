import { Joi } from "celebrate";

export default class AuthValidator {
    static postLogin = {
        body: Joi.object().options({ abortEarly: false }).keys({
            email: Joi.string().email().trim().required(),
            password: Joi.string().trim().required(),
            _csrf: Joi.string().trim().length(36).required(),
        }),
    }

    static postRegister = {
        body: Joi.object().options({ abortEarly: false }).keys({
            companyName: Joi.string().min(1).trim().required(),
            companyEmail: Joi.string().email().trim().required(),
            userName: Joi.string().min(1).trim().required(),
            userEmail: Joi.string().email().trim().required(),
            userPassword: Joi.string().min(8).trim().required(),
            userRepeatPassword: Joi.any().valid(Joi.ref("userPassword")).required(),
            _csrf: Joi.string().trim().length(36).required(),
        }),
    }

    static getRegistrationVerification = {
        query: Joi.object().options({ abortEarly: false }).keys({
            hash: Joi.string().length(128).trim().required(),
            type: Joi.string().valid("company", "user").required(),
        }),
    }

    static postForgotPassword = {
        body: Joi.object().options({ abortEarly: false }).keys({
            email: Joi.string().email().trim().required(),
            _csrf: Joi.string().trim().length(36).required(),
        }),
    }

    static postResetPassword = {
        query: Joi.object().options({ abortEarly: false }).keys({
            hash: Joi.string().length(128).required(),
        }),
        body: Joi.object().options({ abortEarly: false }).keys({
            newPassword: Joi.string().min(8).trim().required(),
            repeatNewPassword: Joi.any().valid(Joi.ref("newPassword")).required(),
            _csrf: Joi.string().trim().length(36).required(),
        }),
    }
}
