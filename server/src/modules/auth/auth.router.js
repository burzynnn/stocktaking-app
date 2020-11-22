import { Router } from "express";

import AuthController from "./auth.controller";
import AuthValidator from "./auth.validator";
import CompanyService from "../company/company.service";
import companyModel from "../company/company.model";
import UserService from "../user/user.service";
import userModel from "../user/user.model";
import UserTypeService from "../user_type/user_type.service";
import userTypeModel from "../user_type/user_type.model";
import mailingUtil from "../../loaders/sendgrid.loader";

const router = Router();
const authController = new AuthController(
    new CompanyService(companyModel),
    new UserService(userModel),
    new UserTypeService(userTypeModel),
    mailingUtil,
);
const authValidator = new AuthValidator();

router.route("/login")
    .get(authController.getLogin)
    .post(
        authValidator.returnValidator("postLogin"),
        authController.postLogin,
    );

router.route("/register")
    .get(authController.getRegister)
    .post(
        authValidator.returnValidator("postRegister"),
        authController.postRegister,
    );

router.get("/logout", authController.getLogout);

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
