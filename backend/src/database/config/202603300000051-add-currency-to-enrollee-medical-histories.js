'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('enrollee_medical_histories', 'currency', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'NGN'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('enrollee_medical_histories', 'currency');
    }
};
