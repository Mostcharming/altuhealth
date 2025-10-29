
const config = {
    development: {
        feUrl: "https://api.kolanutafrica.com",
        db: {
            master: {
                host: "192.168.1.165",
                port: 5432,
                username: "postgress",
                password: "Spartan920",
                database: "altuhealth_master",
                dialect: "postgres",
            },
            slave: {
                host: "192.168.1.165",
                port: 5432,
                username: "postgress",
                password: "Spartan920",
                database: "altuhealth_slave",
                dialect: "postgres",
            },
        },
        useSequelizeReplication: true,
    },
    production: {
        feUrl: "https://api.kolanutafrica.com",
        db: {
            master: {
                host: "192.168.1.165",
                port: 5432,
                username: "postgress",
                password: "Spartan920",
                database: "altuhealth",
                dialect: "postgres",
            },
            slave: {
                host: "192.168.1.165",
                port: 5432,
                username: "postgress",
                password: "Spartan920",
                database: "altuhealth",
                dialect: "postgres",
            },
        },
        useSequelizeReplication: true,

    },
};

const currentConfig =
    process.env.NODE_ENV === "production"
        ? config.production
        : config.development;


export default currentConfig;
