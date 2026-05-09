'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if the password column already exists in retail_enrollee_dependents
        const table = await queryInterface.describeTable('retail_enrollee_dependents');
        if (!table.password) {
            await queryInterface.addColumn('retail_enrollee_dependents', 'password', {
                type: Sequelize.STRING,
                allowNull: true,
                after: 'id_card_url'
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('retail_enrollee_dependents');
        if (table.password) {
            await queryInterface.removeColumn('retail_enrollee_dependents', 'password');
        }
    }
};
