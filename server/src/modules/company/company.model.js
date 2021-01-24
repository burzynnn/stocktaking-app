import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const Company = databaseConnection.define("company", {
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
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    });

    Company.associate = (models) => {
        Company.hasOne(models.companyVerification, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
        Company.hasMany(models.category, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
        Company.hasMany(models.user, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
        Company.hasMany(models.stocktake, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
    };

    return Company;
};
