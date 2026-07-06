'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Make email nullable
        await queryInterface.changeColumn('staffs', 'email', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });

        // Make phone_number nullable
        await queryInterface.changeColumn('staffs', 'phone_number', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // Make staff_id nullable
        await queryInterface.changeColumn('staffs', 'staff_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert email to not nullable
        await queryInterface.changeColumn('staffs', 'email', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        });

        // Revert phone_number to not nullable
        await queryInterface.changeColumn('staffs', 'phone_number', {
            type: Sequelize.STRING,
            allowNull: false
        });

        // Revert staff_id to not nullable
        await queryInterface.changeColumn('staffs', 'staff_id', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        });
    }
};
