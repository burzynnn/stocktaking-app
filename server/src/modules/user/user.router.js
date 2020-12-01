import { Router } from "express";

import UserController from "./user.controller";
import UserService from "./user.service";
import userModel from "./user.model";
import UserValidator from "./user.validator";
import AuthMiddleware from "../auth/auth.middleware";

const router = Router();
const userController = new UserController(new UserService(userModel));
const userValidator = new UserValidator();

router.route("/me")
    .get(
        AuthMiddleware.authenticate,
        userController.getSelfUser,
    )
    .post(
        userValidator.returnValidator("postEditSelfUser"),
        AuthMiddleware.authenticate,
        userController.postEditSelfUser,
    );

export default router;
