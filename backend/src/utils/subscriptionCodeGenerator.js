/**
 * Utility functions for subscription code generation
 */

/**
 * Generate a unique subscription code in the format AHL-SUB-XXXX
 * where XXXX is a sequential or random number
 * @param {number} sequenceNumber - Optional sequence number to use
 * @returns {string} Generated subscription code
 */
function generateSubscriptionCode(sequenceNumber) {
    let numPart = sequenceNumber;

    if (!numPart) {
        // Generate a random 4-digit number if no sequence provided
        numPart = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
    } else {
        // Pad the sequence number to 4 digits
        numPart = sequenceNumber.toString().padStart(4, '0');
    }

    return `AHL-SUB-${numPart}`;
}

/**
 * Get the next subscription code based on the latest subscription in database
 * @param {Object} Subscription - Sequelize Subscription model
 * @returns {Promise<string>} Next subscription code
 */
async function getNextSubscriptionCode(Subscription) {
    try {
        // Get the latest subscription code
        const latestSubscription = await Subscription.findOne({
            attributes: ['code'],
            order: [['createdAt', 'DESC']],
            raw: true
        });

        let nextNumber = 1;
        if (latestSubscription && latestSubscription.code) {
            // Extract number from code (AHL-SUB-XXXX)
            const match = latestSubscription.code.match(/AHL-SUB-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return generateSubscriptionCode(nextNumber);
    } catch (error) {
        console.error('Error generating subscription code:', error);
        return generateSubscriptionCode(1);
    }
}

module.exports = {
    generateSubscriptionCode,
    getNextSubscriptionCode
};
