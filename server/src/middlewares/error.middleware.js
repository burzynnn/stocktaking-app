import { isCelebrateError } from "celebrate";

import logger from "../utils/logger.util";

export default class ErrorMiddleware {
    static notFound = (req, res) => res.status(404).send("<h1>Page not found</h1>");

    /* eslint-disable no-unused-vars */
    static exceptionHandler = (err, req, res, next) => {
        if (isCelebrateError(err)) {
            const validationErrors = err.details.get("body").details;

            req.flash("errors", validationErrors);

            return res.redirect("back");
        }

        logger.error(err, { label: "error" });
        return res.status(500).send(err.message);
    }
}
