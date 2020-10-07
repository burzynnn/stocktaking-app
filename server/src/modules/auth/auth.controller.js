import { hash } from "argon2";

import CompanyService from "../company/company.service";
import CompanyModel from "../company/company.model";
import UserService from "../user/user.service";
import UserModel from "../user/user.model";
import sgMail from "../../loaders/sendgrid.loader";

class AuthController {
    constructor(CS, CM, US, UM, MS) {
        this.companyService = new CS(CM);
        this.userService = new US(UM);
        this.mailService = MS;
    }

    getLogin = (req, res) => res.render("modules/auth/login", { title: "Log in!" });

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

            const companyDuplicate = await this.companyService.findOneByEmail(companyEmail);
            if (companyDuplicate) {
                return res.send("<h1>Company with this email has been already registered.");
            }

            const createdCompany = await this.companyService.create(companyName, companyEmail);

            const userDuplicate = await this.userService.findOneByEmail(userEmail);
            if (userDuplicate) {
                return res.send("<h1>User with this email has been already registered</h1>");
            }

            const hashedPassword = await hash(userPassword);
            await this.userService.create(userName, userEmail, hashedPassword, createdCompany.uuid, "b8c2301c-ac75-4aa5-86ba-0d70956a59ea");

            return res.send("<h1>Your company has been registered and user created.</h1>");
        } catch (err) {
            return next(err);
        }
    }
}

export default new AuthController(CompanyService, CompanyModel, UserService, UserModel, sgMail);
