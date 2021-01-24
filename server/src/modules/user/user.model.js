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
        User.hasMany(models.category, { foreignKey: { allowNull: false, name: "created_by", type: DataTypes.UUID } });
        User.hasMany(models.userVerification, { foreignKey: { allowNull: false, name: "user_uuid", type: DataTypes.UUID } });
        User.hasMany(models.stocktake, { foreignKey: { allowNull: false, name: "created_by", type: DataTypes.UUID } });
        User.hasMany(models.stocktakeItem, { foreignKey: { allowNull: false, name: "created_by", type: DataTypes.UUID } });
        User.hasMany(models.item, { foreignKey: { allowNull: false, name: "created_by", type: DataTypes.UUID } });

        User.belongsTo(models.company, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
    };

    return User;
};
