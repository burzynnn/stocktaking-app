import faker from "faker";
import argon2 from "argon2";

import * as hashGenerator from "../../utils/generateHash";
import * as expirationDateGenerator from "../../utils/generateExpirationDate";

import AuthService from "./auth.service";

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

    describe("logIn", () => {
        it("should check if user doesn't exist", async () => {
            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(authService.logIn({
                email: faker.internet.email(),
                password: faker.internet.password(),
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Incorrect email or password." }]);
        });

        it("should check if passwords aren't equal", async () => {
            const userData = {
                savedPassword: `argon2-${faker.internet.password()}`,
                providedPassword: faker.internet.password(),
            };

            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        password: userData.savedPassword,
                    }),
                },
            });

            await expect(authService.logIn({
                email: faker.internet.email(),
                password: userData.providedPassword,
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Incorrect email or password." }]);
        });

        it("should check if account isn't active", async () => {
            const userData = {
                password: faker.internet.password(),
            };

            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        uuid: faker.random.uuid(),
                        password: `argon2-${userData.password}`,
                        active: false,
                    }),
                },
            });

            await expect(authService.logIn({
                email: faker.internet.email(),
                password: userData.password,
            }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Account isn't active." }]);
        });

        it("should return user", async () => {
            const userData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
                uuid: faker.random.uuid(),
                name: faker.name.firstName(),
                company_uuid: faker.random.uuid(),
            };

            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        uuid: userData.uuid,
                        name: userData.name,
                        password: `argon2-${userData.password}`,
                        active: true,
                        company_uuid: userData.company_uuid,
                        getUser_has_user_type: jest.fn().mockReturnValue({ type: "owner" }),
                    }),
                },
            });

            const returnedUser = await authService.logIn({
                email: userData.email,
                password: userData.password,
            });

            expect(authService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(authService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    email: userData.email,
                },
                attributes: ["uuid", "name", "password", "active", "company_uuid", "user_type_uuid"],
            });
            expect(returnedUser).toMatchObject({
                loggedIn: true,
                userUUID: userData.uuid,
                userName: userData.name,
                userCompanyUUID: userData.company_uuid,
                userType: "owner",
            });
        });
    });

    // this method applies to both user and company model so it will only check one of them
    describe("verifyRegistration", () => {
        it("should check if entity doesn't exist", async () => {
            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(authService.verifyRegistration("userModel", { activationHash: hash }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "We couldn't find your account to verify by provided hash." }]);
        });

        it("should check if activation expiration date passed", async () => {
            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        activation_expiration_date: new Date(943920000),
                    }),
                },
            });

            await expect(authService.verifyRegistration("userModel", { activationHash: hash }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Your registration verify hash expired. Both owner and company account will be deleted soon." }]);
        });

        it("should activate entity", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                active: false,
                activation_hash: hash,
                activation_expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
            };
            const saveMock = jest.fn();

            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        save: saveMock,
                        ...userData,
                    }),
                },
            });

            const returnedEntity = await authService.verifyRegistration("userModel", { activationHash: userData.activation_hash });

            expect(authService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(authService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    activation_hash: userData.activation_hash,
                },
                attributes: ["uuid", "active", "activation_hash", "activation_expiration_date"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(returnedEntity).toMatchObject({
                uuid: userData.uuid,
                active: true,
                activation_hash: null,
                activation_expiration_date: null,
            });
        });
    });

    describe("companyVerifyRegistration", () => {
        it("should run 'verifyRegistration' method", () => {
            const companyData = {
                hash: faker.random.hexaDecimal(128),
            };
            const authService = new AuthService({});

            const verifyRegistrationSpy = jest.spyOn(authService, "verifyRegistration");

            authService.companyVerifyRegistration({ activationHash: companyData.hash });

            expect(verifyRegistrationSpy).toHaveBeenCalledTimes(1);
            expect(verifyRegistrationSpy).toHaveBeenCalledWith("companyModel", { activationHash: companyData.hash });
            verifyRegistrationSpy.mockRestore();
        });
    });

    describe("userVerifyRegistration", () => {
        it("should run 'verifyRegistration' method", () => {
            const userData = {
                hash: faker.random.hexaDecimal(128),
            };
            const authService = new AuthService({});

            const verifyRegistrationSpy = jest.spyOn(authService, "verifyRegistration");

            authService.userVerifyRegistration({ activationHash: userData.hash });

            expect(verifyRegistrationSpy).toHaveBeenCalledTimes(1);
            expect(verifyRegistrationSpy).toHaveBeenCalledWith("userModel", { activationHash: userData.hash });
            verifyRegistrationSpy.mockRestore();
        });
    });

    describe("userInitiatePasswordReset", () => {
        it("should check if user doesn't exist", async () => {
            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(authService.userInitiatePasswordReset({ email: faker.internet.email() }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided email." }]);
        });

        it("should return user", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                email: faker.internet.email(),
            };
            const saveMock = jest.fn();

            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        save: saveMock,
                        ...userData,
                    }),
                },
            });

            const returnedUser = await authService.userInitiatePasswordReset({
                email: userData.email,
            });

            expect(authService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(authService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    email: userData.email,
                },
                attributes: ["uuid", "email"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(returnedUser).toMatchObject({
                uuid: userData.uuid,
                email: userData.email,
                password_reset_hash: hash,
                password_reset_expiration_date: date,
            });
        });
    });

    describe("userResetPassword", () => {
        it("should check if user doesn't exist", async () => {
            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue(null),
                },
            });

            await expect(authService.userResetPassword({ hash }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "No user found by provided email." }]);
        });

        it("should check if password reset expiration date passed", async () => {
            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        password_reset_expiration_date: new Date(943920000),
                    }),
                },
            });

            await expect(authService.userResetPassword({ hash }))
                .rejects
                .toHaveProperty("causes", [{ type: "Error", text: "Password reset hash expired." }]);
        });

        it("should return user", async () => {
            const userData = {
                actualPassword: `argon2-${faker.internet.password()}`,
                newPassword: faker.internet.password(),
                uuid: faker.random.uuid(),
            };
            const saveMock = jest.fn();

            const authService = new AuthService({
                userModel: {
                    findOne: jest.fn().mockReturnValue({
                        password: userData.actualPassword,
                        uuid: userData.uuid,
                        password_reset_hash: hash,
                        password_reset_expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24),
                        save: saveMock,
                    }),
                },
            });

            const returnedUser = await authService.userResetPassword({
                hash,
                password: userData.newPassword,
            });

            expect(authService.userModel.findOne).toHaveBeenCalledTimes(1);
            expect(authService.userModel.findOne).toHaveBeenCalledWith({
                where: {
                    password_reset_hash: hash,
                },
                attributes: ["uuid", "password", "password_reset_hash", "password_reset_expiration_date"],
            });
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(returnedUser).toMatchObject({
                uuid: userData.uuid,
                password: `argon2-${userData.newPassword}`,
                password_reset_expiration_date: null,
                password_reset_hash: null,
            });
        });
    });
};
