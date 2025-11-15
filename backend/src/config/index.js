const path = require('path');

const config = {
    development: {
        feUrl: "https://api.kolanutafrica.com",
        db: {
            master: {
                host: "192.168.43.226",
                port: 5432,
                username: "postgres",
                password: "Spartan920",
                database: "altuhealth_master",
                dialect: "postgres",
            },
            slave: {
                host: "192.168.43.226",
                port: 5432,
                username: "postgres",
                password: "Spartan920",
                database: "altuhealth_master",
                dialect: "postgres",
            },
        },
        uploads: {
            // absolute path where uploaded profile images will be stored
            profileDir: path.resolve(__dirname, '..', 'uploads', 'profiles')
        },
        apiVersion: "v1",
        jwtSecret: "altuHealth-jwt-secret",
        jwtExpiresIn: "1d",
    },
    production: {
        feUrl: "https://api.kolanutafrica.com",
        db: {
            master: {
                host: "192.168.1.165",
                port: 5432,
                username: "postgres",
                password: "Spartan920",
                database: "altuhealth",
                dialect: "postgres",
            },
            slave: {
                host: "192.168.1.165",
                port: 5432,
                username: "postgres",
                password: "Spartan920",
                database: "altuhealth",
                dialect: "postgres",
            },
        },
        uploads: {
            // absolute path where uploaded profile images will be stored
            profileDir: path.resolve(__dirname, '..', 'uploads', 'profiles')
        },
        apiVersion: "v1",
        jwtSecret: "altuHealth-jwt-secret",
        jwtExpiresIn: "1d",


    },
};

const currentConfig =
    process.env.NODE_ENV === "production"
        ? config.production
        : config.development;


module.exports = currentConfig;
