export default class AuthController {
    constructor({
        authService,
        mailService,
        userService,
        companyService,
    }) {
        this.authService = authService;
        this.userService = userService;
        this.companyService = companyService;
        this.mailService = mailService;
    }

    getLogIn = (req, res) => res.render("auth/login", {
        title: "Log in!",
        csrf: req.csrfToken(),
        errors: req.flash("errors")[0],
        inputs: req.flash("inputs")[0],
        messages: req.flash("messages"),
    });

    postLogIn = async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const loggedInUserData = await this.authService.logIn({ email, password });
            Object.assign(req.session, loggedInUserData);
            return res.redirect("/dashboard");
        } catch (err) {
            return next(err);
        }
    }

    getRegister = (req, res) => res.render("auth/register", {
        title: "Register",
        csrf: req.csrfToken(),
        errors: req.flash("errors")[0],
        inputs: req.flash("inputs")[0],
        messages: req.flash("messages"),
    });

    postRegister = async (req, res, next) => {
        const {
            companyName, companyEmail, userName, userEmail, userPassword,
        } = req.body;
        try {
            const registeredCompany = await this.companyService.create({
                name: companyName,
                email: companyEmail,
            });
            const registeredOwner = await this.userService.create({
                name: userName,
                email: userEmail,
                password: userPassword,
                companyUUID: registeredCompany.uuid,
                userTypeUUID: "b8c2301c-ac75-4aa5-86ba-0d70956a59ea",
            });

            await this.mailService.companyRegister({
                receiver: registeredCompany.official_email,
                activationHash: registeredCompany.activation_hash,
            });
            await this.mailService.userRegister({
                receiver: registeredOwner.email,
                activationHash: registeredOwner.activation_hash,
            });

            req.flash("messages", [{ type: "Success", text: "Account created. Head to both company and user email, verify your credentials and log in!" }]);
            return res.redirect("/auth/login");
        } catch (err) {
            return next(err);
        }
    }

    getLogOut = (req, res, next) => {
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
            if (type === "company") {
                await this.authService.companyVerifyRegistration({ activationHash: hash });

                req.flash("messages", [{ type: "Success", text: "Company account activated." }, { type: "Information", text: "If you have activated user account, then you can login using it's credentials." }]);
            } else if (type === "user") {
                await this.authService.userVerifyRegistration({ activationHash: hash });

                req.flash("messages", [{ type: "Success", text: "User account activated." }, { type: "Information", text: "You can login below." }]);
            }

            return res.redirect("/auth/login");
        } catch (err) {
            return next(err);
        }
    }

    getForgotPassword = async (req, res) => res.render("auth/forgot-password", {
        title: "Forgot password",
        csrf: req.csrfToken(),
        errors: req.flash("errors")[0],
        inputs: req.flash("inputs")[0],
        messages: req.flash("messages"),
    });

    postForgotPassword = async (req, res, next) => {
        const { email } = req.body;

        try {
            const userPreparedToPasswordReset = await this.authService
                .userInitiatePasswordReset({ email });
            await this.mailService.passwordForgot({
                receiver: userPreparedToPasswordReset.email,
                passwordResetHash: userPreparedToPasswordReset.password_reset_hash,
            });

            req.flash("messages", [{ type: "Warning", text: "Due to security reasons we can not confirm that provided email was correct." }, { type: "Information", text: "Head to your email account and check if reset password email arrived. If not you probably used wrong email address." }]);
            return res.redirect("/auth/forgot-password");
        } catch (err) {
            return next(err);
        }
    }

    getResetPassword = (req, res) => res.render("auth/reset-password", {
        title: "Reset password",
        csrf: req.csrfToken(),
        errors: req.flash("errors")[0],
        inputs: req.flash("inputs")[0],
        messages: req.flash("messages"),
    });

    postResetPassword = async (req, res, next) => {
        const { hash } = req.query;
        const { newPassword } = req.body;

        try {
            await this.authService.userResetPassword({
                hash,
                password: newPassword,
            });

            req.flash("messages", [{ type: "Success", text: "Password changed successfully. You can login now using new password." }]);
            return res.redirect("/auth/login");
        } catch (err) {
            return next(err);
        }
    }
}
