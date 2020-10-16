import session from "express-session";
import connectRedis from "connect-redis";

import redisClients from "../loaders/redis.loader";
import envConfig from "../config/env.config";

const RedisStore = connectRedis(session);

export default session({
    name: "stocktaking.sid",
    store: new RedisStore({ client: redisClients.sessions }),
    secret: envConfig.server.session_secret,
    cookie: {
        httpOnly: true,
        secure: envConfig.server.environment === "production",
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    saveUninitialized: false,
    resave: false,
    rolling: true,
});
