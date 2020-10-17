import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import helmet from "helmet";
import { join } from "path";
import csrf from "csurf";

import logger from "../utils/logger.util";
import envConfig from "../config/env.config";

import rateLimiterMiddleware from "../middlewares/rateLimiter.middleware";
import sessionMiddleware from "../middlewares/session.middleware";

import indexRouter from "../modules/index/index.router";
import authRouter from "../modules/auth/auth.router";

const app = express();

if (envConfig.server.environment === "production") {
    app.set("trust proxy", 1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use(rateLimiterMiddleware);
app.use(sessionMiddleware);
app.use(csrf());

app.use(express.static(join(__dirname, "public")));
app.set("views", join(__dirname, "public", "views"));
app.set("view engine", "pug");

app.use("/", indexRouter);
app.use("/auth", authRouter);

const server = createServer(app).listen(envConfig.server.port, () => {
    logger.info(`HTTP server started on port ${envConfig.server.port}.`, { label: "express" });
});

export default server;
