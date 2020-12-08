import { Joi } from "celebrate";

import Validator from "../validator";

export default class UserValidator extends Validator {
    postEditUserName = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            name: Joi.string().trim().required(),
        }),
    }

    postEditUserEmail = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            email: this.getField("email"),
        }),
    }

    postEditUserPassword = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            password: Joi.string().min(8).trim().allow(""),
            repeatPassword: Joi.any().valid(Joi.ref("password")).required().messages({
                "any.only": "\"repeatPassword\" needs to match new password field value.",
            }),
        }),
    }
}
