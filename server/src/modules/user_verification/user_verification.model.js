import { v4 as uuidV4 } from "uuid";
import { DataTypes } from "sequelize";

export default (databaseConnection) => {
    const UserVerification = databaseConnection.define("userVerification", {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidV4(),
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM("activation", "email_confirmation", "password_reset"),
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
        tableName: "user_verification",
    });

    UserVerification.associate = (models) => {
        UserVerification.belongsTo(models.user, { foreignKey: { allowNull: false, name: "user_uuid", type: DataTypes.UUID } });
    };

    return UserVerification;
};
