import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const Stocktake = databaseConnection.define("stocktake", {
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
        finished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    });

    Stocktake.associate = (models) => {
        Stocktake.hasMany(models.stocktakeItem, { foreignKey: { allowNull: false, name: "stocktake_uuid", type: DataTypes.UUID } });

        Stocktake.belongsTo(models.company, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
        Stocktake.belongsTo(models.user, { foreignKey: { allowNull: false, name: "created_by", type: DataTypes.UUID } });
    };

    return Stocktake;
};
