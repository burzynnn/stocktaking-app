import argon2 from "argon2";
import dayjs from "dayjs";

import generateHash from "../../utils/generateHash";
import generateExpirationDate from "../../utils/generateExpirationDate";

class AuthController {
    constructor(companyService, userService, mailingUtil) {
        this.companyService = companyService;
        this.userService = userService;
        this.mailer = mailingUtil;
    }

    getLogin = (req, res) => res.render("auth/login", {
        title: "Log in!",
        csrf: req.csrfToken(),
        errors: req.flash("errors"),
        inputs: req.flash("inputs")[0],
    });

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
            if (!await argon2.verify(foundUser.password, password)) {
                return res.send("<h1>Wrong password.</h1>");
            }

            req.session.loggedIn = true;
            req.session.uuid = foundUser.uuid;
            req.session.user_type_uuid = foundUser.user_type_uuid;

            return res.redirect("/");
        } catch (err) {
            return next(err);
        }
    }

    getRegister = (req, res) => res.render("auth/register", { title: "Register", csrf: req.csrfToken() });

    postRegister = async (req, res, next) => {
        const {
            companyName, companyEmail, userName, userEmail, userPassword,
        } = req.body;

        try {
            // TODO: one error should revert all inserts !!!
            // TODO: swap res.send with res.render

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

            const hashedPassword = await argon2.hash(userPassword);
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

    getLogout = (req, res, next) => {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            return res.clearCookie("stocktaking.sid").redirect("/");
        });
    }

    getRegistrationVerification = async (req, res, next) => {
        const { hash, type } = req.query;

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

    getForgotPassword = async (req, res) => res.render("auth/forgot-password", { title: "Forgot password", csrf: req.csrfToken() });

    /* eslint-disable consistent-return */
    postForgotPassword = async (req, res, next) => {
        const { email } = req.body;

        res.send("<h1>Head to your email account and check if message arrived.</h1>");

        try {
            const foundUser = await this.userService.findOneByEmail(email);
            if (foundUser) {
                const passwordResetHash = await generateHash(128);
                const passwordResetExpirationDate = generateExpirationDate(1);

                foundUser.password_reset_hash = passwordResetHash;
                foundUser.password_reset_expiration_date = passwordResetExpirationDate;
                const savedUser = await foundUser.save();

                const userMsg = {
                    to: savedUser.email,
                    subject: "Reset password.",
                    text: `You have received this email because of your password reset request.
                    If this was not done by you you can ignore this message.
                    Otherwise click link below.
                    http://localhost:3000/auth/reset-password?hash=${savedUser.password_reset_hash}`,
                    html: `<h1>You have received this email because of your password reset request.</h1>
                    <p>If this was not done by you you can ignore this message.
                    Otherwise click link below.<p>
                    <a href='http://localhost:3000/auth/reset-password?hash=${savedUser.password_reset_hash}'>Reset my password!</a>`,
                };
                return await this.mailer.sendMail(userMsg);
            }
        } catch (err) {
            return next(err);
        }
    }

    getResetPassword = (req, res) => res.render("auth/reset-password", { title: "Reset password", csrf: req.csrfToken() });

    postResetPassword = async (req, res, next) => {
        const { hash } = req.query;
        const { newPassword } = req.body;

        try {
            const foundUser = await this.userService.findOneByPasswordResetHash(hash);
            if (!foundUser) {
                return res.send("<h1>No user found by provided hash.</h1>");
            }
            if (dayjs().isAfter(dayjs(foundUser.password_reset_expiration_date))) {
                return res.send("<h1>Activation expired.</h1>");
            }

            const hashedPassword = await argon2.hash(newPassword);
            foundUser.password = hashedPassword;
            foundUser.password_reset_hash = null;
            foundUser.password_reset_date = null;
            await foundUser.save();

            return res.send("<h1>Password changed successfully.</h1>");
        } catch (err) {
            return next(err);
        }
    }
}

export default AuthController;
