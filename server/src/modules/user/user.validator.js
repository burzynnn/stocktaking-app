import { Joi } from "celebrate";

import Validator from "../validator";

export default class UserValidator extends Validator {
    postEditSelfUser = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            name: Joi.string().trim().required(),
            email: this.getField("email"),
            password: Joi.string().min(8).trim().allow(""),
            repeatPassword: Joi.any().valid(Joi.ref("password")).required().messages({
                "any.only": "\"password\" value has to match \"repeatPassword\" value",
            }),
        }),
    };
}
