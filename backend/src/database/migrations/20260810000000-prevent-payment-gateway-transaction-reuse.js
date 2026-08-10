'use strict';

const INDEX_NAME = 'retail_enrollee_subscriptions_gateway_transaction_unique';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.addIndex(
            'retail_enrollee_subscriptions',
            ['payment_gateway_provider', 'payment_gateway_transaction_id'],
            {
                name: INDEX_NAME,
                unique: true
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('retail_enrollee_subscriptions', INDEX_NAME);
    }
};
