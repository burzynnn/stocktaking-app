import { CronJob } from "cron";

import UserService from "../user/user.service";
import CompanyVerificationService from "../company_verification/company_verification.service";
import UserVerificationService from "../user_verification/user_verification.service";
import { companyVerificationModel, userVerificationModel, userModel } from "../../loaders/postgres.loader";
import logger from "../../utils/logger.util";

const companyVerificationService = new CompanyVerificationService({ companyVerificationModel });
const userVerificationService = new UserVerificationService({ userVerificationModel });
const userService = new UserService({ userModel });

/* eslint-disable no-await-in-loop */
const removeNotActivatedAccounts = new CronJob("0 0 * * * *", async () => {
    logger.info("Deleting expired accounts.", { label: "auth-cron" });

    // firstly, find all companies with expired activations, delete them and their owners
    const expiredCompaniesActivations = await companyVerificationService
        .findAllExpiredActivations();
    for (let i = 0; i < expiredCompaniesActivations.length; i += 1) {
        const activation = expiredCompaniesActivations[i];
        const notActivatedCompany = await activation.getCompany();
        const companyOwner = await userService
            .findOwnerOfCompany({ companyUUID: notActivatedCompany.uuid });
        const ownerActivation = await userVerificationService.findActivationByUserUUID({
            userUUID: companyOwner.uuid,
        });

        await activation.destroy();
        await notActivatedCompany.destroy();
        await companyOwner.destroy();
        await ownerActivation.destroy();
    }

    // secondly, find all owners with expired activations and delete them and their companies
    const expiredOwnersActivations = await userVerificationService
        .findAllOwnersExpiredActivations();
    for (let i = 0; i < expiredOwnersActivations.length; i += 1) {
        const activation = expiredOwnersActivations[i];
        const notActivatedOwner = activation.user;
        const ownerCompany = await notActivatedOwner.getCompany();
        const companyActivation = await companyVerificationService.findActivationByCompanyUUID({
            companyUUID: ownerCompany.uuid,
        });

        await activation.destroy();
        await notActivatedOwner.destroy();
        await ownerCompany.destroy();
        await companyActivation.destroy();
    }
}, null);
/* eslint-enable no-await-in-loop */

export default removeNotActivatedAccounts;
