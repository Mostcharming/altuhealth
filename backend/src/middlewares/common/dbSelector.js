const { getSequelizeByRequest } = require('../../database');
const defineModels = require('../../database/models');

function dbSelector(req, res, next) {
    try {
        const sequelizeInstance = getSequelizeByRequest(req.method);

        if (!sequelizeInstance) {
            throw new Error('Sequelize instance not found');
        }

        req.db = sequelizeInstance;
        req.models = defineModels(sequelizeInstance);

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
