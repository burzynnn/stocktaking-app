import { Router } from "express";

import CompanyController from "./company.controller";
import CompanyService from "./company.service";
import companyModel from "./company.model";
import AuthMiddleware from "../auth/auth.middleware";
import CompanyValidator from "./company.validator";

const router = Router();
const companyController = new CompanyController(new CompanyService(companyModel));
const companyValidator = new CompanyValidator();

router.route("/edit")
    .get(
        AuthMiddleware.authenticate,
        AuthMiddleware.isOwner,
        companyController.getEditOwnCompany,
    )
    .post(
        companyValidator.returnValidator("postEditOwnCompany"),
        AuthMiddleware.authenticate,
        AuthMiddleware.isOwner,
        companyController.postEditOwnCompany,
    );

export default router;
