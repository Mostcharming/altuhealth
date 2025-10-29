'use strict';
const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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

    const tempSequelize = new Sequelize({
        database: 'postgres',
        username: writeConfig.username,
        password: writeConfig.password,
        host: writeConfig.host,
        port: writeConfig.port,
        dialect: writeConfig.dialect || config.dialect,
        logging: false
    });

    try {
        const [results] = await tempSequelize.query(
            `SELECT 1 FROM pg_database WHERE datname = '${writeConfig.database}'`
        );

        if (results.length === 0) {
            await tempSequelize.query(`CREATE DATABASE "${writeConfig.database}"`);
            console.log(`✅ Database '${writeConfig.database}' created successfully.`);
        } else {
            console.log(`ℹ️  Database '${writeConfig.database}' already exists.`);
        }
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        throw error;
    } finally {
        await tempSequelize.close();
    }
}

async function runMigrations() {
    try {
        console.log('🔄 Running migrations...');
        const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate');

        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        console.log('✅ Migrations completed successfully.');
    } catch (error) {
        console.error('❌ Error running migrations:', error.message);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        await createDatabaseIfNotExists();

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

        await runMigrations();

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
    runMigrations
};
