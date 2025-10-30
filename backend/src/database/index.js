'use strict';
const { Sequelize } = require('sequelize');


const config = require('./config/config')[process.env.NODE_ENV || 'development'];
const useSequelizeReplication = require('../config').useSequelizeReplication;

let masterSequelize;
let slaveSequelize;
let sequelize;

if (useSequelizeReplication) {
    sequelize = new Sequelize({
        replication: {
            read: config.replication.read,
            write: config.replication.write
        },
        dialect: config.dialect,
        pool: config.pool,
        logging: config.logging
    });
    console.log('⚙️ Sequelize automatic replication mode enabled.');
} else {
    const { write: masterConfig, read: slaveConfigs } = config.replication;

    masterSequelize = new Sequelize({
        database: masterConfig.database,
        username: masterConfig.username,
        password: masterConfig.password,
        host: masterConfig.host,
        port: masterConfig.port,
        dialect: config.dialect,
        pool: config.pool,
        logging: config.logging
    });

    const slaveConfig = Array.isArray(slaveConfigs) ? slaveConfigs[0] : slaveConfigs;

    slaveSequelize = new Sequelize({
        database: slaveConfig.database,
        username: slaveConfig.username,
        password: slaveConfig.password,
        host: slaveConfig.host,
        port: slaveConfig.port,
        dialect: config.dialect,
        pool: config.pool,
        logging: config.logging
    });

    console.log('⚙️ Manual master/slave connection mode enabled.');
}


async function createDatabaseIfNotExists() {
    const writeConfig = config.replication.write;
    const readConfigs = config.replication.read;

    const targets = Array.isArray(readConfigs) ? [writeConfig, ...readConfigs] : [writeConfig, readConfigs];

    const seen = new Set();

    for (const cfg of targets) {
        if (!cfg) continue;

        const key = `${cfg.host}:${cfg.port}:${cfg.database}:${cfg.username}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const tempSequelize = new Sequelize({
            database: 'postgres',
            username: cfg.username,
            password: cfg.password,
            host: cfg.host,
            port: cfg.port,
            dialect: cfg.dialect || config.dialect,
            logging: false
        });

        try {
            const [results] = await tempSequelize.query(
                `SELECT 1 FROM pg_database WHERE datname = '${cfg.database}'`
            );

            if (results.length === 0) {
                await tempSequelize.query(`CREATE DATABASE "${cfg.database}"`);
                console.log(`✅ Database '${cfg.database}' created successfully on ${cfg.host}:${cfg.port}.`);
            } else {
                console.log(`ℹ️  Database '${cfg.database}' already exists on ${cfg.host}:${cfg.port}.`);
            }
        } catch (error) {
            console.error(`❌ Error creating database '${cfg.database}' on ${cfg.host}:${cfg.port}:`, error.message);
            throw error;
        } finally {
            await tempSequelize.close();
        }
    }
}


async function initializeDatabase() {
    try {
        // await createDatabaseIfNotExists();

        if (useSequelizeReplication) {
            await sequelize.authenticate();
            console.log('✅ Database connected successfully with Sequelize replication.');
        } else {
            await masterSequelize.authenticate();
            await slaveSequelize.authenticate();
            console.log('✅ Master and Slave databases connected successfully.');
        }

        console.log(`📝 Master (write): ${config.replication.write.host}:${config.replication.write.port}`);
        config.replication.read.forEach((read, i) => {
            console.log(`📖 Slave ${i + 1} (read): ${read.host}:${read.port}`);
        });


        console.log('🎉 Database initialization complete!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}


function getSequelizeByRequest(method) {
    if (useSequelizeReplication) return sequelize;
    return method.toUpperCase() === 'GET' ? slaveSequelize : masterSequelize;
}

initializeDatabase();

module.exports = {
    sequelize,
    masterSequelize,
    slaveSequelize,
    getSequelizeByRequest,
    createDatabase: createDatabaseIfNotExists,
};
