import envConfig from "../../config/env.config";

export default class MailService {
    constructor(mailSender) {
        this.mailSender = mailSender;
        this.url = envConfig.server.url;
    }

    companyRegister = ({ receiver, activationHash }) => this.mailSender.sendMail({
        to: receiver,
        subject: "Confirm your company registration.",
        text: `We are happy to see your company on stocktaking-app!
        However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
        ${this.url}/auth/company-activation?hash=${activationHash}`,
        html: `<h1>We are happy to see your company on stocktaking-app!</h1>
        <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
        <a href='${this.url}/auth/company-activation?hash=${activationHash}'>Confirm your registration!</a>`,
    });

    userRegister = ({ receiver, activationHash }) => this.mailSender.sendMail({
        to: receiver,
        subject: "Confirm your registration.",
        text: `We are happy to see you on stocktaking-app!
        However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
        ${this.url}/auth/user-activation?hash=${activationHash}`,
        html: `<h1>We are happy to see you on stocktaking-app!</h1>
        <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
        <a href='${this.url}/auth/user-activation?hash=${activationHash}'>Confirm your registration!</a>`,
    });

    passwordForgot = ({ receiver, passwordResetHash }) => this.mailSender.sendMail({
        to: receiver,
        subject: "Reset password.",
        text: `You have received this email because of your password reset request.
        If this was not done by you you can ignore this message.
        Otherwise click link below.
        ${this.url}/auth/reset-password?hash=${passwordResetHash}`,
        html: `<h1>You have received this email because of your password reset request.</h1>
        <p>If this was not done by you you can ignore this message.
        Otherwise click link below.<p>
        <a href='${this.url}/auth/reset-password?hash=${passwordResetHash}'>Reset my password!</a>`,
    });
}
