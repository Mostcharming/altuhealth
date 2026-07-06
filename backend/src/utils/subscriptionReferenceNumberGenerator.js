/**
 * Utility functions for retail enrollee subscription reference number generation
 */

/**
 * Generate a unique subscription reference number in the format RES-SUB-YYYY-XXXXX
 * where YYYY is the current year and XXXXX is a sequential/random number
 * @param {number} sequenceNumber - Optional sequence number to use
 * @returns {string} Generated reference number
 */
function generateSubscriptionReferenceNumber(sequenceNumber) {
    const year = new Date().getFullYear();
    let numPart = sequenceNumber;

    if (!numPart) {
        // Generate a random 5-digit number if no sequence provided
        numPart = Math.floor(Math.random() * 100000)
            .toString()
            .padStart(5, '0');
    } else {
        // Pad the sequence number to 5 digits
        numPart = sequenceNumber.toString().padStart(5, '0');
    }

    return `RES-SUB-${year}-${numPart}`;
}

/**
 * Get the next subscription reference number based on the latest subscription in database
 * @param {Object} RetailEnrolleeSubscription - Sequelize RetailEnrolleeSubscription model
 * @returns {Promise<string>} Next subscription reference number
 */
async function getNextSubscriptionReferenceNumber(RetailEnrolleeSubscription) {
    try {
        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        // Get the latest subscription reference number for this year
        const latestSubscription = await RetailEnrolleeSubscription.findOne({
            attributes: ['referenceNumber'],
            where: {
                createdAt: {
                    [require('sequelize').Op.between]: [startOfYear, endOfYear]
                }
            },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        let nextNumber = 1;
        if (latestSubscription && latestSubscription.referenceNumber) {
            // Extract number from code (RES-SUB-YYYY-XXXXX)
            const match = latestSubscription.referenceNumber.match(/RES-SUB-\d+-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return generateSubscriptionReferenceNumber(nextNumber);
    } catch (error) {
        console.error('Error generating subscription reference number:', error);
        return generateSubscriptionReferenceNumber(1);
    }
}

/**
 * Validate a subscription reference number format
 * @param {string} referenceNumber - Reference number to validate
 * @returns {boolean} True if valid format
 */
function isValidSubscriptionReferenceNumber(referenceNumber) {
    const pattern = /^RES-SUB-\d{4}-\d{5}$/;
    return pattern.test(referenceNumber);
}

module.exports = {
    generateSubscriptionReferenceNumber,
    getNextSubscriptionReferenceNumber,
    isValidSubscriptionReferenceNumber
};
