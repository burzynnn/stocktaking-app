import sgMail from "@sendgrid/mail";

import envConfig from "../config/env.config";

sgMail.setApiKey(envConfig.sendgrid.api_key);

class Mailer {
    constructor(sendgrid, fromAddress) {
        this.sg = sendgrid;
        this.from = fromAddress;
    }

    sendMail = (opts) => this.sg.send({ from: this.from, ...opts });
}

export default new Mailer(sgMail, envConfig.sendgrid.send_from);
