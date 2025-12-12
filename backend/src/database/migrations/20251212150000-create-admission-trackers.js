'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admission_trackers', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'enrollee_id'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'provider_id'
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'company_id'
            },
            subsidiary_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'company_subsidiaries',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'subsidiary_id'
            },
            admission_date: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'admission_date'
            },
            discharge_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'discharge_date'
            },
            days_of_admission: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'days_of_admission'
            },
            diagnosis: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'diagnosis'
            },
            diagnosis_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'diagnosis_code'
            },
            room_type: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'room_type'
            },
            bed_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bed_number'
            },
            ward: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'ward'
            },
            reason_for_admission: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'reason_for_admission'
            },
            treatment_notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'treatment_notes'
            },
            discharge_notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'discharge_notes'
            },
            admitting_physician: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'admitting_physician'
            },
            discharging_physician: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'discharging_physician'
            },
            status: {
                type: Sequelize.ENUM('admitted', 'discharged', 'transferred', 'absconded', 'expired'),
                allowNull: false,
                defaultValue: 'admitted',
                field: 'status'
            },
            total_bill_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'total_bill_amount'
            },
            approved_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'approved_amount'
            },
            approved_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'approved_by'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'notes'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'updated_at'
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('admission_trackers');
    }
};
