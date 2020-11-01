import { isCelebrateError } from "celebrate";

import logger from "../utils/logger.util";

export default class ErrorMiddleware {
    static notFound = (req, res) => res.status(404).send("<h1>Page not found</h1>");

    /* eslint-disable no-unused-vars */
    static exceptionHandler = (err, req, res, next) => {
        if (isCelebrateError(err)) {
            const validationErrors = err.details;

            if (validationErrors.has("query")) {
                let message = "";
                validationErrors.get("query").details.forEach((e) => { message += `Query parameter ${e.message}. `; });
                return res.status(400).send(message);
            }

            /* eslint-disable-next-line no-underscore-dangle */
            delete req.body._csrf;
            req.flash("inputs", req.body);
            req.flash("errors", validationErrors.get("body").details);

            return res.status(422).redirect("back");
        }

        logger.error(err, { label: "error" });
        return res.status(500).send(err.message);
    }
}
