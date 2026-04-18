'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add women's health period prediction job
        await queryInterface.bulkInsert('jobs', [
            {
                id: Sequelize.fn('uuid_generate_v4'),
                name: 'WOMEN_HEALTH_PERIOD_PREDICTION',
                description: 'Daily period prediction calculation for women health tracking',
                cronExpression: '0 0 * * *', // Runs daily at midnight
                isActive: true,
                lastStatus: 'pending',
                lastError: null,
                metadata: JSON.stringify({
                    reminderDaysBefore: 3,
                    lastExecutionTime: null,
                    trackersProcessed: 0
                }),
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the job
        await queryInterface.bulkDelete('jobs', {
            name: 'WOMEN_HEALTH_PERIOD_PREDICTION'
        });
    }
};
