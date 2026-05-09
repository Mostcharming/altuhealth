'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('audit_logs', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            user_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            meta: {
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

        // optional index for queries by user
        await queryInterface.addIndex('audit_logs', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('audit_logs', ['user_id']).catch(() => { });
        await queryInterface.dropTable('audit_logs');
    }
};
