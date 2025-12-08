'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('providers', 'payment_batch', {
            type: Sequelize.ENUM('batch_a', 'batch_b', 'batch_c', 'batch_d'),
            allowNull: true,
            defaultValue: null,
            field: 'payment_batch'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('providers', 'payment_batch', {
            type: Sequelize.ENUM('batch_a', 'batch_b', 'batch_c', 'batch_d'),
            allowNull: false,
            defaultValue: 'batch_a',
            field: 'payment_batch'
        });
    }
};
