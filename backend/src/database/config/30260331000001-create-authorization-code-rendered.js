'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('authorization_code_rendered', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            authorization_code_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'authorization_codes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                field: 'authorization_code_id'
            },
            drug_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'drugs',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                field: 'drug_id'
            },
            service_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'services',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                field: 'service_id'
            },
            unit: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'unit'
            },
            quantity_rendered: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                field: 'quantity_rendered'
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
        await queryInterface.dropTable('authorization_code_rendered');
    }
};
