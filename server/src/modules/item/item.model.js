import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

class Item extends Model {}

Item.init({
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
    description: {
        type: DataTypes.TEXT,
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: "pcs.",
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
    },
    weight: {
        type: DataTypes.REAL,
    },
    length: {
        type: DataTypes.REAL,
    },
    width: {
        type: DataTypes.REAL,
    },
    height: {
        type: DataTypes.REAL,
    },
    image_file: {
        type: DataTypes.CHAR(128),
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    category_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: dbConnection,
    modelName: "item",
    timestamps: true,
});

export default Item;
