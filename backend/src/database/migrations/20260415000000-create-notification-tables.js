'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create ProviderNotification table
        await queryInterface.createTable('provider_notifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            click_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            notification_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Create EnrolleeNotification table
        await queryInterface.createTable('enrollee_notifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollees',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            click_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            notification_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Create EnrolleeDependentNotification table
        await queryInterface.createTable('enrollee_dependent_notifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            enrollee_dependent_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollee_dependents',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            click_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            notification_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Create RetailEnrolleeNotification table
        await queryInterface.createTable('retail_enrollee_notifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            retail_enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollees',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            click_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            notification_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Create RetailEnrolleeDependentNotification table
        await queryInterface.createTable('retail_enrollee_dependent_notifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            retail_enrollee_dependent_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollee_dependents',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            click_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            notification_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('provider_notifications', ['provider_id', 'created_at']);
        await queryInterface.addIndex('provider_notifications', ['is_read']);
        await queryInterface.addIndex('enrollee_notifications', ['enrollee_id', 'created_at']);
        await queryInterface.addIndex('enrollee_notifications', ['is_read']);
        await queryInterface.addIndex('enrollee_dependent_notifications', ['enrollee_dependent_id', 'created_at']);
        await queryInterface.addIndex('enrollee_dependent_notifications', ['is_read']);
        await queryInterface.addIndex('retail_enrollee_notifications', ['retail_enrollee_id', 'created_at']);
        await queryInterface.addIndex('retail_enrollee_notifications', ['is_read']);
        await queryInterface.addIndex('retail_enrollee_dependent_notifications', ['retail_enrollee_dependent_id', 'created_at']);
        await queryInterface.addIndex('retail_enrollee_dependent_notifications', ['is_read']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('provider_notifications');
        await queryInterface.dropTable('enrollee_notifications');
        await queryInterface.dropTable('enrollee_dependent_notifications');
        await queryInterface.dropTable('retail_enrollee_notifications');
        await queryInterface.dropTable('retail_enrollee_dependent_notifications');
    },
};
