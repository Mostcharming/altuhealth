'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('account_deletion_requests', {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4
                },
                user_id: {
                    type: Sequelize.UUID,
                    allowNull: false
                },
                user_type: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                reason: {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                status: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: 'pending'
                },
                admin_note: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                reviewed_by: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: { model: 'admins', key: 'id' },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                reviewed_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                approved_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                retention_expires_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                cancelled_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                archived_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                }
            }, { transaction });

            await queryInterface.addConstraint('account_deletion_requests', {
                fields: ['user_type'],
                type: 'check',
                where: { user_type: ['Enrollee', 'RetailEnrollee'] },
                name: 'account_deletion_requests_user_type_check',
                transaction
            });
            await queryInterface.addConstraint('account_deletion_requests', {
                fields: ['status'],
                type: 'check',
                where: { status: ['pending', 'approved', 'declined', 'cancelled', 'archived'] },
                name: 'account_deletion_requests_status_check',
                transaction
            });
            await queryInterface.addIndex('account_deletion_requests', ['user_id', 'user_type'], { transaction });
            await queryInterface.addIndex('account_deletion_requests', ['status'], { transaction });
            await queryInterface.addIndex('account_deletion_requests', ['retention_expires_at'], { transaction });
            await queryInterface.addIndex('account_deletion_requests', ['user_id', 'user_type'], {
                unique: true,
                where: { status: ['pending', 'approved'] },
                name: 'account_deletion_requests_one_active_per_user',
                transaction
            });

            const now = new Date();
            await queryInterface.bulkInsert('jobs', [{
                id: uuidv4(),
                name: 'ACCOUNT_DELETION_RETENTION',
                description: 'Archives approved enrollee deletion requests after the 60-day retention window',
                frequency: 'daily',
                cron_expression: '15 2 * * *',
                is_active: true,
                last_run_at: null,
                next_run_at: null,
                last_status: 'pending',
                last_error_message: null,
                last_success_at: null,
                total_runs: 0,
                total_successful_runs: 0,
                total_failed_runs: 0,
                average_execution_time: null,
                job_handler: 'jobs/accountDeletionRetentionJob',
                metadata: JSON.stringify({ retentionDays: 60 }),
                created_at: now,
                updated_at: now
            }], { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkDelete('jobs', { name: 'ACCOUNT_DELETION_RETENTION' }, { transaction });
            await queryInterface.dropTable('account_deletion_requests', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
