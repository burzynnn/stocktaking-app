import { DataTypes } from "sequelize";

const { UUID } = DataTypes;

const generateForeignKeyOptions = (name, allowNull = false) => ({ name, type: UUID, allowNull });

export default generateForeignKeyOptions;
