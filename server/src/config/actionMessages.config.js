const DATA = {
    messages: {
        // user
        u: {
            s: {
                "01": "User name changed.",
                "02": "User email changed.",
                "03": "User password changed.",
                "04": "User account activated.",
            },
            i: {
                "01": "We accepted your request to change user name but it doesn't differ from actual one.",
                "02": "We accepted your request to change user email but it doesn't differ from actual one.",
            },
            w: {},
            e: {
                "01": "No user found by provided UUID.",
                "02": "User account has been already registered with provided email.",
                "03": "No user found by provided email.",
            },
        },
        // auth
        a: {
            s: {
                "01": "Account created.",
                "02": "Password changed successfully.",
            },
            i: {
                "01": "Head to both company and user email, verify your credentials and log in!",
                "02": "Successfully logged out.",
                "03": "If you have activated user account, then you can login using it's credentials.",
                "04": "You can log in below.",
                "05": "Head to your email account and check if reset password email arrived. If not you probably used wrong email address.",
                "06": "You can log in now using new password.",
            },
            w: {
                "01": "Due to security reasons we can't confirm that provided email was correct.",
            },
            e: {
                "01": "Incorrect email or password.",
                "02": "Account isn't active.",
                "03": "We couldn't find your account to verify by provided hash.",
                "04": "Your registration verify hash expired. Both owner and company account will be deleted soon.",
                "05": "Password reset hash expired.",
                "06": "Passwords aren't the same.",
                "07": "Account has been already registered with provided email.",
                "08": "We can't verify account of this type.",
            },
        },
        // company
        c: {
            s: {
                "01": "Company name changed.",
                "02": "Company email changed.",
                "03": "Company account activated.",
            },
            i: {
                "01": "We accepted your request to change company name but it doesn't differ from actual one.",
                "02": "We accepted your request to change company email but it doesn't differ from actual one.",
            },
            w: {},
            e: {
                "01": "Company account has been already registered with provided email.",
                "02": "No company found by provided UUID.",
            },
        },
    },
    mapOfResults: {
        s: "Success",
        i: "Information",
        w: "Warning",
        e: "Error",
    },
};

export default class ActionMessages {
    constructor() {
        this.data = DATA;
    }

    convertMessage = (providedCode) => {
        const lowerCode = providedCode.toLowerCase();
        const category = lowerCode.charAt(0);
        const result = lowerCode.charAt(1);
        const id = lowerCode.substr(2);

        const message = this.data.messages?.[category]?.[result]?.[id];

        if (!message) {
            return { type: "Error", text: "Something went wrong." };
        }

        return { type: this.data.mapOfResults[result], text: message };
    }

    convertMessages = (...codes) => codes.map((code) => this.convertMessage(code));
}
