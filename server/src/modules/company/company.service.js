import { Op } from "sequelize";
import dayjs from "dayjs";

class CompanyService {
    constructor(companyModel) {
        this.companyModel = companyModel;
    }

    findAll = () => this.companyModel.findAll();

    create = ({
        name,
        email,
        hash,
        timestamp,
    }) => this.companyModel.create({
        name,
        official_email: email,
        activation_hash: hash,
        activation_expiration_date: timestamp,
    });

    findOneByEmail = (email) => this.companyModel.findOne({
        where: {
            official_email: email,
        },
        attributes: ["official_email"],
    });

    findOneByActivationHash = (hash) => this.companyModel.findOne({
        where: {
            activation_hash: hash,
        },
        attributes: ["uuid", "active", "activation_hash", "activation_expiration_date"],
    });

    findAllExpired = () => this.companyModel.findAll({
        where: {
            activation_expiration_date: {
                [Op.lt]: dayjs().format(),
            },
        },
        attributes: ["uuid", "activation_expiration_date"],
    });
}

export default CompanyService;
