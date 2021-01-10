import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const Category = databaseConnection.define("category", {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidV4(),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(35),
            allowNull: false,
        },
    });

    Category.associate = (models) => {
        Category.hasMany(models.item, { foreignKey: { allowNull: false } });

        Category.belongsTo(models.company, { foreignKey: { allowNull: false } });
        Category.belongsTo(models.user, { foreignKey: { name: "created_by", allowNull: false } });
    };

    return Category;
};
