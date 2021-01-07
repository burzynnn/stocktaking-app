import faker from "faker";

import UserController from "./user.controller";
import ActionMessages from "../../config/actionMessages.config";

import expressMock from "../../../tests/utils/mock";

export default () => {
    const csrfToken = "x7pk4sswhn";

    describe("getSelfUser", () => {
        it("should fetch user data, then render", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                name: faker.name.firstName(),
            };

            const userController = new UserController({
                userService: {
                    getUserToEdit: jest.fn().mockReturnValue(userData),
                },
            });

            const req = expressMock.mockRequest();
            req.session = {
                userUUID: userData.uuid,
            };
            req.csrfToken = () => csrfToken;
            req.flash = (type) => (type === "errors" ? [[]] : []);
            const res = expressMock.mockResponse();

            await userController.getSelfUser(req, res);

            expect(userController.userService.getUserToEdit).toHaveBeenCalledTimes(1);
            expect(userController.userService.getUserToEdit).toHaveBeenCalledWith({
                userUUID: userData.uuid,
            });
            expect(res.render).toHaveBeenCalledTimes(1);
            expect(res.render).toHaveBeenCalledWith("user/me", {
                title: userData.name,
                csrf: csrfToken,
                inputs: userData,
                errors: [],
                messages: [],
            });
        });
    });

    describe("postEditUserName", () => {
        it("should edit user name, then redirect", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                name: faker.name.firstName(),
            };

            const userController = new UserController({
                userService: {
                    editUserName: jest.fn().mockReturnValue(userData),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.session = {
                userUUID: userData.uuid,
            };
            req.body = {
                name: userData.name,
            };
            const res = expressMock.mockResponse();
            res.locals = {
                userData: {
                    userName: "",
                },
            };

            await userController.postEditUserName(req, res);

            expect(req.session.userName).toMatch(userData.name);
            expect(res.locals.userData.userName).toMatch(userData.name);
            expect(userController.userService.editUserName).toHaveBeenCalledTimes(1);
            expect(userController.userService.editUserName).toHaveBeenCalledWith({
                userUUID: userData.uuid,
                name: userData.name,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "User name changed." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard/users/me");
        });
    });

    describe("postEditUserEmail", () => {
        it("should edit user email, then redirect", async () => {
            const userData = {
                uuid: faker.random.uuid(),
                email: faker.internet.email(),
            };

            const userController = new UserController({
                userService: {
                    editUserEmail: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.session = {
                userUUID: userData.uuid,
            };
            req.body = {
                email: userData.email,
            };
            const res = expressMock.mockResponse();

            await userController.postEditUserEmail(req, res);

            expect(userController.userService.editUserEmail).toHaveBeenCalledTimes(1);
            expect(userController.userService.editUserEmail).toHaveBeenCalledWith({
                userUUID: userData.uuid,
                email: userData.email,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "User email changed." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard/users/me");
        });
    });

    describe("postEditUserPassword", () => {
        it("should check if passwords are different", async () => {
            const userData = {
                password: faker.internet.password(),
                repeatPassword: faker.internet.password(),
                uuid: faker.random.uuid(),
            };

            const userController = new UserController({
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.session = {
                userUUID: userData.uuid,
            };
            req.body = {
                password: userData.password,
                repeatPassword: userData.repeatPassword,
            };
            const res = expressMock.mockResponse();

            await userController.postEditUserPassword(req, res);

            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Error", text: "Passwords aren't the same." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard/users/me");
        });

        it("should edit user password, then redirect", async () => {
            const password = faker.internet.password();
            const userData = {
                password,
                repeatPassword: password,
                uuid: faker.random.uuid(),
            };

            const userController = new UserController({
                userService: {
                    editUserPassword: jest.fn(),
                },
                actionMessages: new ActionMessages(),
            });

            const req = expressMock.mockRequest();
            req.flash = jest.fn();
            req.session = {
                userUUID: userData.uuid,
            };
            req.body = {
                password: userData.password,
                repeatPassword: userData.repeatPassword,
            };
            const res = expressMock.mockResponse();

            await userController.postEditUserPassword(req, res);

            expect(userController.userService.editUserPassword).toHaveBeenCalledTimes(1);
            expect(userController.userService.editUserPassword).toHaveBeenCalledWith({
                userUUID: userData.uuid,
                password: userData.password,
            });
            expect(req.flash).toHaveBeenCalledTimes(1);
            expect(req.flash).toHaveBeenCalledWith("messages", [{ type: "Success", text: "User password changed." }]);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/dashboard/users/me");
        });
    });
};
