import Redis from "ioredis";

import envConfig from "../config/env.config";
import logger from "../utils/logger.util";

// TODO: create connect/reconnect strategy
const redisClients = {
    sessions: new Redis({
        host: "redis", port: 6379, username: "stocktaking", password: envConfig.redis.password, enableOfflineQueue: false, db: 0,
    }),
    rateLimiting: new Redis({
        host: "redis", port: 6379, username: "stocktaking", password: envConfig.redis.password, enableOfflineQueue: false, db: 1,
    }),
};

Object.entries(redisClients).forEach(([type, client]) => {
    client.on("ready", () => logger.info("Connected to Redis.", { label: `redis-${type}` }));
    client.on("error", (err) => logger.error(`Couldn't connect to Redis. ${err}`, { label: `redis-${type}` }));
});

export default redisClients;
