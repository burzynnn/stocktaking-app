import { RateLimiterRedis } from "rate-limiter-flexible";

import redisClient from "../loaders/redis.loader";
import logger from "../utils/logger.util";

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "ratelimiter",
    points: 1000,
    duration: 3600,
});

const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
        .then((stats) => {
            res.set({
                "X-RateLimit-Limit": stats.remainingPoints + stats.consumedPoints,
                "X-RateLimit-Remaining": stats.remainingPoints,
                "X-RateLimit-Reset": parseInt(stats.msBeforeNext / 1000, 10),
            });
            next();
        })
        .catch(() => {
            // TODO: create pug page
            logger.warning(`User has made too many requests. IP: ${req.ip}`, { label: "rate_limiter" });
            res.status(429).send("Slow down! Too many requests.");
        });
};

export default rateLimiterMiddleware;
