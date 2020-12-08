import { Joi } from "celebrate";

import Validator from "../validator";

export default class CompanyValidator extends Validator {
    postEditCompanyEmail = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            email: this.getField("email"),
        }),
    };

    postEditCompanyName = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            name: Joi.string().trim().required(),
        }),
    };
}
