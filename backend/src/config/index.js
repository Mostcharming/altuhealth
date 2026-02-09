const path = require('path');

const config = {
    development: {
        feUrl: process.env.FE_URL,
        adminUrl: "https://admin.altuhealth.com",
        providerUrl: "https://provider.altuhealth.com",
        enrolleeUrl: "https://enrollee.altuhealth.com",
        doctorUrl: "https://doctors.altuhealth.com",
        retailUrl: "https://retail.altuhealth.com",
        db: {
            master: {
                host: process.env.DB_MASTER_HOST,
                port: parseInt(process.env.DB_MASTER_PORT),
                username: process.env.DB_MASTER_USERNAME,
                password: process.env.DB_MASTER_PASSWORD,
                database: process.env.DB_MASTER_DATABASE,
                dialect: "postgres",
            },
            slave: {
                host: process.env.DB_SLAVE_HOST,
                port: parseInt(process.env.DB_SLAVE_PORT),
                username: process.env.DB_SLAVE_USERNAME,
                password: process.env.DB_SLAVE_PASSWORD,
                database: process.env.DB_SLAVE_DATABASE,
                dialect: "postgres",
            },

        },
        uploads: {
            profileDir: path.resolve(__dirname, '..', 'uploads', 'profiles')
        },
        apiVersion: process.env.API_VERSION,
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    },
    production: {
        feUrl: process.env.FE_URL,
        adminUrl: "https://admin.altuhealth.com",
        providerUrl: "https://provider.altuhealth.com",
        enrolleeUrl: "https://enrollee.altuhealth.com",
        doctorUrl: "https://doctors.altuhealth.com",
        retailUrl: "https://retail.altuhealth.com",
        db: {
            master: {
                host: process.env.DB_PROD_MASTER_HOST,
                port: parseInt(process.env.DB_PROD_MASTER_PORT),
                username: process.env.DB_PROD_MASTER_USERNAME,
                password: process.env.DB_PROD_MASTER_PASSWORD,
                database: process.env.DB_PROD_MASTER_DATABASE,
                dialect: "postgres",
            },
            slave: {
                host: process.env.DB_PROD_SLAVE_HOST,
                port: parseInt(process.env.DB_PROD_SLAVE_PORT),
                username: process.env.DB_PROD_SLAVE_USERNAME,
                password: process.env.DB_PROD_SLAVE_PASSWORD,
                database: process.env.DB_PROD_SLAVE_DATABASE,
                dialect: "postgres",
            },
        },
        uploads: {
            profileDir: path.resolve(__dirname, '..', 'uploads', 'profiles')
        },
        apiVersion: process.env.API_VERSION || "v1",
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",


    },
};

const
    currentConfig =
        process.env.NODE_ENV === "production"
            ? config.production
            : config.development;


module.exports = currentConfig;
