import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const StocktakeItem = databaseConnection.define("stocktakeItem", {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidV4(),
            allowNull: false,
            unique: true,
        },
        quantity: {
            type: DataTypes.NUMERIC(1000, 2),
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
        tableName: "stocktake_item",
    });

    StocktakeItem.associate = (models) => {
        StocktakeItem.belongsTo(models.stocktake, { foreignKey: { allowNull: false } });
        StocktakeItem.belongsTo(models.user, { foreignKey: { name: "created_by", allowNull: false } });
        StocktakeItem.belongsTo(models.item, { foreignKey: { allowNull: false } });
    };

    return StocktakeItem;
};
