import { Router } from "express";

import authController from "./auth.controller";

const router = Router();

router.route("/login")
    .get(authController.getLogin)
    .post(authController.postLogin);

router.route("/register")
    .get(authController.getRegister)
    .post(authController.postRegister);

router.get("/logout", authController.getLogout);

router.get("/registration-verification", authController.getRegistrationVerification);

router.route("/forgot-password")
    .get(authController.getForgotPassword)
    .post(authController.postForgotPassword);

router.route("/reset-password")
    .get(authController.getResetPassword)
    .post(authController.postResetPassword);

export default router;
