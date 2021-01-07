import argon2 from "argon2";
import dayjs from "dayjs";

import generateHash from "../../utils/generateHash";
import generateExpirationDate from "../../utils/generateExpirationDate";
import ProcessingError from "../../utils/processingError";

export default class AuthService {
    constructor({ userModel, companyModel }) {
        this.userModel = userModel;
        this.companyModel = companyModel;
    }

    logIn = async ({ email: providedEmail, password: providedPassword }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                email: providedEmail,
            },
            attributes: ["uuid", "name", "password", "active", "company_uuid", "user_type_uuid"],
        });
        if (!foundUser) {
            throw new ProcessingError("ae01");
        }

        const isProvidedPasswordCorrect = await argon2.verify(foundUser.password, providedPassword);
        if (!isProvidedPasswordCorrect) {
            throw new ProcessingError("ae01");
        }

        if (!foundUser.active) {
            throw new ProcessingError("ae02");
        }

        const typeOfUser = await foundUser.getUser_has_user_type();

        return {
            loggedIn: true,
            userUUID: foundUser.uuid,
            userName: foundUser.name,
            userCompanyUUID: foundUser.company_uuid,
            userType: typeOfUser.type,
        };
    }

    verifyRegistration = async (model, { activationHash: providedActivationHash }) => {
        const foundEntity = await this[model].findOne({
            where: {
                activation_hash: providedActivationHash,
            },
            attributes: ["uuid", "active", "activation_hash", "activation_expiration_date"],
        });

        if (!foundEntity) {
            throw new ProcessingError("ae03");
        }

        if (dayjs().isAfter(dayjs(foundEntity.activation_expiration_date))) {
            throw new ProcessingError("ae04");
        }

        foundEntity.active = true;
        foundEntity.activation_hash = null;
        foundEntity.activation_expiration_date = null;
        await foundEntity.save();

        return foundEntity;
    }

    companyVerifyRegistration = ({ activationHash }) => this.verifyRegistration(
        "companyModel",
        { activationHash },
    );

    userVerifyRegistration = ({ activationHash }) => this.verifyRegistration(
        "userModel",
        { activationHash },
    );

    userInitiatePasswordReset = async ({ email: providedEmail }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                email: providedEmail,
            },
            attributes: ["uuid", "email"],
        });

        if (!foundUser) {
            throw new ProcessingError("ue03");
        }

        const passwordResetHash = await generateHash(128);
        const passwordResetExpirationDate = await generateExpirationDate(1);

        foundUser.password_reset_hash = passwordResetHash;
        foundUser.password_reset_expiration_date = passwordResetExpirationDate;

        await foundUser.save();

        return foundUser;
    }

    userResetPassword = async ({
        hash: providedPasswordResetHash,
        password: providedNewPassword,
    }) => {
        const foundUser = await this.userModel.findOne({
            where: {
                password_reset_hash: providedPasswordResetHash,
            },
            attributes: ["uuid", "password", "password_reset_hash", "password_reset_expiration_date"],
        });

        if (!foundUser) {
            throw new ProcessingError("ue03");
        }

        if (dayjs().isAfter(dayjs(foundUser.password_reset_expiration_date))) {
            throw new ProcessingError("ae05");
        }

        const hashedPassword = await argon2.hash(providedNewPassword);
        foundUser.password = hashedPassword;
        foundUser.password_reset_hash = null;
        foundUser.password_reset_expiration_date = null;
        await foundUser.save();

        return foundUser;
    }
}
