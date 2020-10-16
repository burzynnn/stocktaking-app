import dayjs from "dayjs";
import { Op } from "sequelize";

import userModel from "./user.model";

class UserService {
    constructor(uM) {
        this.userModel = uM;
    }

    create = ({
        name,
        email,
        password,
        hash,
        timestamp,
        companyUUID,
        userTypeUUID,
    }) => this.userModel.create({
        name,
        email,
        password,
        active: false,
        activation_hash: hash,
        activation_expiration_date: timestamp,
        password_reset_hash: null,
        password_reset_date: null,
        company_uuid: companyUUID,
        user_type_uuid: userTypeUUID,
    });

    findOneByEmail = (email) => this.userModel.findOne({
        where: {
            email,
        },
        include: {
            association: "user_has_user_type",
            attributes: ["uuid"],
        },
        attributes: ["uuid", "email", "password", "active"],
    });

    findOneByActivationHash = (hash) => this.userModel.findOne({
        where: {
            activation_hash: hash,
        },
        attributes: ["uuid", "active", "activation_hash", "activation_expiration_date"],
    });

    findOwnerByCompanyUUID = (companyUUID) => this.userModel.findOne({
        where: {
            company_uuid: companyUUID,
        },
        include: {
            association: "user_has_user_type",
            attributes: ["type"],
            where: {
                type: "owner",
            },
        },
        attributes: ["uuid", "company_uuid"],
    });

    findAllExpiredOwners = () => this.userModel.findAll({
        where: {
            activation_expiration_date: {
                [Op.lt]: dayjs().format(),
            },
        },
        include: {
            association: "user_has_user_type",
            attributes: ["type"],
            where: {
                type: "owner",
            },
        },
        attributes: ["uuid", "company_uuid"],
    });
}

export default new UserService(userModel);
