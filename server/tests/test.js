import authControllerTests from "../src/modules/auth/auth.controller.test";

import userServiceTests from "../src/modules/user/user.service.test";
import userControllerTests from "../src/modules/user/user.controller.test";

import companyServiceTests from "../src/modules/company/company.service.test";
import companyControllerTests from "../src/modules/company/company.controller.test";

describe("unit tests", () => {
    describe("auth", () => {
        describe("controller", () => {
            authControllerTests();
        });
    });

    describe("category", () => {

    });

    describe("company", () => {
        describe("controller", () => {
            companyControllerTests();
        });
        describe("service", () => {
            companyServiceTests();
        });
    });

    describe("item", () => {

    });

    describe("stocktake", () => {

    });

    describe("stocktake_item", () => {

    });

    describe("user", () => {
        describe("controller", () => {
            userControllerTests();
        });
        describe("service", () => {
            userServiceTests();
        });
    });

    describe("user_type", () => {

    });
});

describe("integration tests", () => {

});

describe("e2e tests", () => {

});
