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

    findOneByEmail = (email, attributes) => this.companyModel.findOne({
        where: {
            official_email: email,
        },
        attributes,
    });

    findOneByActivationHash = (hash, attributes) => this.companyModel.findOne({
        where: {
            activation_hash: hash,
        },
        attributes,
    });

    findAllExpired = (attributes) => this.companyModel.findAll({
        where: {
            activation_expiration_date: {
                [Op.lt]: dayjs().format(),
            },
        },
        attributes,
    });
}

export default CompanyService;
