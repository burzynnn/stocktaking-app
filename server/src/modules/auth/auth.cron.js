import { CronJob } from "cron";

import companyService from "../company/company.service";
import userService from "../user/user.service";
import logger from "../../utils/logger.util";

const removeNotActivatedAccounts = new CronJob("0 3 * * * *", async () => {
    logger.info("Clearing not activated accounts.", { label: "auth_cron" });

    // first find all expired companies and delete it and its owner
    const allExpiredCompanies = await companyService.findAllExpired();
    allExpiredCompanies.forEach(async (company) => {
        const companyOwner = await userService.findOwnerByCompanyUUID(company.uuid);
        await companyOwner.destroy();
        await company.destroy();
    });

    // second find all expired owners and delete it and its company
    const allExpiredOwners = await userService.findAllExpiredOwners();
    allExpiredOwners.forEach(async (owner) => {
        const companyOfExpiredOwner = await owner.getCompany();
        await companyOfExpiredOwner.destroy();
        await owner.destroy();
    });
}, null, true);

export default removeNotActivatedAccounts;
