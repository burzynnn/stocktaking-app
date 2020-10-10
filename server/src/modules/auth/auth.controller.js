import { hash } from "argon2";

import CompanyService from "../company/company.service";
import CompanyModel from "../company/company.model";
import UserService from "../user/user.service";
import UserModel from "../user/user.model";
import mailer from "../../loaders/sendgrid.loader";

import generateRandomString from "../../utils/generateRandomString";

class AuthController {
    constructor(CS, CM, US, UM, mailingUtil) {
        this.companyService = new CS(CM);
        this.userService = new US(UM);
        this.mailer = mailingUtil;
    }

    getLogin = (req, res) => res.render("modules/auth/login", { title: "Log in!" });

    getRegister = (req, res) => res.render("modules/auth/register", { title: "Register" });

    postLogin = async (req, res) => res.send("<h1>nothin here</h1>");

    postRegister = async (req, res, next) => {
        const {
            companyName, companyEmail, userName, userEmail, userPassword, userRepeatPassword,
        } = req.body;
        try {
            // TODO: one error should revert all inserts !!!
            // TODO: swap res.send with res.render
            if (userPassword !== userRepeatPassword) {
                return res.send("<h1>Passwords are not the same.</h1>");
            }

            const companyDuplicate = await this.companyService.findOneByEmail(companyEmail);
            if (companyDuplicate) {
                return res.send("<h1>Company with this email has been already registered.");
            }

            const companyActivationHash = generateRandomString();
            const companyActivationExpirationDate = new Date();
            companyActivationExpirationDate.setHours(
                companyActivationExpirationDate.getHours() + 1,
            );

            const createdCompany = await this.companyService.create(
                companyName,
                companyEmail,
                companyActivationHash,
                companyActivationExpirationDate,
            );

            const companyMsg = {
                to: createdCompany.official_email,
                subject: "Sending with Twilio SendGrid is Fun",
                text: "and easy to do anywhere, even with Node.js",
                html: "<strong>and easy to do anywhere, even with Node.js</strong>",
            };

            await this.mailer.sendMail(companyMsg);

            const userDuplicate = await this.userService.findOneByEmail(userEmail);
            if (userDuplicate) {
                return res.send("<h1>User with this email has been already registered</h1>");
            }

            const userActivationHash = generateRandomString();
            const userActivationExpirationDate = new Date();
            userActivationExpirationDate.setHours(userActivationExpirationDate.getHours() + 1);

            const hashedPassword = await hash(userPassword);
            console.log(hashedPassword);
            const createdUser = await this.userService.create(userName, userEmail, hashedPassword, userActivationHash, userActivationExpirationDate, createdCompany.uuid, "b8c2301c-ac75-4aa5-86ba-0d70956a59ea");

            const userMsg = {
                to: createdUser.email,
                subject: "Sending with Twilio SendGrid is Fun",
                text: "and easy to do anywhere, even with Node.js",
                html: "<strong>and easy to do anywhere, even with Node.js</strong>",
            };

            await this.mailer.sendMail(userMsg);

            return res.send("<h1>Your company has been registered and user created.</h1>");
        } catch (err) {
            return next(err);
        }
    }
}

export default new AuthController(CompanyService, CompanyModel, UserService, UserModel, mailer);
