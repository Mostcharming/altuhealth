'use strict';
const { Sequelize } = require('sequelize');
const config = require('./config/config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully.'))
    .catch(err => console.error('❌ Unable to connect to the database:', err));

module.exports = sequelize;
