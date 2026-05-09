'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('doctors', 'is_online', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Indicates if the doctor is currently online'
        });

        await queryInterface.addColumn('doctors', 'last_seen_at', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Timestamp of when the doctor was last seen online'
        });

        await queryInterface.addColumn('doctors', 'goes_online_at', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Timestamp of when the doctor came online'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('doctors', 'is_online');
        await queryInterface.removeColumn('doctors', 'last_seen_at');
        await queryInterface.removeColumn('doctors', 'goes_online_at');
    }
};
