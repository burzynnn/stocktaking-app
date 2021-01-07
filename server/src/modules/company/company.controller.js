export default class CompanyController {
    constructor({ companyService, actionMessages }) {
        this.companyService = companyService;
        this.actionMessages = actionMessages;
    }

    getEditOwnCompany = async (req, res, next) => {
        const { userCompanyUUID: companyUUID } = req.session;

        try {
            const foundCompanyInfo = await this.companyService.getCompanyToEdit({ companyUUID });

            return res.render("company/edit", {
                title: "Edit company",
                csrf: req.csrfToken(),
                inputs: foundCompanyInfo,
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
            await this.companyService.editCompanyName({ companyUUID, name });

            req.flash("messages", this.actionMessages.convertMessages("cs01"));
            return res.redirect("/dashboard/company/edit");
        } catch (err) {
            return next(err);
        }
    }

    postEditCompanyEmail = async (req, res, next) => {
        const { userCompanyUUID: companyUUID } = req.session;
        const { email } = req.body;

        try {
            await this.companyService.editCompanyEmail({ companyUUID, email });

            req.flash("messages", this.actionMessages.convertMessages("cs02"));
            return res.redirect("/dashboard/company/edit");
        } catch (err) {
            return next(err);
        }
    }
}
