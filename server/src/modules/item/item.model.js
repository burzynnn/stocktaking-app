import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const Item = databaseConnection.define("item", {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidV4(),
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
    });

    Item.associate = (models) => {
        Item.hasMany(models.stocktakeItem, { foreignKey: { allowNull: false } });

        Item.belongsTo(models.category, { foreignKey: { allowNull: false } });
        Item.belongsTo(models.user, { foreignKey: { name: "created_by", allowNull: false } });
    };

    return Item;
};
