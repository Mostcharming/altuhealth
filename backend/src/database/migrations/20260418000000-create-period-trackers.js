'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('period_trackers', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            last_period_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            cycle_length: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 28,
                comment: 'Average menstrual cycle length in days'
            },
            period_duration: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 5,
                comment: 'Average period duration in days'
            },
            next_period_date: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Predicted next period start date'
            },
            next_fertile_window_start: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Predicted fertile window start date'
            },
            next_fertile_window_end: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Predicted fertile window end date'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            }
        });

        // Create index on enrollee_id for faster queries
        await queryInterface.addIndex('period_trackers', ['enrollee_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('period_trackers');
    }
};
