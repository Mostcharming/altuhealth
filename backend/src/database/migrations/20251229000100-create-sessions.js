'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('sessions', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            session_code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            doctor_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'doctors',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            session_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            start_time: {
                type: Sequelize.TIME,
                allowNull: false
            },
            end_time: {
                type: Sequelize.TIME,
                allowNull: false
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'Duration in minutes'
            },
            session_type: {
                type: Sequelize.ENUM('in-person', 'virtual', 'phone'),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'),
                allowNull: false,
                defaultValue: 'scheduled'
            },
            chief_complaint: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            consultation_fee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            fee_status: {
                type: Sequelize.ENUM('pending', 'paid', 'waived'),
                allowNull: false,
                defaultValue: 'pending'
            },
            payment_method: {
                type: Sequelize.ENUM('insurance', 'cash', 'online', 'transfer'),
                allowNull: true
            },
            prescription: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            diagnosis: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            follow_up_required: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            follow_up_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            cancellation_reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            cancelled_by: {
                type: Sequelize.ENUM('doctor', 'enrollee', 'admin'),
                allowNull: true
            },
            cancelled_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            meeting_link: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'For virtual sessions'
            },
            session_location: {
                type: Sequelize.STRING,
                allowNull: true
            },
            rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: true
            },
            rating_comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            rated_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            reminders_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            last_reminder_sent_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('sessions');
    }
};
