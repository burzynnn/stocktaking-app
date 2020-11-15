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
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    sequelize: dbConnection,
    modelName: "user_type",
    timestamps: true,
});

UserType.afterSync(async () => {
    const types = [["owner", "b8c2301c-ac75-4aa5-86ba-0d70956a59ea"], ["user", "d82f1c04-36ce-40ba-b3eb-45cf2fc18617"]];
    types.forEach(async (type) => {
        try {
            const [name, uuid] = type;
            await UserType.findOrCreate({
                where: { uuid },
                defaults: { uuid, type: name },
            });
        } catch (err) {
            throw new Error(`Error happened while inserting pre-defined user types. ${err}`);
        }
    });
});

export default UserType;
