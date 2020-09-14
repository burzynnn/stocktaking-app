const envConfig = {
    server: {
        port: process.env.SRV_PORT,
        environment: process.env.NODE_ENV,
    },
    postgres: {
        password: process.env.PG_PASSWORD,
    },
    redis: {
        password: process.env.REDIS_PASSWORD,
    },
    sendgrid: {
        api_key: process.env.SENDGRID_API_KEY,
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
