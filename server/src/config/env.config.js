const envConfig = {
    server: {
        port: process.env.SRV_PORT,
        environment: process.env.NODE_ENV,
        session_secret: process.env.SRV_SESSION_SECRET,
        domain: process.env.SRV_DOMAIN,
        ssl: process.env.SRV_SSL,
    },
    postgres: {
        password: process.env.POSTGRES_CUSTOM_USER_PASSWORD,
    },
    redis: {
        password: process.env.REDIS_PASSWORD,
    },
    sendgrid: {
        api_key: process.env.SENDGRID_API_KEY,
        sender_email: process.env.SENDGRID_SENDER_EMAIL,
    },
};

Object.keys(envConfig).forEach((category) => {
    Object.keys(envConfig[category]).forEach((secret) => {
        if (envConfig[category][secret] === undefined) {
            throw new Error(`${category}.${secret} has no value assigned.`);
        }
    });
});

envConfig.server.url = `http${envConfig.server.ssl === "true" ? "s" : ""}://${envConfig.server.domain}${envConfig.server.port === "80" ? "" : `:${envConfig.server.port}`}`;

export default envConfig;
