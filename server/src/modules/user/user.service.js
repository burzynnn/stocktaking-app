import argon2 from "argon2";
import dayjs from "dayjs";
import { Op } from "sequelize";

import generateHash from "../../utils/generateHash";
import generateExpirationDate from "../../utils/generateExpirationDate";
import ProcessingError from "../../utils/processingError";

export default class UserService {
    constructor({ userModel, userTypeModel, companyModel }) {
        this.userModel = userModel;
        this.userTypeModel = userTypeModel;
        this.companyModel = companyModel;
    }

    create = async ({
        email: providedEmail,
        password: providedPassword,
        name: providedName,
        companyUUID: providedCompanyUUID,
        userTypeUUID: providedUserTypeUUID,
    }) => {
        const userDuplicate = await this.userModel.findOne({
            where: {
                email: providedEmail,
            },
            attributes: ["uuid"],
        });

        if (userDuplicate) {
            throw new ProcessingError("ae07");
        }

        const activationHash = await generateHash(128);
        const activationExpirationDate = generateExpirationDate(1);
        const hashedPassword = await argon2.hash(providedPassword);

        const registeredUser = await this.userModel.create({
            name: providedName,
            email: providedEmail,
            password: hashedPassword,
            active: true,
            activation_hash: activationHash,
            activation_expiration_date: activationExpirationDate,
            password_reset_hash: null,
            password_reset_expiration_date: null,
            company_uuid: providedCompanyUUID,
            user_type_uuid: providedUserTypeUUID,
        });

        return registeredUser;
    }

    getOwnerByCompanyUUID = ({ companyUUID: providedUUID }) => this.userModel.findOne({
        where: {
            company_uuid: providedUUID,
        },
        include: {
            association: "user_has_user_type",
            attributes: ["type"],
            where: {
                type: "owner",
            },
        },
        attributes: ["uuid"],
    });

    getAllOwnersWithExpiredActivation = () => this.userModel.findAll({
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

    getUserToEdit = async ({ userUUID: providedUUID }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "name", "email", "createdAt", "company_uuid"],
            include: [{
                model: this.userTypeModel,
                as: "user_has_user_type",
                attributes: ["type"],
            }, {
                model: this.companyModel,
                attributes: ["name"],
            }],
        });

        if (!foundUser) {
            throw new ProcessingError("ue01");
        }

        const {
            name,
            email,
            createdAt,
            user_has_user_type: { type },
            company: { name: companyName },
        } = foundUser;

        const accountCreationDate = dayjs(createdAt).format("HH:mm DD-MM-YYYY");

        return {
            name,
            email,
            accountCreationDate,
            type,
            companyName,
        };
    }

    editUserName = async ({ userUUID: providedUUID, name: providedName }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "name"],
        });

        if (!foundUser) {
            throw new ProcessingError("ue01");
        }
        if (providedName === foundUser.name) {
            throw new ProcessingError("ui01");
        }

        foundUser.name = providedName;
        await foundUser.save();

        return foundUser;
    }

    editUserEmail = async ({ userUUID: providedUUID, email: providedEmail }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "email"],
        });

        if (!foundUser) {
            throw new ProcessingError("ue01");
        }
        if (providedEmail === foundUser.email) {
            throw new ProcessingError("ui02");
        }

        foundUser.email = providedEmail;
        await foundUser.save();

        return foundUser;
    }

    editUserPassword = async ({ userUUID: providedUUID, password: providedPassword }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "password"],
        });

        if (!foundUser) {
            throw new ProcessingError("ue01");
        }

        const hashedPassword = await argon2.hash(providedPassword);
        foundUser.password = hashedPassword;
        await foundUser.save();

        return foundUser;
    }

    isProvidedPasswordCorrect = async ({ userUUID: providedUUID, password: providedPassword }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                uuid: providedUUID,
            },
            attributes: ["uuid", "password"],
        });

        if (!foundUser) {
            throw new ProcessingError("ue01");
        }

        return argon2.verify(foundUser.password, providedPassword);
    }
}
