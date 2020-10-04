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
                force: true,
            });
        }
        await dbConnection.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_uuid_fkey;ALTER TABLE users ADD CONSTRAINT users_user_type_uuid_fkey FOREIGN KEY (user_type_uuid) REFERENCES user_types (uuid)");
    })
    // TODO: exit on connection issues
    .catch((err) => logger.error(`Couldn't connect to PostgreSQL. ${err}`, { label: "sequelize" }));

export default dbConnection;
