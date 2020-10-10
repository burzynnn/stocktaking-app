import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

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
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    activation_hash: {
        type: DataTypes.CHAR(128),
    },
    activation_expiration_date: {
        type: DataTypes.DATE,
    },
}, {
    sequelize: dbConnection,
    modelName: "company",
    timestamps: true,
});

export default Company;
