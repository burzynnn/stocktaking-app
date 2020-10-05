import { Router } from "express";

const router = Router();

router.get("/", (req, res) => res.render("modules/index/home", { title: "Stocktaking app" }));

export default router;
