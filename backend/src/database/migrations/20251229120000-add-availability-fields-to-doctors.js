'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('doctors', 'available_from', {
            type: Sequelize.TIME,
            allowNull: true,
            comment: 'Daily availability start time (HH:MM:SS format)'
        });

        await queryInterface.addColumn('doctors', 'available_to', {
            type: Sequelize.TIME,
            allowNull: true,
            comment: 'Daily availability end time (HH:MM:SS format)'
        });

        await queryInterface.addColumn('doctors', 'available_days', {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Days of week when doctor is available (e.g., ["monday", "tuesday", "wednesday", "thursday", "friday"])'
        });

        await queryInterface.addColumn('doctors', 'break_start_time', {
            type: Sequelize.TIME,
            allowNull: true,
            comment: 'Daily break start time (HH:MM:SS format)'
        });

        await queryInterface.addColumn('doctors', 'break_end_time', {
            type: Sequelize.TIME,
            allowNull: true,
            comment: 'Daily break end time (HH:MM:SS format)'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('doctors', 'available_from');
        await queryInterface.removeColumn('doctors', 'available_to');
        await queryInterface.removeColumn('doctors', 'available_days');
        await queryInterface.removeColumn('doctors', 'break_start_time');
        await queryInterface.removeColumn('doctors', 'break_end_time');
    }
};
