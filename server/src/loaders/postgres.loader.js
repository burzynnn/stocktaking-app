import Sequelize from "sequelize";

import envConfig from "../config/env.config";
import logger from "../utils/logger.util";

import Category from "../modules/category/category.model";
import Company from "../modules/company/company.model";
import CompanyVerification from "../modules/company_verification/company_verification.model";
import Item from "../modules/item/item.model";
import Stocktake from "../modules/stocktake/stocktake.model";
import StocktakeItem from "../modules/stocktake_item/stocktake_item.model";
import User from "../modules/user/user.model";
import UserVerification from "../modules/user_verification/user_verification.model";

const database = {
    models: {},
};
const models = [
    Category,
    Company,
    CompanyVerification,
    Item,
    Stocktake,
    StocktakeItem,
    User,
    UserVerification,
];

const connection = new Sequelize(`postgres://stocktaking:${envConfig.postgres.password}@postgres:5432/stocktaking`, {
    logging: (msg) => logger.debug(msg, { label: "sequelize" }),
    define: {
        underscored: true,
        timestamps: true,
        freezeTableName: true,
    },
});

// create models
models.forEach((model) => {
    const createdModel = model(connection);
    database.models[createdModel.name] = createdModel;
});

// associate models
Object.values(database.models).forEach((model) => {
    if (typeof model.associate === "function") {
        model.associate(database.models);
    }
});

// rename models
Object.keys(database.models).forEach((key) => {
    database.models[`${key}Model`] = database.models[key];
    delete database.models[key];
});

const initiateDatabase = async ({ force }) => {
    try {
        if (envConfig.server.environment === "production") {
            await connection.sync();
        } else {
            await connection.sync({ force });
        }

        logger.info("Connected to PostgreSQL.", { label: "sequelize" });
    } catch (err) {
        logger.error(`Couldn't connect to PostgreSQL. ${err}`, { label: "sequelize" });
        throw err;
    }
};

export default initiateDatabase;
export const {
    categoryModel,
    companyModel,
    companyVerificationModel,
    itemModel,
    stocktakeModel,
    stocktakeItemModel,
    userModel,
    userVerificationModel,
} = database.models;
