import { Sequelize } from "sequelize";

import envConfig from "../config/env.config";
import logger from "../utils/logger.util";

const dbConnection = new Sequelize(`postgres://stocktaking:${envConfig.postgres.password}@postgres:5432/stocktaking`, {
    logging: (msg) => logger.debug(msg, { label: "sequelize" }),
});

dbConnection
    .authenticate()
    .then(async () => {
        logger.info("Connected to PostgreSQL.", { label: "sequelize" });
        if (envConfig.server.environment === "production") {
            await dbConnection.sync();
        } else {
            await dbConnection.sync({
                // set to false in case you don't want to rebuild tables
                alter: true,
            });
        }
    })
    // TODO: exit on connection issues
    .catch((err) => logger.error(`Couldn't connect to PostgreSQL. ${err}`, { label: "sequelize" }));

export default dbConnection;
