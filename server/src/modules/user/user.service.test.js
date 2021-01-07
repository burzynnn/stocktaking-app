import faker from "faker";
import argon2 from "argon2";

import * as hashGenerator from "../../utils/generateHash";
import * as expirationDateGenerator from "../../utils/generateExpirationDate";

import UserService from "./user.service";

export default () => {
    const hash = faker.random.hexaDecimal(128);
    let hashGeneratorSpy;
    const date = new Date();
    let expirationDateGeneratorSpy;
    let argon2HashSpy;
    let argon2VerifySpy;

    beforeAll(() => {
        hashGeneratorSpy = jest.spyOn(hashGenerator, "default").mockReturnValue(hash);
        expirationDateGeneratorSpy = jest.spyOn(expirationDateGenerator, "default").mockReturnValue(date);
        argon2HashSpy = jest.spyOn(argon2, "hash").mockImplementation((password) => `argon2-${password}`);
        argon2VerifySpy = jest.spyOn(argon2, "verify").mockImplementation((hashed, plain) => `argon2-${plain}` === hashed);
    });

    afterEach(() => {
        hashGeneratorSpy.mockClear();
        expirationDateGeneratorSpy.mockClear();
        argon2HashSpy.mockClear();
        argon2VerifySpy.mockClear();
    });

    describe("create", () => {
        it("should check if user with provided email already exists", async () => {
            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(faker.random.uuid()),
                },
            });

            await expect(userService.create({ email: faker.internet.email() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Account has been already registered with provided email." }]);
        });

        it("should create user", async () => {
            const userData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                name: faker.name.firstName(),
                companyUUID: faker.random.uuid(),
                userTypeUUID: faker.random.uuid(),
            };

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                    create: jest.fn().mockImplementation((createdUser) => createdUser),
                },
            });

            const createdUser = await userService.create(userData);

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    email: userData.email,
                },
                attributes: ["uuid"],
            });
            expect(userService.userModel.create).toHaveBeenCalledTimes(1);
            expect(userService.userModel.create).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: `argon2-${userData.password}`,
                active: true,
                activation_hash: hash,
                activation_expiration_date: date,
                password_reset_hash: null,
                password_reset_expiration_date: null,
                company_uuid: userData.companyUUID,
                user_type_uuid: userData.userTypeUUID,
            });
            expect(createdUser).toMatchObject({
                name: userData.name,
                email: userData.email,
                password: `argon2-${userData.password}`,
                active: true,
                activation_hash: hash,
                activation_expiration_date: date,
                password_reset_hash: null,
                password_reset_expiration_date: null,
                company_uuid: userData.companyUUID,
                user_type_uuid: userData.userTypeUUID,
            });
        });
    });

    describe("getOwnerByCompanyUUID", () => {
        it("should get owner", () => {
            const owner = { uuid: faker.random.uuid(), type: "owner" };
            const companyUUID = faker.random.uuid();

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(owner),
                },
            });

            const returnedUser = userService.getOwnerByCompanyUUID({ companyUUID });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    company_uuid: companyUUID,
                },
                include: {
                    association: "user_has_user_type",
                    attributes: ["type"],
                    where: {
                        type: "owner",
                    },
                },
                attributes: ["uuid"],
            });
            expect(returnedUser).toMatchObject(owner);
        });
    });

    describe("getUserToEdit", () => {
        it("should check if user doesn't exist", async () => {
            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(userService.getUserToEdit({ userUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided UUID." }]);
        });

        it("should return user", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                name: faker.name.firstName(),
                email: faker.internet.email(),
                createdAt: "12:34 05-10-2000",
                company_uuid: faker.random.uuid(),
                user_has_user_type: {
                    type: faker.commerce.department(),
                },
                company: {
                    name: faker.company.companyName(),
                },
            };

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(userData),
                },
                userTypeModel: {},
                companyModel: {},
            });

            const returnedUser = await userService.getUserToEdit({ userUUID: userData.uuid });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: userData.uuid,
                },
                attributes: ["uuid", "name", "email", "createdAt", "company_uuid"],
                include: [{
                    model: userService.userTypeModel,
                    as: "user_has_user_type",
                    attributes: ["type"],
                }, {
                    model: userService.companyModel,
                    attributes: ["name"],
                }],
            });
            expect(returnedUser).toMatchObject({
                name: userData.name,
                email: userData.email,
                accountCreationDate: "12:34 10-05-2000",
                type: userData.user_has_user_type.type,
                companyName: userData.company.name,
            });
        });
    });

    describe("editUserName", () => {
        it("should check if user doesn't exist", async () => {
            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(userService.editUserName({ userUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided UUID." }]);
        });

        it("should check if provided name is equal to saved name", async () => {
            const userData = {
                name: faker.name.firstName(),
            };

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        name: userData.name,
                    }),
                },
            });

            await expect(userService.editUserName({
                userUUID: faker.random.uuid(),
                name: userData.name,
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Information", text: "We accepted your request to change user name but it doesn't differ from actual one." }]);
        });

        it("should edit user name", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                actualName: faker.name.firstName(),
                newName: faker.name.firstName(),
            };
            const saveMock = jest.fn();

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        name: userData.actualName,
                        save: saveMock,
                    }),
                },
            });

            const editedUser = await userService.editUserName({
                userUUID: userData.uuid,
                name: userData.newName,
            });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: userData.uuid,
                },
                attributes: ["uuid", "name"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(editedUser).toMatchObject({
                name: userData.newName,
            });
        });
    });

    describe("editUserEmail", () => {
        it("should check if user doesn't exist", async () => {
            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(userService.editUserEmail({ userUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided UUID." }]);
        });

        it("should check if provided email is equal to saved email", async () => {
            const userData = {
                email: faker.internet.email(),
            };

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        email: userData.email,
                    }),
                },
            });

            await expect(userService.editUserEmail({
                userUUID: faker.random.uuid(),
                email: userData.email,
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Information", text: "We accepted your request to change user email but it doesn't differ from actual one." }]);
        });

        it("should edit user email", async () => {
            const userData = {
                actualEmail: faker.internet.email(),
                newEmail: faker.internet.email(),
                uuid: faker.random.uuid(),
            };
            const saveMock = jest.fn().mockReturnValue("saved");

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        email: userData.actualEmail,
                        save: saveMock,
                    }),
                },
            });

            const editedUser = await userService.editUserEmail({
                userUUID: userData.uuid,
                email: userData.newEmail,
            });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: userData.uuid,
                },
                attributes: ["uuid", "email"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(editedUser).toMatchObject({
                email: userData.newEmail,
            });
        });
    });

    describe("editUserPassword", () => {
        it("should check if user doesn't exist", async () => {
            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(userService.editUserPassword({ userUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided UUID." }]);
        });

        it("should edit user password", async () => {
            const userData = {
                actualPassword: `argon2-${faker.internet.password()}`,
                newPassword: faker.internet.password(),
                uuid: faker.random.uuid(),
            };
            const saveMock = jest.fn().mockReturnValue("saved");

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        password: userData.actualPassword,
                        save: saveMock,
                    }),
                },
            });

            const editedUser = await userService.editUserPassword({
                userUUID: userData.uuid,
                password: userData.newPassword,
            });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: userData.uuid,
                },
                attributes: ["uuid", "password"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(editedUser).toMatchObject({
                password: `argon2-${userData.newPassword}`,
            });
        });
    });

    describe("isProvidedPasswordCorrect", () => {
        it("should check if user doesn't exist", async () => {
            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(userService.isProvidedPasswordCorrect({ userUUID: faker.random.uuid() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided UUID." }]);
        });

        it("should return true if passwords are same", async () => {
            const password = faker.internet.password();
            const userData = {
                plainPassword: password,
                savedPassword: `argon2-${password}`,
                uuid: faker.random.uuid(),
            };

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        password: userData.savedPassword,
                    }),
                },
            });

            const result = await userService.isProvidedPasswordCorrect({
                userUUID: userData.uuid,
                password: userData.plainPassword,
            });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: userData.uuid,
                },
                attributes: ["uuid", "password"],
            });
            expect(argon2VerifySpy).toHaveBeenCalledTimes(1);
            expect(result).toBeTruthy();
        });

        it("should return false if passwords are different", async () => {
            const userData = {
                plainPassword: faker.internet.password(),
                savedPassword: `argon2-${faker.internet.password()}`,
                uuid: faker.random.uuid(),
            };

            const userService = new UserService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        password: userData.savedPassword,
                    }),
                },
            });

            const result = await userService.isProvidedPasswordCorrect({
                userUUID: userData.uuid,
                password: userData.plainPassword,
            });

            expect(userService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(userService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    uuid: userData.uuid,
                },
                attributes: ["uuid", "password"],
            });
            expect(argon2VerifySpy).toHaveBeenCalledTimes(1);
            expect(result).toBeFalsy();
        });
    });
};
