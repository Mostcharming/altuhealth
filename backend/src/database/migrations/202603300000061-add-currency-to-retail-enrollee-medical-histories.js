'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('retail_enrollee_medical_histories', 'currency', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'NGN'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('retail_enrollee_medical_histories', 'currency');
    }
};
