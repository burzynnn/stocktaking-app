import argon2 from "argon2";
import dayjs from "dayjs";

export default class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    getSelfUser = async (req, res, next) => {
        const { userUUID } = req.session;
        try {
            const foundUser = await this.userService.findOneByUUID(userUUID, ["name", "email", "createdAt", "company_uuid"]);
            if (!foundUser) {
                return res.send("No user found.");
            }

            const {
                name,
                email,
                createdAt,
                user_has_user_type: { type },
                company: { name: companyName },
            } = foundUser;

            const accountCreationDate = dayjs(createdAt).format("HH:mm DD-MM-YYYY");

            return res.render("user/me", {
                title: name,
                csrf: req.csrfToken(),
                inputs: {
                    name,
                    email,
                    accountCreationDate,
                    type,
                    companyName,
                },
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
            const foundUser = await this.userService.findOneByUUID(userUUID, ["uuid", "name"]);

            if (foundUser.name === name) {
                req.flash("messages", [{ type: "Information", text: "We accepted your request to change your user name but it doesn't differ from actual one." }]);
                return res.redirect("/dashboard/users/me");
            }
            foundUser.name = name;
            await foundUser.save();
            req.session.userName = name;
            res.locals.userData.userName = name;

            req.flash("messages", [{ type: "Success", text: "User name changed." }]);
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }

    postEditUserEmail = async (req, res, next) => {
        const { userUUID } = req.session;
        const { email } = req.body;
        try {
            const foundUser = await this.userService.findOneByUUID(userUUID, ["uuid", "email"]);

            if (foundUser.email === email) {
                req.flash("messages", [{ type: "Information", text: "We accepted your request to change your user email but it doesn't differ from actual one." }]);
                return res.redirect("/dashboard/users/me");
            }
            foundUser.email = email;
            await foundUser.save();

            req.flash("messages", [{ type: "Success", text: "User email changed." }]);
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }

    postEditUserPassword = async (req, res, next) => {
        const { userUUID } = req.session;
        const { password, repeatPassword } = req.body;
        if (password !== repeatPassword) {
            req.flash("messages", [{ type: "Error", text: "Passwords aren't the same." }]);
            return res.redirect("/dashboard/users/me");
        }

        try {
            const foundUser = await this.userService.findOneByUUID(userUUID, ["uuid", "password"]);

            const newPassword = await argon2.hash(password);
            foundUser.password = newPassword;
            await foundUser.save();

            req.flash("messages", [{ type: "Success", text: "User password changed." }]);
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }
}
