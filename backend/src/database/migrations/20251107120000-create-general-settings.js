'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('general_settings', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            emailFrom: {
                type: Sequelize.STRING,
                allowNull: true
            },
            smsFrom: {
                type: Sequelize.STRING,
                allowNull: true
            },
            emailTemplate: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            smsBody: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            mailConfig: {
                type: Sequelize.JSON,
                allowNull: true
            },
            smsConfig: {
                type: Sequelize.JSON,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('general_settings');
    }
};
