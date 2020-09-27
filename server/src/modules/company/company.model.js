import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

import User from "../user/user.model";

import generateForeignKeyOptions from "../../utils/generateForeignKeyOptions";

class Company extends Model {}

Company.init({
    uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    official_email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: dbConnection,
    modelName: "company",
    timestamps: true,
});

const fKOptions = generateForeignKeyOptions("company_uuid");

Company.hasMany(User, { foreignKey: fKOptions, sourceKey: "uuid" });
User.belongsTo(Company, { foreignKey: fKOptions, targetKey: "uuid" });

export default Company;
