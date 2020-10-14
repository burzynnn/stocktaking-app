import Company from "./company/company.model";
import User from "./user/user.model";
import UserType from "./user_type/user_type.model";
import Stocktake from "./stocktake/stocktake.model";
import StocktakeItem from "./stocktake_item/stocktake_item.model";
import Item from "./item/item.model";
import Category from "./category/category.model";

import generateForeignKeyOptions from "../utils/generateForeignKeyOptions";

// options[from][to]
const options = {
    company: {
        user: generateForeignKeyOptions("company_uuid"),
    },
    user: {
        user_type: generateForeignKeyOptions("created_by", true),
        stocktake: generateForeignKeyOptions("created_by"),
        item: generateForeignKeyOptions("created_by"),
        category: generateForeignKeyOptions("created_by"),
    },
    category: {
        item: generateForeignKeyOptions("category_uuid", true),
    },
    item: {
        stocktake_item: generateForeignKeyOptions("item_uuid"),
    },
    stocktake: {
        stocktake_item: generateForeignKeyOptions("stocktake_uuid"),
    },
    user_type: {
        user: generateForeignKeyOptions("user_type_uuid"),
    },
};

export default () => {
    Company.hasMany(User, { foreignKey: options.company.user });
    User.belongsTo(Company, { foreignKey: options.company.user });

    User.hasMany(UserType, { foreignKey: options.user.user_type, as: "user_creates_user_types" });
    UserType.belongsTo(User, { foreignKey: options.user.user_type, as: "user_type_is_created_by_user" });
    UserType.hasMany(User, { foreignKey: options.user_type.user, constraints: false, as: "user_type_is_used_by_users" });
    User.belongsTo(UserType, { foreignKey: options.user_type.user, constraints: false, as: "user_has_user_type" });

    User.hasMany(Stocktake, { foreignKey: options.user.stocktake });
    Stocktake.belongsTo(User, { foreignKey: options.user.stocktake });

    User.hasMany(Item, { foreignKey: options.user.item });
    Item.belongsTo(User, { foreignKey: options.user.item });

    User.hasMany(Category, { foreignKey: options.user.category });
    Category.belongsTo(User, { foreignKey: options.user.category });

    Category.hasMany(Item, { foreignKey: options.category.item });
    Item.belongsTo(Category, { foreignKey: options.category.item });

    Item.hasMany(StocktakeItem, { foreignKey: options.item.stocktake_item });
    StocktakeItem.belongsTo(Item, { foreignKey: options.item.stocktake_item });

    Stocktake.hasMany(StocktakeItem, { foreignKey: options.stocktake.stocktake_item });
    StocktakeItem.belongsTo(Stocktake, { foreignKey: options.stocktake.stocktake_item });
};
