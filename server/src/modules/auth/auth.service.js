import argon2 from "argon2";
import dayjs from "dayjs";

import generateHash from "../../utils/generateHash";
import generateExpirationDate from "../../utils/generateExpirationDate";

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

        const isProvidedPasswordCorrect = await argon2.verify(foundUser.password, providedPassword);
        if (!foundUser || !isProvidedPasswordCorrect) {
            throw new Error({ code: 400, message: "Incorrect email or password." });
        }

        if (!foundUser.active) {
            throw new Error({ code: 409, message: "Account not active." });
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
            throw new Error({ code: 404, message: "We couldn't find your company to verify by provided hash." });
        }

        if (dayjs().isAfter(dayjs(foundEntity.activation_expiration_date))) {
            throw new Error({ code: 409, message: "Your registration verify hash expired. Both owner and company account will be deleted soon." });
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
            throw new Error({ code: 400, message: "No user found by provided email." });
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
            throw new Error({ code: 400, message: "No user found by provided hash." });
        }

        if (dayjs().isAfter(dayjs(foundUser.password_reset_expiration_date))) {
            throw new Error({ code: 409, message: "Password reset hash expired." });
        }

        const hashedPassword = await argon2.hash(providedNewPassword);
        foundUser.password = hashedPassword;
        foundUser.password_reset_hash = null;
        foundUser.password_reset_expiration_date = null;
        await foundUser.save();

        return foundUser;
    }
}
