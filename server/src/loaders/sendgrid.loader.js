import sgMail from "@sendgrid/mail";

import envConfig from "../config/env.config";

sgMail.setApiKey(envConfig.sendgrid.api_key);

export default sgMail;
