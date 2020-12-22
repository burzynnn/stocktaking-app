import { Router } from "express";

import AuthController from "./auth.controller";
import AuthValidator from "./auth.validator";
import AuthService from "./auth.service";
import CompanyService from "../company/company.service";
import companyModel from "../company/company.model";
import UserService from "../user/user.service";
import userModel from "../user/user.model";
import MailService from "../mail/mail.service";
import mailSender from "../../loaders/sendgrid.loader";

const router = Router();
const authController = new AuthController({
    authService: new AuthService({ userModel, companyModel }),
    companyService: new CompanyService(companyModel),
    userService: new UserService(userModel),
    mailService: new MailService(mailSender),
});
const authValidator = new AuthValidator();

router.route("/login")
    .get(authController.getLogIn)
    .post(
        authValidator.returnValidator("postLogin"),
        authController.postLogIn,
    );

router.route("/register")
    .get(authController.getRegister)
    .post(
        authValidator.returnValidator("postRegister"),
        authController.postRegister,
    );

router.get("/logout", authController.getLogOut);

router.get("/registration-verification",
    authValidator.returnValidator("getRegistrationVerification"),
    authController.getRegistrationVerification);

router.route("/forgot-password")
    .get(authController.getForgotPassword)
    .post(
        authValidator.returnValidator("postForgotPassword"),
        authController.postForgotPassword,
    );

router.route("/reset-password")
    .get(authController.getResetPassword)
    .post(
        authValidator.returnValidator("postResetPassword"),
        authController.postResetPassword,
    );

export default router;
