import { Router } from "express";
import AuthController from "./auth.controller";

const router = Router();

router.get("/login", AuthController.getLogin);
router.post("/login", AuthController.postLogin);

router.get("/register", AuthController.getRegister);
router.post("/register", AuthController.postRegister);

router.get("/registration-verification", AuthController.getRegistrationVerification);

export default router;
