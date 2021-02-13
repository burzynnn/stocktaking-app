import Validator from "../../utils/validator.util";

const companyValidator = new Validator({
    postChangeName: {
        body: {
            name: Validator.commonFields.companyName,
        },
    },

    postChangeEmail: {
        body: {
            email: Validator.commonFields.email,
        },
    },
});

export default companyValidator.proxy;
