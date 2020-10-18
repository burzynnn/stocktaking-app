import { Router } from "express";
import authController from "./auth.controller";

const router = Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/logout", authController.getLogout);

router.get("/registration-verification", authController.getRegistrationVerification);

router.get("/forgot-password", authController.getForgotPassword);
router.post("/forgot-password", authController.postForgotPassword);

router.get("/reset-password", authController.getResetPassword);
router.post("/reset-password", authController.postResetPassword);

export default router;
