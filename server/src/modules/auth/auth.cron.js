import { CronJob } from "cron";

import CompanyService from "../company/company.service";
import companyModel from "../company/company.model";
import UserService from "../user/user.service";
import userModel from "../user/user.model";
import logger from "../../utils/logger.util";

const companyService = new CompanyService(companyModel);
const userService = new UserService(userModel);

const removeNotActivatedAccounts = new CronJob("0 0 * * * *", async () => {
    logger.info("Clearing not activated accounts.", { label: "auth_cron" });

    // first find all expired companies and delete it and its owner
    const allExpiredCompanies = await companyService.findAllExpired(["uuid"]);
    allExpiredCompanies.forEach(async (company) => {
        const companyOwner = await userService.findOwnerByCompanyUUID(company.uuid);
        await companyOwner.destroy();
        await company.destroy();
    });

    // second find all expired owners and delete it and its company
    const allExpiredOwners = await userService.findAllExpiredOwners(["uuid"]);
    allExpiredOwners.forEach(async (owner) => {
        const companyOfExpiredOwner = await owner.getCompany();
        await companyOfExpiredOwner.destroy();
        await owner.destroy();
    });
}, null, true);

export default removeNotActivatedAccounts;
