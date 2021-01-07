import faker from "faker";

import * as hashGenerator from "../../utils/generateHash";
import * as expirationDateGenerator from "../../utils/generateExpirationDate";

import CompanyService from "./company.service";

export default () => {
    const hash = faker.random.hexaDecimal(128);
    let hashGeneratorSpy;
    const date = new Date();
    let expirationDateGeneratorSpy;

    beforeAll(() => {
        hashGeneratorSpy = jest.spyOn(hashGenerator, "default").mockReturnValue(hash);
        expirationDateGeneratorSpy = jest.spyOn(expirationDateGenerator, "default").mockReturnValue(date);
    });

    afterEach(() => {
        hashGeneratorSpy.mockClear();
        expirationDateGeneratorSpy.mockClear();
    });

    describe("create", () => {
        it("should check if company with provided email already exists", async () => {
            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue({ uuid: faker.random.uuid() }),
                },
            });

            await expect(companyService.create({ email: faker.internet.email() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Company account has been already registered with provided email." }]);
        });

        it("should create company", async () => {
            const companyData = {
                name: faker.company.companyName(),
                email: faker.internet.email(),
            };

            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(null),
                    create: jest.fn().mockImplementation((company) => company),
                },
            });

            const createdCompany = await companyService.create({
                name: companyData.name,
                email: companyData.email,
            });

            expect(companyService.companyModel.findOne).toHaveBeenCalledTimes(1);
            expect(companyService.companyModel.findOne).toHaveBeenCalledWith({
                where: {
                    official_email: companyData.email,
                },
                attributes: ["uuid"],
            });
            expect(companyService.companyModel.create).toHaveBeenCalledTimes(1);
            expect(companyService.companyModel.create).toHaveBeenCalledWith({
                name: companyData.name,
                official_email: companyData.email,
                activation_hash: hash,
                activation_expiration_date: date,
            });
            expect(createdCompany).toMatchObject({
                name: companyData.name,
                official_email: companyData.email,
                activation_hash: hash,
                activation_expiration_date: date,
            });
        });
    });

    describe("getCompanyToEdit", () => {
        it("should check if company doesn't exist", async () => {
            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(companyService.getCompanyToEdit({ companyUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No company found by provided UUID." }]);
        });

        it("should return company", async () => {
            const companyData = {
                uuid: faker.random.uuid(),
                name: faker.company.companyName(),
                official_email: faker.internet.email(),
            };

            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(companyData),
                },
            });

            const returnedCompany = await companyService.getCompanyToEdit({
                companyUUID: companyData.uuid,
            });

            expect(companyService.companyModel.findOne).toHaveBeenCalledTimes(1);
            expect(companyService.companyModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: companyData.uuid,
                },
                attributes: ["uuid", "name", "official_email"],
            });
            expect(returnedCompany).toMatchObject({
                name: companyData.name,
                email: companyData.official_email,
            });
        });
    });

    describe("editCompanyName", () => {
        it("should check if company doesn't exist", async () => {
            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(companyService.editCompanyName({ companyUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No company found by provided UUID." }]);
        });

        it("should check if provided name is equal to saved name", async () => {
            const companyData = {
                name: faker.company.companyName(),
            };

            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(companyData),
                },
            });

            await expect(companyService.editCompanyName({
                companyUUID: faker.random.uuid(),
                name: companyData.name,
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Information", text: "We accepted your request to change company name but it doesn't differ from actual one." }]);
        });

        it("should edit company name", async () => {
            const companyData = {
                uuid: faker.random.uuid(),
                actualName: faker.company.companyName(),
                newName: faker.company.companyName(),
            };
            const saveMock = jest.fn();

            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue({
                        save: saveMock,
                        uuid: companyData.uuid,
                        name: companyData.actualName,
                    }),
                },
            });

            const editedCompany = await companyService.editCompanyName({
                companyUUID: companyData.uuid,
                name: companyData.newName,
            });

            expect(companyService.companyModel.findOne).toHaveBeenCalledTimes(1);
            expect(companyService.companyModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: companyData.uuid,
                },
                attributes: ["uuid", "name"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(editedCompany).toMatchObject({
                uuid: companyData.uuid,
                name: companyData.newName,
            });
        });
    });

    describe("editCompanyEmail", () => {
        it("should check if company doesn't exist", async () => {
            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(companyService.editCompanyEmail({
                companyUUID: faker.random.uuid(),
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No company found by provided UUID." }]);
        });

        it("should check if provided email is equal to saved email", async () => {
            const companyData = {
                official_email: faker.internet.email(),
            };

            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue(companyData),
                },
            });

            await expect(companyService.editCompanyEmail({
                companyUUID: faker.random.uuid(),
                email: companyData.official_email,
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Information", text: "We accepted your request to change company email but it doesn't differ from actual one." }]);
        });

        it("should edit company email", async () => {
            const companyData = {
                uuid: faker.random.uuid(),
                actualEmail: faker.internet.email(),
                newEmail: faker.internet.email(),
            };
            const saveMock = jest.fn();

            const companyService = new CompanyService({
                companyModel: {
                    findOne: jest.fn().mockReturnValue({
                        uuid: companyData.uuid,
                        official_email: companyData.actualEmail,
                        save: saveMock,
                    }),
                },
            });

            const editedCompany = await companyService.editCompanyEmail({
                companyUUID: companyData.uuid,
                email: companyData.newEmail,
            });

            expect(companyService.companyModel.findOne).toHaveBeenCalledTimes(1);
            expect(companyService.companyModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: companyData.uuid,
                },
                attributes: ["uuid", "official_email"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(editedCompany).toMatchObject({
                uuid: companyData.uuid,
                official_email: companyData.newEmail,
            });
        });
    });
};
