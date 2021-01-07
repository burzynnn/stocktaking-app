import faker from "faker";

import CompanyController from "./company.controller";
import ActionMessages from "../../config/actionMessages.config";

import expressMock from "../../../tests/utils/mock";

export default () => {
    const csrfToken = faker.random.hexaDecimal(128);

    describe("getEditOwnCompany", () => {
        it("should render", async () => {
            const companyData = {
                uuid: faker.random.uuid(),
                name: faker.company.companyName(),
                official_email: faker.internet.email(),
            };

            const companyController = new CompanyController({
                companyService: {
                    getCompanyToEdit: jest.fn().mockReturnValue(companyData),
                },
            });

            const req = expressMock.mockRequest();
            req.session = {
                userCompanyUUID: companyData.uuid,
            };
            req.csrfToken = () => csrfToken;
            req.flash = (type) => (type === "errors" ? [[]] : []);
            const res = expressMock.mockResponse();

            await companyController.getEditOwnCompany(req, res);

            expect(companyController.companyService.getCompanyToEdit).toHaveBeenCalledTimes(1);
            expect(companyController.companyService.getCompanyToEdit).toHaveBeenCalledWith({
                companyUUID: companyData.uuid,
            });
            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("company/edit", {
                title: "Edit company",
                csrf: csrfToken,
                inputs: companyData,
                errors: [],
                messages: [],
            });
        });
    });

    describe("postEditCompanyName", () => {
        it("should edit company name, then redirect", async () => {
            const companyData = {
                uuid: faker.random.uuid(),
                name: faker.company.companyName(),
            };

            const companyController = new CompanyController({
                companyService: {
                    editCompanyName: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.session = {
                userCompanyUUID: companyData.uuid,
            };
            req.body = {
                name: companyData.name,
            };
            const res = expressMock.mockResponse();

            await companyController.postEditCompanyName(req, res);

            expect(companyController.companyService.editCompanyName).toHaveBeenCalledTimes(1);
            expect(companyController.companyService.editCompanyName).toHaveBeenCalledWith({
                companyUUID: companyData.uuid,
                name: companyData.name,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "Company name changed." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard/company/edit");
        });
    });

    describe("postEditCompanyEmail", () => {
        it("should edit company email, then redirect", async () => {
            const companyData = {
                uuid: faker.random.uuid(),
                email: faker.internet.email(),
            };

            const companyController = new CompanyController({
                companyService: {
                    editCompanyEmail: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.session = {
                userCompanyUUID: companyData.uuid,
            };
            req.body = {
                email: companyData.email,
            };
            const res = expressMock.mockResponse();

            await companyController.postEditCompanyEmail(req, res);

            expect(companyController.companyService.editCompanyEmail).toHaveBeenCalledTimes(1);
            expect(companyController.companyService.editCompanyEmail).toHaveBeenCalledWith({
                companyUUID: companyData.uuid,
                email: companyData.email,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "Company email changed." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard/company/edit");
        });
    });
};
