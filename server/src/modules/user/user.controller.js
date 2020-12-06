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

    postEditSelfUser = async (req, res, next) => {
        const { userUUID } = req.session;
        const { name: newName, email: newEmail, password: newPassword } = req.body;
        try {
            const foundUser = await this.userService.findOneByUUID(userUUID, ["uuid", "name", "email", "password", "createdAt", "company_uuid"]);

            let hasChanged = false;
            if (newName !== foundUser.name) {
                foundUser.name = newName;
                hasChanged = true;
                req.session.userName = newName;
                res.locals.userData.userName = newName;
            }
            if (newEmail !== foundUser.email) {
                foundUser.email = newEmail;
                hasChanged = true;
            }
            if (newPassword !== "") {
                if (!await argon2.verify(foundUser.password, newPassword)) {
                    const hashedPassword = await argon2.hash(newPassword);
                    foundUser.password = hashedPassword;
                    hasChanged = true;
                }
            }
            if (hasChanged) {
                await foundUser.save();
            }

            req.flash("messages", [{ type: "Success", text: "Updated your profile." }]);
            return res.redirect("/dashboard/users/me");
        } catch (err) {
            return next(err);
        }
    }
}
