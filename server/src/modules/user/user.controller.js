export default class UserController {
    constructor({ userService, actionMessages }) {
        this.userService = userService;
        this.actionMessages = actionMessages;
    }

    getSelfUser = async (req, res, next) => {
        const { userUUID } = req.session;

        try {
            const foundUser = await this.userService.getUserToEdit({ userUUID });

            return res.render("user/me", {
                title: foundUser.name,
                csrf: req.csrfToken(),
                inputs: foundUser,
                errors: req.flash("errors")[0],
                messages: req.flash("messages"),
            });
        } catch (err) {
            return next(err);
        }
    }

    postEditUserName = async (req, res, next) => {
        const { userUUID } = req.session;
        const { name } = req.body;

        try {
            const editedUser = await this.userService.editUserName({ userUUID, name });

            req.session.userName = editedUser.name;
            res.locals.userData.userName = editedUser.name;

            req.flash("messages", this.actionMessages.convertMessages("us01"));
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }

    postEditUserEmail = async (req, res, next) => {
        const { userUUID } = req.session;
        const { email } = req.body;

        try {
            await this.userService.editUserEmail({ userUUID, email });

            req.flash("messages", this.actionMessages.convertMessages("us02"));
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }

    postEditUserPassword = async (req, res, next) => {
        const { userUUID } = req.session;
        const { password, repeatPassword } = req.body;
        if (password !== repeatPassword) {
            req.flash("messages", this.actionMessages.convertMessages("ae06"));
            return res.redirect("/dashboard/users/me");
        }

        try {
            await this.userService.editUserPassword({ userUUID, password });

            req.flash("messages", this.actionMessages.convertMessages("us03"));
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }
}
