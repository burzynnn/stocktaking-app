import { Model, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import dbConnection from "../../loaders/postgres.loader";

class StocktakeItem extends Model {}

StocktakeItem.init({
    uuid: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true,
    },
    quantity: {
        type: DataTypes.NUMERIC(131072, 2),
        allowNull: false,
    },
    item_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    stocktake_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: dbConnection,
    modelName: "stocktake_item",
    timestamps: true,
});

export default StocktakeItem;
