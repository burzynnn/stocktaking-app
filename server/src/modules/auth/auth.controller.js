export default class AuthController {
    constructor({
        authService,
        mailService,
        userService,
        companyService,
        actionMessages,
    }) {
        this.authService = authService;
        this.userService = userService;
        this.companyService = companyService;
        this.mailService = mailService;
        this.actionMessages = actionMessages;
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

            req.flash("messages", this.actionMessages.convertMessages("as01", "ai01"));
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

            req.flash("messages", this.actionMessages.convertMessages("ai02"));
            return res.clearCookie("stocktaking.sid").redirect("/auth/login");
        });
    }

    getRegistrationVerification = async (req, res, next) => {
        const { hash, type } = req.query;
        try {
            if (type === "company") {
                await this.authService.companyVerifyRegistration({ activationHash: hash });

                req.flash("messages", this.actionMessages.convertMessages("cs03", "ai03"));
            } else if (type === "user") {
                await this.authService.userVerifyRegistration({ activationHash: hash });

                req.flash("messages", this.actionMessages.convertMessages("us04", "ai04"));
            } else {
                req.flash("messages", this.actionMessages.convertMessages("ae08"));
            }

            return res.redirect("/auth/login");
        } catch (err) {
            return next(err);
        }
    }

    getForgotPassword = (req, res) => res.render("auth/forgot-password", {
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

            req.flash("messages", this.actionMessages.convertMessages("aw01", "ai05"));
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

            req.flash("messages", this.actionMessages.convertMessages("as02", "ai06"));
            return res.redirect("/auth/login");
        } catch (err) {
            return next(err);
        }
    }
}
