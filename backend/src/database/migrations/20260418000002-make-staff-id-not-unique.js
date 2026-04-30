'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove unique constraint from staff_id
        await queryInterface.changeColumn('staffs', 'staff_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: false
        });
    },

    async down(queryInterface, Sequelize) {
        // Restore unique constraint on staff_id
        await queryInterface.changeColumn('staffs', 'staff_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });
    }
};
