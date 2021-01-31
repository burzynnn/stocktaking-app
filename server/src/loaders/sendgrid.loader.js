import sgMail from "@sendgrid/mail";

import envConfig from "../config/env.config";

sgMail.setApiKey(envConfig.sendgrid.api_key);

class MailSender {
    constructor(sendgrid, fromAddress) {
        this.sg = sendgrid;
        this.from = fromAddress;
    }

    sendMail = (opts) => this.sg.send({ from: this.from, ...opts });
}

export default new MailSender(sgMail, envConfig.sendgrid.sender_email);
