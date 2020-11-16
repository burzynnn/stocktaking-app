export default {
    authenticate: (req, res, next) => {
        if (req.session.loggedIn) {
            const {
                loggedIn, userUUID, userName, userCompanyUUID, userType,
            } = req.session;
            res.locals.userData = {
                loggedIn, userUUID, userName, userCompanyUUID, userType,
            };
            res.locals.pageData = {
                path: req.baseUrl + req.path,
            };

            return next();
        }
        return res.redirect("/auth/login");
    },

    isOwner: (req, res, next) => {
        if (req.session.userType === "owner") {
            return next();
        }
        return res.send("You are not allowed to see this page.");
    },
};
