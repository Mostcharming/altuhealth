'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pharmacy_requests', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            request_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            member_type: {
                type: Sequelize.ENUM('corporate', 'retail'),
                allowNull: false
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'enrollees', key: 'id' },
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },
            retail_enrollee_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'retail_enrollees', key: 'id' },
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },
            pharmacy_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            pharmacy_phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            pharmacy_address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            purchase_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            amount_claimed: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            approved_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true
            },
            currency: {
                type: Sequelize.STRING(3),
                allowNull: false,
                defaultValue: 'NGN'
            },
            receipt_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            call_reference: {
                type: Sequelize.STRING,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected', 'paid'),
                allowNull: false,
                defaultValue: 'pending'
            },
            review_notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            rejection_reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'admins', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            reviewed_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'admins', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            reviewed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            paid_at: {
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
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE "pharmacy_requests" ADD CONSTRAINT "pharmacy_requests_one_member_check" CHECK (num_nonnulls(enrollee_id, retail_enrollee_id) = 1);'
        );

        await queryInterface.createTable('pharmacy_request_items', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            pharmacy_request_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'pharmacy_requests', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            drug_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            unit_price: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            line_total: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
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
        });

        await queryInterface.createTable('pharmacy_payments', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            pharmacy_request_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: { model: 'pharmacy_requests', key: 'id' },
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },
            payment_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            currency: {
                type: Sequelize.STRING(3),
                allowNull: false,
                defaultValue: 'NGN'
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            payment_method: {
                type: Sequelize.ENUM('bank_transfer', 'cash', 'cheque', 'mobile_money', 'wallet', 'other'),
                allowNull: false
            },
            transaction_reference: {
                type: Sequelize.STRING,
                allowNull: true
            },
            beneficiary_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            bank_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            account_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            account_number: {
                type: Sequelize.STRING,
                allowNull: true
            },
            proof_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            recorded_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'admins', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
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
        });

        await queryInterface.addIndex('pharmacy_requests', ['status']);
        await queryInterface.addIndex('pharmacy_requests', ['member_type']);
        await queryInterface.addIndex('pharmacy_requests', ['created_at']);
        await queryInterface.addIndex('pharmacy_payments', ['payment_date']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('pharmacy_payments');
        await queryInterface.dropTable('pharmacy_request_items');
        await queryInterface.dropTable('pharmacy_requests');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pharmacy_payments_payment_method";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pharmacy_requests_status";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pharmacy_requests_member_type";');
    }
};
