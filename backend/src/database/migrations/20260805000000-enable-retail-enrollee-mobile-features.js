'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('appointments', 'enrollee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: 'enrollees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
        await queryInterface.addColumn('appointments', 'retail_enrollee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: 'retail_enrollees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
        await queryInterface.addIndex('appointments', ['retail_enrollee_id']);

        await queryInterface.changeColumn('period_trackers', 'enrollee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: 'enrollees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
        await queryInterface.addColumn('period_trackers', 'retail_enrollee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            unique: true,
            references: { model: 'retail_enrollees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
        await queryInterface.addIndex('period_trackers', ['retail_enrollee_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('period_trackers', ['retail_enrollee_id']);
        await queryInterface.removeColumn('period_trackers', 'retail_enrollee_id');
        await queryInterface.changeColumn('period_trackers', 'enrollee_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'enrollees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        await queryInterface.removeIndex('appointments', ['retail_enrollee_id']);
        await queryInterface.removeColumn('appointments', 'retail_enrollee_id');
        await queryInterface.changeColumn('appointments', 'enrollee_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'enrollees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    }
};
