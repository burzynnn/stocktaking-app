import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const User = databaseConnection.define("user", {
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
        type: {
            type: DataTypes.ENUM("owner", "user"),
            allowNull: false,
            defaultValue: "user",
        },
    });

    User.associate = (models) => {
        User.hasMany(models.category, { foreignKey: { name: "created_by", allowNull: false } });
        User.hasMany(models.userVerification, { foreignKey: { allowNull: false } });
        User.hasMany(models.stocktake, { foreignKey: { name: "created_by", allowNull: false } });
        User.hasMany(models.stocktakeItem, { foreignKey: { name: "created_by", allowNull: false } });
        User.hasMany(models.item, { foreignKey: { name: "created_by", allowNull: false } });

        User.belongsTo(models.company, { foreignKey: { allowNull: false } });
    };

    return User;
};
