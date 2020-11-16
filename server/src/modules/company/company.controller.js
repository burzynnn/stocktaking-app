export default class CompanyController {
    constructor(companyService) {
        this.companyService = companyService;
    }

    getEditOwnCompany = async (req, res, next) => {
        const { userCompanyUUID: companyUUID } = req.session;
        try {
            const foundCompany = await this.companyService.findOneByUUID(companyUUID, ["uuid", "name", "official_email"]);
            if (!foundCompany) {
                return res.send("No company found.");
            }

            const { name, official_email: email } = foundCompany;

            return res.render("company/edit", { title: "Edit company", csrf: req.csrfToken(), inputs: { name, email } });
        } catch (err) {
            return next(err);
        }
    };
}
