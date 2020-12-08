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

    postEditCompanyName = async (req, res, next) => {
        const { userCompanyUUID: companyUUID } = req.session;
        const { name } = req.body;
        try {
            const foundCompany = await this.companyService.findOneByUUID(companyUUID, ["uuid", "name"]);

            if (foundCompany.name === name) {
                req.flash("messages", [{ type: "Information", text: "We accepted your request to change company name but it doesn't differ from actual one." }]);
                return res.redirect("/dashboard/company/edit");
            }
            foundCompany.name = name;
            await foundCompany.save();

            req.flash("messages", [{ type: "Success", text: "Company name changed." }]);
            return res.redirect("/dashboard/company/edit");
        } catch (err) {
            return next(err);
        }
    }

    // TODO: changing email requires confirmation from old and new email address
    postEditCompanyEmail = async (req, res, next) => {
        const { userCompanyUUID: companyUUID } = req.session;
        const { email } = req.body;
        try {
            const foundCompany = await this.companyService.findOneByUUID(companyUUID, ["uuid", "official_email"]);

            if (foundCompany.official_email === email) {
                req.flash("messages", [{ type: "Information", text: "We accepted your request to change company email but it doesn't differ from actual one." }]);
                return res.redirect("/dashboard/company/edit");
            }
            foundCompany.official_email = email;
            await foundCompany.save();

            req.flash("messages", [{ type: "Success", text: "Company email changed." }]);
            return res.redirect("/dashboard/company/edit");
        } catch (err) {
            return next(err);
        }
    }
}
