'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Insert initial single row. id is fixed to 1 to satisfy single-row constraint.
        await queryInterface.bulkInsert('license', [{
            id: 1,
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
