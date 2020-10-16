const envConfig = {
    server: {
        port: process.env.SRV_PORT,
        environment: process.env.NODE_ENV,
        session_secret: process.env.SRV_SESSION_SECRET,
    },
    postgres: {
        password: process.env.POSTGRES_CUSTOM_USER_PASSWORD,
    },
    redis: {
        password: process.env.REDIS_PASSWORD,
    },
    sendgrid: {
        api_key: process.env.SENDGRID_API_KEY,
        send_from: process.env.SENGRID_SEND_FROM,
    },
};

Object.keys(envConfig).forEach((category) => {
    Object.keys(envConfig[category]).forEach((secret) => {
        if (envConfig[category][secret] === undefined) {
            throw new Error(`${category}.${secret} has no value assigned.`);
        }
    });
});

export default envConfig;
