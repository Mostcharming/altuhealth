const { getSequelizeByRequest, masterSequelize, slaveSequelize } = require('../../database');
const defineModels = require('../../database/models');

// Cache models for master and slave instances
let masterModels = null;
let slaveModels = null;

function dbSelector(req, res, next) {
    try {
        const sequelizeInstance = getSequelizeByRequest(req.method);

        if (!sequelizeInstance) {
            throw new Error('Sequelize instance not found');
        }

        // Use cached models if available, otherwise define them
        if (sequelizeInstance === masterSequelize) {
            if (!masterModels) {
                masterModels = defineModels(masterSequelize);
            }
            req.models = masterModels;
        } else if (sequelizeInstance === slaveSequelize) {
            if (!slaveModels) {
                slaveModels = defineModels(slaveSequelize);
            }
            req.models = slaveModels;
        } else {
            req.models = defineModels(sequelizeInstance);
        }

        req.db = sequelizeInstance;

        if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 Using ${req.method === 'GET' ? 'slave' : 'master'} database for ${req.method} ${req.originalUrl}`);
        }

        next();
    } catch (error) {
        console.error('❌ Database selection middleware error:', error.message);
        res.status(500).json({ error: 'Database connection error' });
    }
}

module.exports = dbSelector;
