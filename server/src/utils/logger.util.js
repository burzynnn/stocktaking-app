import winston from "winston";

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss | DD-MM-YYYY" }),
        winston.format.printf(({
            level, message, label, timestamp,
        }) => `[${timestamp}] [${label}] - ${level}: \`${message}\``),
    ),
    levels: winston.config.syslog.levels,
    transports: [
        new winston.transports.Console(),
    ],
});

export default logger;
