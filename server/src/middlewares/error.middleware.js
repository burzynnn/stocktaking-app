import { isCelebrateError } from "celebrate";

import logger from "../utils/logger.util";

export default class ErrorMiddleware {
    static notFound = (req, res) => res.status(404).send("<h1>Page not found</h1>");

    /* eslint-disable no-unused-vars */
    static exceptionHandler = (err, req, res, next) => {
        if (isCelebrateError(err)) {
            const validationErrors = err.details;

            const errors = {
                body: validationErrors.get("body")?.details,
                query: validationErrors.get("query")?.details,
                params: validationErrors.get("params")?.details,
            };

            /* eslint-disable-next-line no-underscore-dangle */
            delete req.body._csrf;
            delete req.body.password;
            delete req.body.newPassword;
            delete req.body.userPassword;
            delete req.body.repeatPassword;
            delete req.body.repeatNewPassword;
            delete req.body.repeatUserPassword;
            req.flash("inputs", req.body);
            req.flash("errors", errors);

            return res.redirect("back");
        }
        if (err.name === "ProcessingError") {
            req.flash("messages", err.causes);
            return res.redirect("back");
        }

        logger.error(err, { label: "error" });
        return res.status(500).send(err.message);
    }
}
