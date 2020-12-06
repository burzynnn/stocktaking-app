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

            return res.render("company/edit", {
                title: "Edit company",
                csrf: req.csrfToken(),
                inputs: { name, email },
                errors: req.flash("errors")[0],
                messages: req.flash("messages"),
            });
        } catch (err) {
            return next(err);
        }
    };

    postEditOwnCompany = async (req, res, next) => {
        const { userCompanyUUID: companyUUID } = req.session;
        const { name, email } = req.body;
        try {
            const foundCompany = await this.companyService.findOneByUUID(companyUUID, ["uuid", "name", "official_email"]);

            let hasChanged = false;
            if (name !== foundCompany.name) {
                foundCompany.name = name;
                hasChanged = true;
            }
            if (email !== foundCompany.official_email) {
                foundCompany.official_email = email;
                hasChanged = true;
            }
            if (hasChanged) {
                await foundCompany.save();
            }

            req.flash("messages", [{ type: "Success", text: "Company information updated." }]);
            return res.redirect("/dashboard/company/edit");
        } catch (err) {
            return next(err);
        }
    }
}
