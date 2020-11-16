import { Router } from "express";

import AuthMiddleware from "../auth/auth.middleware";

const router = Router();

router.get("/", (req, res) => res.render("index/home", { title: "Stocktaking app" }));

router.get("/dashboard", AuthMiddleware.authenticate, (req, res) => res.render("index/dashboard", { title: "Dashboard" }));

export default router;
