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
    );

router.route("/me/edit-name")
    .post(
        userValidator.returnValidator("postEditUserName"),
        AuthMiddleware.authenticate,
        userController.postEditUserName,
    );

router.route("/me/edit-email")
    .post(
        userValidator.returnValidator("postEditUserEmail"),
        AuthMiddleware.authenticate,
        userController.postEditUserEmail,
    );

router.route("/me/edit-password")
    .post(
        userValidator.returnValidator("postEditUserPassword"),
        AuthMiddleware.authenticate,
        userController.postEditUserPassword,
    );

export default router;
