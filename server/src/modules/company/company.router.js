import { Router } from "express";

import CompanyController from "./company.controller";
import CompanyService from "./company.service";
import companyModel from "./company.model";
import authMiddleware from "../auth/auth.middleware";
import CompanyValidator from "./company.validator";
import ActionMessages from "../../config/actionMessages.config";

const router = Router();
const companyController = new CompanyController({
    companyService: new CompanyService({ companyModel }),
    actionMessages: new ActionMessages(),
});
const companyValidator = new CompanyValidator();

router.route("/edit")
    .get(
        authMiddleware.authenticate,
        authMiddleware.isOwner,
        companyController.getEditOwnCompany,
    );

router.route("/edit-name")
    .post(
        companyValidator.returnValidator("postEditCompanyName"),
        authMiddleware.authenticate,
        authMiddleware.isOwner,
        authMiddleware.ensureCredibility,
        companyController.postEditCompanyName,
    );

router.route("/edit-email")
    .post(
        companyValidator.returnValidator("postEditCompanyEmail"),
        authMiddleware.authenticate,
        authMiddleware.isOwner,
        companyController.postEditCompanyEmail,
    );

export default router;
