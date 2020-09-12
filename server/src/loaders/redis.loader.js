import Redis from "ioredis";

import envConfig from "../config/env.config";
import logger from "../utils/logger.util";

// TODO: create connect/reconnect strategy
const redisClient = new Redis({
    host: "redis", port: 6379, username: "stocktaking", password: envConfig.redis.password,
});

redisClient.on("ready", () => logger.info("Connected to Redis.", { label: "redis" }));
redisClient.on("error", (err) => logger.error(`Coulnd't connect to Redis. ${err}`, { label: "redis" }));

export default redisClient;
