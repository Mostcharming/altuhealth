'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('authorization_codes', 'currency', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'NGN'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('authorization_codes', 'currency');
    }
};
