'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(
                'search_histories',
                {
                    id: {
                        type: Sequelize.UUID,
                        allowNull: false,
                        primaryKey: true,
                        defaultValue: Sequelize.UUIDV4
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
                    search_term: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        comment: 'The search term (email or policy number)'
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
                },
                { transaction }
            );

            // Add indexes for better query performance
            await queryInterface.addIndex('search_histories', ['provider_id'], { transaction });
            await queryInterface.addIndex('search_histories', ['created_at'], { transaction });
            await queryInterface.addIndex('search_histories', ['search_term'], { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Remove indexes
            await queryInterface.removeIndex('search_histories', ['provider_id']).catch(() => { });
            await queryInterface.removeIndex('search_histories', ['created_at']).catch(() => { });
            await queryInterface.removeIndex('search_histories', ['search_term']).catch(() => { });

            await queryInterface.dropTable('search_histories', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
