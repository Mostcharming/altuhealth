'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            `ALTER TABLE staffs DROP CONSTRAINT IF EXISTS staffs_staff_id_key;`
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            `ALTER TABLE staffs ADD CONSTRAINT staffs_staff_id_key UNIQUE(staff_id);`
        );
    }
};
