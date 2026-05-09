'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('license', [{
            id: uuidv4(),
            expires_at: null,
            is_lifetime: true,
            created_at: new Date(),
            updated_at: new Date()
        }]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('license', null, {});
    }
};
