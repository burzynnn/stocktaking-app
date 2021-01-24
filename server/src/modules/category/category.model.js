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
        Category.hasMany(models.item, { foreignKey: { allowNull: false, name: "category_uuid", type: DataTypes.UUID } });

        Category.belongsTo(models.company, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
        Category.belongsTo(models.user, { foreignKey: { allowNull: false, name: "created_by", type: DataTypes.UUID } });
    };

    return Category;
};
