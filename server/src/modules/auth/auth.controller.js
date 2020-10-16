import { hash as argonHash, verify as argonVerify } from "argon2";
import dayjs from "dayjs";

import companyService from "../company/company.service";
import userService from "../user/user.service";
import mailer from "../../loaders/sendgrid.loader";

import generateHash from "../../utils/generateHash";
import generateExpirationDate from "../../utils/generateExpirationDate";

class AuthController {
    constructor(cS, uS, mailingUtil) {
        this.companyService = cS;
        this.userService = uS;
        this.mailer = mailingUtil;
    }

    getLogin = (req, res) => res.render("modules/auth/login", { title: "Log in!" });

    postLogin = async (req, res, next) => {
        const { email, password } = req.body;

        if (req.session.loggedIn) {
            return res.redirect("/");
        }

        try {
            const foundUser = await this.userService.findOneByEmail(email);
            if (!foundUser) {
                return res.send("<h1>No user found with provided email.</h1>");
            }
            if (!foundUser.active) {
                return res.send("<h1>You didn't activate your account.</h1>");
            }
            if (!await argonVerify(foundUser.password, password)) {
                return res.send("<h1>Wrong password.</h1>");
            }

            req.session.loggedIn = true;
            req.session.uuid = foundUser.uuid;
            req.session.user_type_uuid = foundUser.user_has_user_type.uuid;

            return res.redirect("/");
        } catch (err) {
            return next(err);
        }
    }

    getRegister = (req, res) => res.render("modules/auth/register", { title: "Register" });

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

            // company
            const companyDuplicate = await this.companyService.findOneByEmail(companyEmail);
            if (companyDuplicate) {
                return res.send("<h1>Company with this email has been already registered.");
            }

            const companyActivationHash = await generateHash(128);
            const companyActivationExpirationDate = generateExpirationDate(1);

            const createdCompany = await this.companyService.create({
                name: companyName,
                email: companyEmail,
                hash: companyActivationHash,
                timestamp: companyActivationExpirationDate,
            });

            const companyMsg = {
                to: createdCompany.official_email,
                subject: "Confirm your company registration.",
                text: `We are happy to see your company on stocktaking-app!
                However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
                http://localhost:3000/auth/registration-verification?hash=${companyActivationHash}&type=company`,
                html: `<h1>We are happy to see your company on stocktaking-app!</h1>
                <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
                <a href='http://localhost:3000/auth/registration-verification?hash=${companyActivationHash}&type=company'>Confirm your registration!</a>`,
            };
            await this.mailer.sendMail(companyMsg);

            // user
            const userDuplicate = await this.userService.findOneByEmail(userEmail);
            if (userDuplicate) {
                return res.send("<h1>User with this email has been already registered</h1>");
            }

            const userActivationHash = await generateHash(128);
            const userActivationExpirationDate = generateExpirationDate(1);

            const hashedPassword = await argonHash(userPassword);
            const createdUser = await this.userService.create({
                name: userName,
                email: userEmail,
                password: hashedPassword,
                hash: userActivationHash,
                timestamp: userActivationExpirationDate,
                companyUUID: createdCompany.uuid,
                userTypeUUID: "b8c2301c-ac75-4aa5-86ba-0d70956a59ea",
            });

            const userMsg = {
                to: createdUser.email,
                subject: "Confirm your registration.",
                text: `We are happy to see you on stocktaking-app!
                However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
                http://localhost:3000/auth/registration-verification?hash=${userActivationHash}&type=user`,
                html: `<h1>We are happy to see you on stocktaking-app!</h1>
                <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
                <a href='http://localhost:3000/auth/registration-verification?hash=${userActivationHash}&type=user'>Confirm your registration!</a>`,
            };
            await this.mailer.sendMail(userMsg);

            return res.send("<h1>Your company has been registered and user created.</h1>");
        } catch (err) {
            return next(err);
        }
    }

    getRegistrationVerification = async (req, res, next) => {
        const { hash, type } = req.query;
        if (!hash || !type) {
            return res.send("<h1>Query parametrs not specified.</h1>");
        }

        try {
            const service = type === "company" ? this.companyService : this.userService;
            const foundRow = await service.findOneByActivationHash(hash);
            if (!foundRow) {
                return res.send(`<h1>${type} not found.</h1>`);
            }
            if (dayjs().isAfter(dayjs(foundRow.activation_expiration_date))) {
                return res.send("<h1>Activation expired.</h1>");
            }
            foundRow.active = true;
            foundRow.activation_hash = null;
            foundRow.activation_expiration_date = null;
            await foundRow.save();
            return res.send(`<h1>${type} has been activated.`);
        } catch (err) {
            return next(err);
        }
    }
}

export default new AuthController(companyService, userService, mailer);
