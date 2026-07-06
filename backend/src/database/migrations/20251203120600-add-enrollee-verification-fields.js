'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add verification columns to enrollees table
        await queryInterface.addColumn('enrollees', 'is_verified', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });

        await queryInterface.addColumn('enrollees', 'verification_code', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });

        await queryInterface.addColumn('enrollees', 'verification_code_expires_at', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('enrollees', 'verified_at', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('enrollees', 'verification_attempts', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        // Add indexes for faster lookups
        await queryInterface.addIndex('enrollees', ['is_verified']);
        await queryInterface.addIndex('enrollees', ['verification_code']);
    },

    async down(queryInterface, Sequelize) {
        // Remove the columns
        await queryInterface.removeColumn('enrollees', 'is_verified');
        await queryInterface.removeColumn('enrollees', 'verification_code');
        await queryInterface.removeColumn('enrollees', 'verification_code_expires_at');
        await queryInterface.removeColumn('enrollees', 'verified_at');
        await queryInterface.removeColumn('enrollees', 'verification_attempts');
    }
};
