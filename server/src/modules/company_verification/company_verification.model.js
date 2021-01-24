import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const CompanyVerification = databaseConnection.define("companyVerification", {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidV4(),
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM("activation"),
            allowNull: false,
        },
        hash: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: "company_verification",
    });

    CompanyVerification.associate = (models) => {
        CompanyVerification.belongsTo(models.company, { foreignKey: { allowNull: false, name: "company_uuid", type: DataTypes.UUID } });
    };

    return CompanyVerification;
};
