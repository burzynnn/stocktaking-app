import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

class User extends Model {}

User.init({
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
    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    password_reset_hash: {
        type: DataTypes.CHAR(128),
    },
    password_reset_date: {
        type: DataTypes.DATE,
    },
    user_type_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: dbConnection,
    modelName: "user",
    timestamps: true,
});

export default User;
