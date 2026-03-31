'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Make subscription_end_date nullable (it was required in original migration)
        await queryInterface.changeColumn('retail_enrollee_subscriptions', 'subscription_end_date', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'End date of the subscription coverage'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert to non-nullable
        await queryInterface.changeColumn('retail_enrollee_subscriptions', 'subscription_end_date', {
            type: Sequelize.DATE,
            allowNull: false,
            comment: 'End date of the subscription coverage'
        });
    }
};
