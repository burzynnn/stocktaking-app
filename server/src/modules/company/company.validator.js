import { Joi } from "celebrate";

import Validator from "../validator";

export default class CompanyValidator extends Validator {
    postEditOwnCompany = {
        body: Joi.object().options({ abortEarly: false }).keys({
            _csrf: this.getField("_csrf"),
            name: Joi.string().trim().required(),
            email: this.getField("email"),
        }),
    };
}
