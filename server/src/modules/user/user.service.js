import dayjs from "dayjs";
import { Op } from "sequelize";

class UserService {
    constructor(userModel) {
        this.userModel = userModel;
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
        password_reset_expiration_date: null,
        company_uuid: companyUUID,
        user_type_uuid: userTypeUUID,
    });

    findOneByEmail = (email, attributes) => this.userModel.findOne({
        where: {
            email,
        },
        attributes,
    });

    findOneByPasswordResetHash = (hash, attributes) => this.userModel.findOne({
        where: {
            password_reset_hash: hash,
        },
        attributes,
    });

    findOneByActivationHash = (hash, attributes) => this.userModel.findOne({
        where: {
            activation_hash: hash,
        },
        attributes,
    });

    findOwnerByCompanyUUID = (companyUUID, attributes) => this.userModel.findOne({
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
        attributes,
    });

    findAllExpiredOwners = (attributes) => this.userModel.findAll({
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
        attributes,
    });
}

export default UserService;
