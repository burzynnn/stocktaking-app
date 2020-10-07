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
}

export default new AuthController(CompanyService, CompanyModel, UserService, UserModel, sgMail);
