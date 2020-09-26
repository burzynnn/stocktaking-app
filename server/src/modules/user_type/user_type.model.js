import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

class UserType extends Model {}

UserType.init({
    uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.CHAR,
        allowNull: false,
        unique: true,
    },
    created_by: {
        type: DataTypes.UUID,
    },
}, {
    sequelize: dbConnection,
    modelName: "user_type",
    timestamps: true,
});

export default UserType;
