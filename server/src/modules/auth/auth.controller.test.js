import argon2 from "argon2";
import faker from "faker";

import AuthController from "./auth.controller";
import * as hashGenerator from "../../utils/generateHash";
import * as expirationDateGenerator from "../../utils/generateExpirationDate";

import expressMock from "../../../tests/utils/mock";

export default () => {
    describe("getLogin", () => {
        it("should execute with correct attributes", () => {
            const authController = new AuthController();

            const token = "CIwNZNlR4XbisJF39I8yWnWX9wX4WFoz";
            const errors = ["first error", "second error"];
            const inputs = { email: faker.internet.email(), password: faker.internet.password() };

            const req = expressMock.mockRequest();
            req.csrfToken = () => token;
            req.flash = (type) => (type === "errors" ? errors : [inputs]);
            const res = expressMock.mockResponse();

            authController.getLogin(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("modules/auth/login", {
                title: "Log in!", csrf: token, errors, inputs,
            });
        });
    });

    describe("postLogin", () => {
        let req;
        let values;
        let res;
        beforeEach(() => {
            req = expressMock.mockRequest();
            values = {
                email: faker.internet.email(),
                password: "secondPassword",
            };
            req.body = values;
            req.session = {};
            req.session.loggedIn = false;
            res = expressMock.mockResponse();
        });

        it("should check if session is logged in", async () => {
            const authController = new AuthController();

            req.session.loggedIn = true;

            await authController.postLogin(req, res, expressMock.mockNext);

            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/");
        });

        it("should check if provided user exists", async () => {
            const authController = new AuthController({}, {
                findOneByEmail: jest.fn().mockReturnValue(undefined),
            });

            await authController.postLogin(req, res, expressMock.mockNext);

            expect(authController.userService.findOneByEmail).toHaveBeenCalledTimes(1);
            expect(authController.userService.findOneByEmail).toHaveBeenCalledWith(values.email);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>No user found with provided email.</h1>");
        });

        it("should check if user account is activated", async () => {
            const authController = new AuthController({}, {
                findOneByEmail: jest.fn().mockReturnValue({ active: false }),
            });

            await authController.postLogin(req, res, expressMock.mockNext);

            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>You didn't activate your account.</h1>");
        });

        it("should check is user provided correct password", async () => {
            const hash = await argon2.hash("firstPassword");
            const authController = new AuthController({}, {
                findOneByEmail: jest.fn().mockReturnValue({ active: true, password: hash }),
            });

            await authController.postLogin(req, res, expressMock.mockNext);

            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Wrong password.</h1>");
        });

        it("should log user in and update fill session info", async () => {
            const password = "samePassword";
            const hash = await argon2.hash(password);
            const findOneByEmailMock = {
                active: true,
                password: hash,
                uuid: faker.random.uuid(),
                user_type_uuid: faker.random.uuid(),
            };
            const authController = new AuthController({}, {
                findOneByEmail: jest.fn().mockReturnValue(findOneByEmailMock),
            });

            req.body.password = password;

            await authController.postLogin(req, res, expressMock.mockNext);

            expect(req.session.loggedIn).toBeTruthy();
            expect(req.session.uuid).toEqual(findOneByEmailMock.uuid);
            expect(req.session.user_type_uuid).toEqual(findOneByEmailMock.user_type_uuid);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/");
        });
    });

    describe("getRegister", () => {
        it("should execute with correct attributes", () => {
            const authController = new AuthController();

            const token = "CIwNZNlR4XbisJF39I8yWnWX9wX4WFoz";

            const req = expressMock.mockRequest();
            req.csrfToken = () => token;
            const res = expressMock.mockResponse();

            authController.getRegister(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("modules/auth/register", { title: "Register", csrf: token });
        });
    });

    describe("postRegister", () => {
        const hash = "somehash";
        let hashSpy;
        const date = new Date();
        let dateSpy;

        beforeAll(() => {
            hashSpy = jest.spyOn(hashGenerator, "default").mockReturnValue(hash);
            dateSpy = jest.spyOn(expirationDateGenerator, "default").mockReturnValue(date);
        });

        afterEach(() => {
            hashSpy.mockClear();
            dateSpy.mockClear();
        });

        let req;
        let values;
        let res;
        beforeEach(() => {
            req = expressMock.mockRequest();
            values = {
                companyName: faker.company.companyName(),
                companyEmail: faker.internet.email(),
                userName: faker.internet.userName(),
                userEmail: faker.internet.email(),
                userPassword: faker.internet.password(),
            };
            req.body = values;
            res = expressMock.mockResponse();
        });

        it("should check if company already exists", async () => {
            const authController = new AuthController({
                findOneByEmail: jest.fn().mockReturnValue({ email: values.companyEmail }),
            });

            await authController.postRegister(req, res, expressMock.mockNext);

            expect(authController.companyService.findOneByEmail).toHaveBeenCalledTimes(1);
            expect(authController.companyService.findOneByEmail)
                .toHaveBeenCalledWith(values.companyEmail);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Company with this email has been already registered.");
        });

        it("should check if user already exists", async () => {
            const authController = new AuthController({
                findOneByEmail: jest.fn().mockReturnValue(undefined),
                create: jest.fn().mockImplementation((company) => ({
                    ...company,
                    official_email: company.email,
                })),
            }, {
                findOneByEmail: jest.fn().mockReturnValue({ email: values.userEmail }),
            }, {
                sendMail: jest.fn(),
            });

            await authController.postRegister(req, res, expressMock.mockNext);

            expect(hashSpy).toHaveBeenCalledTimes(1);
            expect(hashSpy).toHaveBeenCalledWith(128);
            expect(dateSpy).toHaveBeenCalledTimes(1);
            expect(dateSpy).toHaveBeenCalledWith(1);
            expect(authController.companyService.create).toHaveBeenCalledTimes(1);
            expect(authController.companyService.create).toHaveBeenCalledWith({
                name: values.companyName,
                email: values.companyEmail,
                hash,
                timestamp: date,
            });
            expect(authController.mailer.sendMail).toHaveBeenCalledTimes(1);
            expect(authController.mailer.sendMail).toHaveBeenCalledWith({
                to: values.companyEmail,
                subject: "Confirm your company registration.",
                text: `We are happy to see your company on stocktaking-app!
                However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
                http://localhost:3000/auth/registration-verification?hash=${hash}&type=company`,
                html: `<h1>We are happy to see your company on stocktaking-app!</h1>
                <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
                <a href='http://localhost:3000/auth/registration-verification?hash=${hash}&type=company'>Confirm your registration!</a>`,
            });
            expect(authController.userService.findOneByEmail).toHaveBeenCalledTimes(1);
            expect(authController.userService.findOneByEmail)
                .toHaveBeenCalledWith(values.userEmail);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>User with this email has been already registered</h1>");
        });

        it("should register company and user", async () => {
            const argon2HashSpy = jest.spyOn(argon2, "hash").mockImplementation((password) => `argon2-${password}`);
            const companyUUID = faker.random.uuid();
            const authController = new AuthController({
                findOneByEmail: jest.fn().mockReturnValue(undefined),
                create: jest.fn().mockImplementation((company) => ({
                    ...company,
                    official_email: company.email,
                    uuid: companyUUID,
                })),
            }, {
                findOneByEmail: jest.fn().mockReturnValue(undefined),
                create: jest.fn().mockImplementation((user) => user),
            }, {
                sendMail: jest.fn(),
            });

            await authController.postRegister(req, res, expressMock.mockNext);

            expect(hashSpy).toHaveBeenCalledTimes(2);
            expect(hashSpy).toHaveBeenCalledWith(128);
            expect(dateSpy).toHaveBeenCalledTimes(2);
            expect(dateSpy).toHaveBeenCalledWith(1);
            expect(authController.companyService.create).toHaveBeenCalledTimes(1);
            expect(authController.companyService.create).toHaveBeenCalledWith({
                name: values.companyName,
                email: values.companyEmail,
                hash,
                timestamp: date,
            });
            expect(authController.userService.create).toHaveBeenCalledTimes(1);
            expect(authController.userService.create).toHaveBeenCalledWith({
                name: values.userName,
                email: values.userEmail,
                password: `argon2-${values.userPassword}`,
                hash,
                timestamp: date,
                companyUUID,
                userTypeUUID: "b8c2301c-ac75-4aa5-86ba-0d70956a59ea",
            });
            expect(authController.mailer.sendMail).toHaveBeenCalledTimes(2);
            expect(authController.mailer.sendMail).toHaveBeenNthCalledWith(1, {
                to: values.companyEmail,
                subject: "Confirm your company registration.",
                text: `We are happy to see your company on stocktaking-app!
                However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
                http://localhost:3000/auth/registration-verification?hash=${hash}&type=company`,
                html: `<h1>We are happy to see your company on stocktaking-app!</h1>
                <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
                <a href='http://localhost:3000/auth/registration-verification?hash=${hash}&type=company'>Confirm your registration!</a>`,
            });
            expect(authController.mailer.sendMail).toHaveBeenNthCalledWith(2, {
                to: values.userEmail,
                subject: "Confirm your registration.",
                text: `We are happy to see you on stocktaking-app!
                However, we have to be sure that your registration wasn't a mistake. Please go to the link you see below.
                http://localhost:3000/auth/registration-verification?hash=${hash}&type=user`,
                html: `<h1>We are happy to see you on stocktaking-app!</h1>
                <p>However, we have to be sure that your registration wasn't a mistake. Please click link below.<p>
                <a href='http://localhost:3000/auth/registration-verification?hash=${hash}&type=user'>Confirm your registration!</a>`,
            });
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Your company has been registered and user created.</h1>");

            argon2HashSpy.mockRestore();
        });

        afterAll(() => {
            hashSpy.mockRestore();
            dateSpy.mockRestore();
        });
    });

    describe("getRegistrationVerification", () => {
        ["company", "user"].forEach((type) => {
            let req;
            let values;
            let res;
            beforeEach(() => {
                req = expressMock.mockRequest();
                values = {
                    hash: faker.random.number().toString(),
                    type,
                };
                req.query = values;
                res = expressMock.mockResponse();
            });

            it(`should check if ${type} exists`, async () => {
                const authController = new AuthController({
                    findOneByActivationHash: jest.fn().mockReturnValue(undefined),
                }, {
                    findOneByActivationHash: jest.fn().mockReturnValue(undefined),
                });

                await authController.getRegistrationVerification(req, res, expressMock.mockNext);

                expect(authController[`${type}Service`].findOneByActivationHash).toHaveBeenCalledTimes(1);
                expect(authController[`${type}Service`].findOneByActivationHash).toHaveBeenCalledWith(values.hash);
                expect(res.send).toHaveBeenCalledTimes(1);
                expect(res.send).toHaveBeenCalledWith(`<h1>${type} not found.</h1>`);
            });

            it(`should check if ${type} activation expiration date has passed`, async () => {
                const authController = new AuthController({
                    findOneByActivationHash: jest.fn().mockReturnValue({
                        activation_expiration_date: new Date(0),
                    }),
                }, {
                    findOneByActivationHash: jest.fn().mockReturnValue({
                        activation_expiration_date: new Date(0),
                    }),
                });

                await authController.getRegistrationVerification(req, res, expressMock.mockNext);

                expect(res.send).toHaveBeenCalledTimes(1);
                expect(res.send).toHaveBeenCalledWith("<h1>Activation expired.</h1>");
            });

            it(`should activate ${type} account`, async () => {
                const authController = new AuthController({
                    findOneByActivationHash: jest.fn().mockReturnValue({
                        activation_expiration_date: new Date(
                            new Date().setHours(new Date().getHours + 1),
                        ),
                        save: jest.fn(),
                    }),
                }, {
                    findOneByActivationHash: jest.fn().mockReturnValue({
                        activation_expiration_date: new Date(
                            new Date().setHours(new Date().getHours + 1),
                        ),
                        save: jest.fn(),
                    }),
                });

                await authController.getRegistrationVerification(req, res, expressMock.mockNext);

                const changes = authController[`${type}Service`].findOneByActivationHash.mock.results[0].value;

                expect(changes.active).toBeTruthy();
                expect(changes.activation_hash).toBeNull();
                expect(changes.activation_expiration_date).toBeNull();
                expect(changes.save).toHaveBeenCalledTimes(1);
                expect(res.send).toHaveBeenCalledTimes(1);
                expect(res.send).toHaveBeenCalledWith(`<h1>${type} has been activated.`);
            });
        });
    });

    describe("getForgotPassword", () => {
        it("should execute with correct attributes", () => {
            const authController = new AuthController();

            const token = "CIwNZNlR4XbisJF39I8yWnWX9wX4WFoz";

            const req = expressMock.mockRequest();
            req.csrfToken = () => token;
            const res = expressMock.mockResponse();

            authController.getForgotPassword(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("modules/auth/forgot-password", { title: "Forgot password", csrf: token });
        });
    });

    describe("postForgotPassword", () => {
        const hash = "somehash";
        let hashSpy;
        const date = new Date();
        let dateSpy;
        beforeAll(() => {
            hashSpy = jest.spyOn(hashGenerator, "default").mockReturnValue(hash);
            dateSpy = jest.spyOn(expirationDateGenerator, "default").mockReturnValue(date);
        });

        afterEach(() => {
            hashSpy.mockClear();
            dateSpy.mockClear();
        });

        let req;
        let values;
        let res;
        beforeEach(() => {
            req = expressMock.mockRequest();
            values = { email: faker.internet.email() };
            req.body = values;
            res = expressMock.mockResponse();
        });

        it("should check if user exists", async () => {
            const authController = new AuthController({}, {
                findOneByEmail: jest.fn().mockReturnValue(undefined),
            }, {
                sendMail: jest.fn(),
            });

            await authController.postForgotPassword(req, res, expressMock.mockNext);

            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Head to your email account and check if message arrived.</h1>");
            expect(authController.userService.findOneByEmail).toHaveBeenCalledTimes(1);
            expect(authController.userService.findOneByEmail).toHaveBeenCalledWith(values.email);
            expect(authController.mailer.sendMail).not.toHaveBeenCalled();
        });

        it("should allow user to change password and send mail", async () => {
            const authController = new AuthController({}, {
                findOneByEmail: jest.fn().mockReturnValue({
                    save: jest.fn().mockReturnThis(),
                    email: values.email,
                }),
            }, {
                sendMail: jest.fn(),
            });

            await authController.postForgotPassword(req, res, expressMock.mockNext);

            const changes = authController.userService.findOneByEmail.mock.results[0].value;

            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Head to your email account and check if message arrived.</h1>");
            expect(changes.password_reset_hash).toEqual(hash);
            expect(changes.password_reset_expiration_date).toEqual(date);
            expect(changes.save).toHaveBeenCalledTimes(1);
            expect(authController.mailer.sendMail).toHaveBeenCalledTimes(1);
            expect(authController.mailer.sendMail).toHaveBeenCalledWith({
                to: values.email,
                subject: "Reset password.",
                text: `You have received this email because of your password reset request.
                    If this was not done by you you can ignore this message.
                    Otherwise click link below.
                    http://localhost:3000/auth/reset-password?hash=${hash}`,
                html: `<h1>You have received this email because of your password reset request.</h1>
                    <p>If this was not done by you you can ignore this message.
                    Otherwise click link below.<p>
                    <a href='http://localhost:3000/auth/reset-password?hash=${hash}'>Reset my password!</a>`,
            });
        });

        afterAll(() => {
            hashSpy.mockRestore();
            dateSpy.mockRestore();
        });
    });

    describe("getResetPassword", () => {
        it("should execute with correct attributes", () => {
            const authController = new AuthController();

            const token = "CIwNZNlR4XbisJF39I8yWnWX9wX4WFoz";

            const req = expressMock.mockRequest();
            req.csrfToken = () => token;
            const res = expressMock.mockResponse();

            authController.getResetPassword(req, res);

            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("modules/auth/reset-password", { title: "Reset password", csrf: token });
        });
    });

    describe("postResetPassword", () => {
        let req;
        let values;
        let res;
        beforeEach(() => {
            req = expressMock.mockRequest();
            values = {
                body: {
                    newPassword: faker.internet.password(),
                },
                query: {
                    hash: faker.random.number().toString(),
                },
            };
            req.body = values.body;
            req.query = values.query;
            res = expressMock.mockResponse();
        });

        it("should check if user exists", async () => {
            const authController = new AuthController({}, {
                findOneByPasswordResetHash: jest.fn().mockReturnValue(undefined),
            });

            await authController.postResetPassword(req, res, expressMock.mockNext);

            expect(authController.userService.findOneByPasswordResetHash).toHaveBeenCalledTimes(1);
            expect(authController.userService.findOneByPasswordResetHash)
                .toHaveBeenCalledWith(values.query.hash);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>No user found by provided hash.</h1>");
        });

        it("should check if password reset expiration date has passed", async () => {
            const authController = new AuthController({}, {
                findOneByPasswordResetHash: jest.fn().mockReturnValue({
                    password_reset_expiration_date: new Date(0),
                }),
            });

            await authController.postResetPassword(req, res, expressMock.mockNext);

            expect(authController.userService.findOneByPasswordResetHash).toHaveBeenCalledTimes(1);
            expect(authController.userService.findOneByPasswordResetHash)
                .toHaveBeenCalledWith(values.query.hash);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Activation expired.</h1>");
        });

        it("should successfully change user password", async () => {
            const argon2HashSpy = jest.spyOn(argon2, "hash").mockImplementation((password) => `argon2-${password}`);

            const authController = new AuthController({}, {
                findOneByPasswordResetHash: jest.fn().mockReturnValue({
                    password_reset_expiration_date: new Date(
                        new Date().setHours(new Date().getHours + 1),
                    ),
                    save: jest.fn(),
                }),
            });

            await authController.postResetPassword(req, res, expressMock.mockNext);

            const changes = authController
                .userService.findOneByPasswordResetHash.mock.results[0].value;

            expect(authController.userService.findOneByPasswordResetHash).toHaveBeenCalledTimes(1);
            expect(authController.userService.findOneByPasswordResetHash)
                .toHaveBeenCalledWith(values.query.hash);
            expect(argon2HashSpy).toHaveBeenCalledTimes(1);
            expect(argon2HashSpy).toHaveBeenCalledWith(values.body.newPassword);
            expect(changes.password).toEqual(`argon2-${values.body.newPassword}`);
            expect(changes.password_reset_hash).toBeNull();
            expect(changes.password_reset_date).toBeNull();
            expect(changes.save).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith("<h1>Password changed successfully.</h1>");

            argon2HashSpy.mockRestore();
        });
    });
};
