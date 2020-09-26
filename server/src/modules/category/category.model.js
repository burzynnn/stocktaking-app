import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

class Category extends Model {}

Category.init({
    uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(35),
        allowNull: false,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: dbConnection,
    modelName: "category",
    timestamps: true,
});

export default Category;
