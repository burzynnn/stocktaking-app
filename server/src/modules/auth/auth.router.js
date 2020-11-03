import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import AuthController from "./auth.controller";
import AuthValidator from "./auth.validator";
import CompanyService from "../company/company.service";
import companyModel from "../company/company.model";
import UserService from "../user/user.service";
import userModel from "../user/user.model";
import mailingUtil from "../../loaders/sendgrid.loader";

const router = Router();
const authController = new AuthController(
    new CompanyService(companyModel),
    new UserService(userModel),
    mailingUtil,
);

router.route("/login")
    .get(authController.getLogin)
    .post(
        celebrate({ [Segments.BODY]: AuthValidator.postLogin.body }),
        authController.postLogin,
    );

router.route("/register")
    .get(authController.getRegister)
    .post(
        celebrate({ [Segments.BODY]: AuthValidator.postRegister.body }),
        authController.postRegister,
    );

router.get("/logout", authController.getLogout);

router.get("/registration-verification",
    celebrate({ [Segments.QUERY]: AuthValidator.getRegistrationVerification.query }),
    authController.getRegistrationVerification);

router.route("/forgot-password")
    .get(authController.getForgotPassword)
    .post(
        celebrate({ [Segments.BODY]: AuthValidator.postForgotPassword.body }),
        authController.postForgotPassword,
    );

router.route("/reset-password")
    .get(authController.getResetPassword)
    .post(
        celebrate({
            [Segments.QUERY]: AuthValidator.postResetPassword.query,
            [Segments.BODY]: AuthValidator.postResetPassword.body,
        }),
        authController.postResetPassword,
    );

export default router;
