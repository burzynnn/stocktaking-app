import { Op } from "sequelize";
import dayjs from "dayjs";

import generateHash from "../../utils/generateHash";
import generateExpirationDate from "../../utils/generateExpirationDate";
import ProcessingError from "../../utils/processingError";

export default class CompanyService {
    constructor({ companyModel }) {
        this.companyModel = companyModel;
    }

    create = async ({ name: providedName, email: providedEmail }) => {
        const companyDuplicate = await this.companyModel.findOne({
            where: {
                official_email: providedEmail,
            },
            attributes: ["uuid"],
        });

        if (companyDuplicate) {
            throw new ProcessingError("ce01");
        }

        const activationHash = await generateHash(128);
        const activationExpirationDate = generateExpirationDate(1);

        const registeredCompany = await this.companyModel.create({
            name: providedName,
            official_email: providedEmail,
            activation_hash: activationHash,
            activation_expiration_date: activationExpirationDate,
        });

        return registeredCompany;
    }

    getAllWithExpiredActivation = () => this.companyModel.findAll({
        where: {
            activation_expiration_date: {
                [Op.lt]: dayjs().format(),
            },
        },
        attributes: ["uuid"],
    });

    getCompanyToEdit = async ({ companyUUID: providedUUID }) => {
        const foundCompany = await this.companyModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "name", "official_email"],
        });

        if (!foundCompany) {
            throw new ProcessingError("ce02");
        }

        const { name, official_email: email } = foundCompany;

        return { name, email };
    }

    editCompanyName = async ({ companyUUID: providedUUID, name: providedName }) => {
        const foundCompany = await this.companyModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "name"],
        });

        if (!foundCompany) {
            throw new ProcessingError("ce02");
        }
        if (providedName === foundCompany.name) {
            throw new ProcessingError("ci01");
        }

        foundCompany.name = providedName;
        await foundCompany.save();

        return foundCompany;
    }

    editCompanyEmail = async ({ companyUUID: providedUUID, email: providedEmail }) => {
        const foundCompany = await this.companyModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "official_email"],
        });

        if (!foundCompany) {
            throw new ProcessingError("ce02");
        }
        if (providedEmail === foundCompany.official_email) {
            throw new ProcessingError("ci02");
        }

        foundCompany.official_email = providedEmail;
        await foundCompany.save();

        return foundCompany;
    }
}
