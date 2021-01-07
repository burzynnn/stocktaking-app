import faker from "faker";

import AuthController from "./auth.controller";
import ActionMessages from "../../config/actionMessages.config";

import expressMock from "../../../tests/utils/mock";

export default () => {
    const csrfToken = faker.random.hexaDecimal(128);

    describe("getLogIn", () => {
        it("should render", () => {
            const authController = new AuthController({});

            const req = expressMock.mockRequest();
            req.csrfToken = () => csrfToken;
            req.flash = (type) => (type === "messages" ? [] : [[]]);
            const res = expressMock.mockResponse();

            authController.getLogIn(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("auth/login", {
                title: "Log in!",
                csrf: csrfToken,
                errors: [],
                inputs: [],
                messages: [],
            });
        });
    });

    describe("postLogIn", () => {
        it("should fetch data, then redirect", async () => {
            const userData = {
                email: faker.internet.email(),
                password: faker.internet.password(),
            };
            const authData = {
                loggedIn: true,
                userUUID: faker.random.uuid(),
                userName: faker.name.firstName(),
                userCompanyUUID: faker.random.uuid(),
                userType: "owner",
            };

            const authController = new AuthController({
                authService: {
                    logIn: jest.fn().mockReturnValue(authData),
                },
            });

            const req = expressMock.mockRequest();
            req.body = userData;
            req.session = {};
            const res = expressMock.mockResponse();

            await authController.postLogIn(req, res);

            expect(authController.authService.logIn).toHaveBeenCalledTimes(1);
            expect(authController.authService.logIn).toHaveBeenCalledWith({
                email: userData.email,
                password: userData.password,
            });
            expect(req.session).toMatchObject(authData);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard");
        });
    });

    describe("getRegister", () => {
        it("should render", () => {
            const authController = new AuthController({});

            const req = expressMock.mockRequest();
            req.csrfToken = () => csrfToken;
            req.flash = (type) => (type === "messages" ? [] : [[]]);
            const res = expressMock.mockResponse();

            authController.getRegister(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("auth/register", {
                title: "Register",
                csrf: csrfToken,
                errors: [],
                inputs: [],
                messages: [],
            });
        });
    });

    describe("postRegister", () => {
        it("should register user and company, then redirect", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                activationHash: faker.random.hexaDecimal(128),
            };
            const companyData = {
                uuid: faker.random.uuid(),
                name: faker.company.companyName(),
                email: faker.internet.email(),
                activationHash: faker.random.hexaDecimal(128),
            };

            const authController = new AuthController({
                companyService: {
                    create: jest.fn().mockImplementation(({ name, email }) => ({
                        uuid: companyData.uuid,
                        name,
                        official_email: email,
                        activation_hash: companyData.activationHash,
                    })),
                },
                userService: {
                    create: jest.fn().mockImplementation(({
                        name,
                        email,
                        password,
                        companyUUID,
                        userTypeUUID,
                    }) => ({
                        uuid: userData.uuid,
                        name,
                        email,
                        password: `argon2-${password}`,
                        company_uuid: companyUUID,
                        user_type_uuid: userTypeUUID,
                        activation_hash: userData.activationHash,
                    })),
                },
                mailService: {
                    companyRegister: jest.fn(),
                    userRegister: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.body = {
                companyName: companyData.name,
                companyEmail: companyData.email,
                userName: userData.name,
                userEmail: userData.email,
                userPassword: userData.password,
            };
            req.flash = jest.fn();
            const res = expressMock.mockResponse();

            await authController.postRegister(req, res);

            expect(authController.companyService.create).toHaveBeenCalledTimes(1);
            expect(authController.companyService.create).toHaveBeenCalledWith({
                name: companyData.name,
                email: companyData.email,
            });
            expect(authController.userService.create).toHaveBeenCalledTimes(1);
            expect(authController.userService.create).toHaveBeenCalledWith({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                companyUUID: companyData.uuid,
                userTypeUUID: "b8c2301c-ac75-4aa5-86ba-0d70956a59ea",
            });
            expect(authController.mailService.companyRegister).toHaveBeenCalledTimes(1);
            expect(authController.mailService.companyRegister).toHaveBeenCalledWith({
                receiver: companyData.email,
                activationHash: companyData.activationHash,
            });
            expect(authController.mailService.userRegister).toHaveBeenCalledTimes(1);
            expect(authController.mailService.userRegister).toHaveBeenCalledWith({
                receiver: userData.email,
                activationHash: userData.activationHash,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "Account created." }, { type: "Information", text: "Head to both company and user email, verify your credentials and log in!" }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/auth/login");
        });
    });

    describe("getLogOut", () => {
        it("should logout, then redirect", () => {
            const authController = new AuthController({
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.session = {
                destroy: jest.fn().mockImplementation((callback) => callback(null)),
            };
            req.flash = jest.fn();
            const res = expressMock.mockResponse();
            const redirectMock = jest.fn();
            res.clearCookie = jest.fn().mockReturnValue({
                redirect: redirectMock,
            });

            authController.getLogOut(req, res);

            expect(req.session.destroy).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Information", text: "Successfully logged out." }]);
            expect(res.clearCookie).toHaveBeenCalledTimes(1);
            expect(res.clearCookie).toHaveBeenCalledWith("stocktaking.sid");
            expect(redirectMock).toHaveBeenCalledTimes(1);
            expect(redirectMock).toHaveBeenCalledWith("/auth/login");
        });
    });

    describe("getRegistrationVerification", () => {
        it("should verify company account, then redirect", async () => {
            const companyData = {
                activationHash: faker.random.hexaDecimal(128),
            };

            const authController = new AuthController({
                authService: {
                    companyVerifyRegistration: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.query = {
                hash: companyData.activationHash,
                type: "company",
            };
            const res = expressMock.mockResponse();

            await authController.getRegistrationVerification(req, res);

            expect(authController.authService.companyVerifyRegistration).toHaveBeenCalledTimes(1);
            expect(authController.authService.companyVerifyRegistration).toHaveBeenCalledWith({
                activationHash: companyData.activationHash,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "Company account activated." }, { type: "Information", text: "If you have activated user account, then you can login using it's credentials." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/auth/login");
        });

        it("should verify user account, then redirect", async () => {
            const userData = {
                activationHash: faker.random.hexaDecimal(128),
            };

            const authController = new AuthController({
                authService: {
                    userVerifyRegistration: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.query = {
                hash: userData.activationHash,
                type: "user",
            };
            const res = expressMock.mockResponse();

            await authController.getRegistrationVerification(req, res);

            expect(authController.authService.userVerifyRegistration).toHaveBeenCalledTimes(1);
            expect(authController.authService.userVerifyRegistration).toHaveBeenCalledWith({
                activationHash: userData.activationHash,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "User account activated." }, { type: "Information", text: "You can log in below." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/auth/login");
        });

        it("should handle wrong type, then redirect", async () => {
            const authController = new AuthController({
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.query = {
                type: "definitelyNotUser",
            };
            const res = expressMock.mockResponse();

            await authController.getRegistrationVerification(req, res);

            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Error", text: "We can't verify account of this type." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/auth/login");
        });
    });

    describe("getForgotPassword", () => {
        it("should render", () => {
            const authController = new AuthController({});

            const req = expressMock.mockRequest();
            req.csrfToken = () => csrfToken;
            req.flash = (type) => (type === "messages" ? [] : [[]]);
            const res = expressMock.mockResponse();

            authController.getForgotPassword(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("auth/forgot-password", {
                title: "Forgot password",
                csrf: csrfToken,
                errors: [],
                inputs: [],
                messages: [],
            });
        });
    });

    describe("postForgotPassword", () => {
        it("should initiate password reset procedure, then redirect", async () => {
            const userData = {
                email: faker.internet.email(),
                passwordResetHash: faker.random.hexaDecimal(128),
            };

            const authController = new AuthController({
                authService: {
                    userInitiatePasswordReset: jest.fn().mockReturnValue({
                        email: userData.email,
                        password_reset_hash: userData.passwordResetHash,
                    }),
                },
                mailService: {
                    passwordForgot: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.body = {
                email: userData.email,
            };
            const res = expressMock.mockResponse();

            await authController.postForgotPassword(req, res);

            expect(authController.authService.userInitiatePasswordReset).toHaveBeenCalledTimes(1);
            expect(authController.authService.userInitiatePasswordReset).toHaveBeenCalledWith({
                email: userData.email,
            });
            expect(authController.mailService.passwordForgot).toHaveBeenCalledTimes(1);
            expect(authController.mailService.passwordForgot).toHaveBeenCalledWith({
                receiver: userData.email,
                passwordResetHash: userData.passwordResetHash,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Warning", text: "Due to security reasons we can't confirm that provided email was correct." }, { type: "Information", text: "Head to your email account and check if reset password email arrived. If not you probably used wrong email address." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/auth/forgot-password");
        });
    });

    describe("getResetPassword", () => {
        it("should render", () => {
            const authController = new AuthController({});

            const req = expressMock.mockRequest();
            req.csrfToken = () => csrfToken;
            req.flash = (type) => (type === "messages" ? [] : [[]]);
            const res = expressMock.mockResponse();

            authController.getResetPassword(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("auth/reset-password", {
                title: "Reset password",
                csrf: csrfToken,
                errors: [],
                inputs: [],
                messages: [],
            });
        });
    });

    describe("postResetPassword", () => {
        it("should set new password, then redirect", async () => {
            const userData = {
                hash: faker.random.hexaDecimal(128),
                newPassword: faker.internet.password(),
            };

            const authController = new AuthController({
                authService: {
                    userResetPassword: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.query = {
                hash: userData.hash,
            };
            req.body = {
                newPassword: userData.newPassword,
            };
            const res = expressMock.mockResponse();

            await authController.postResetPassword(req, res);

            expect(authController.authService.userResetPassword).toHaveBeenCalledTimes(1);
            expect(authController.authService.userResetPassword).toHaveBeenCalledWith({
                hash: userData.hash,
                password: userData.newPassword,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "Password changed successfully." }, { type: "Information", text: "You can log in now using new password." }]);
        });
    });
};
