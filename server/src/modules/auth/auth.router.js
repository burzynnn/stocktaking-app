import { Router } from "express";
import AuthController from "./auth.controller";

const router = Router();

router.get("/login", (req, res) => res.render("modules/auth/login", { title: "Log in!" }));
router.post("/login", AuthController.postLogin);

router.get("/register", (req, res) => res.render("modules/auth/register", { title: "Register" }));
router.post("/register", AuthController.postRegister);

export default router;
