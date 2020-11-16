import { Router } from "express";

import CompanyController from "./company.controller";
import CompanyService from "./company.service";
import companyModel from "./company.model";
import AuthMiddleware from "../auth/auth.middleware";

const router = Router();
const companyController = new CompanyController(new CompanyService(companyModel));

router.get("/edit", AuthMiddleware.authenticate, AuthMiddleware.isOwner, companyController.getEditOwnCompany);

export default router;
