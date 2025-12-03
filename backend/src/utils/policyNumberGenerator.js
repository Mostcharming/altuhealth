/**
 * Utility functions for policy number generation
 */

/**
 * Generate a unique policy number in the format AHL-XXXXX
 * where XXXXX is a 5-digit random number
 * @returns {string} Generated policy number
 */
function generatePolicyNumber() {
    const numPart = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0');
    return `AHL-${numPart}`;
}

/**
 * Get a unique policy number ensuring it doesn't already exist
 * @param {Object} Enrollee - Sequelize Enrollee model
 * @returns {Promise<string>} Unique policy number
 */
async function getUniquePolicyNumber(Enrollee) {
    try {
        let policyNumber;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 100;

        // Keep generating until we find a unique one (max 100 attempts)
        while (exists && attempts < maxAttempts) {
            policyNumber = generatePolicyNumber();
            const foundEnrollee = await Enrollee.findOne({
                where: { policyNumber },
                attributes: ['id'],
                raw: true
            });
            exists = !!foundEnrollee;
            attempts++;
        }

        if (exists) {
            throw new Error('Unable to generate unique policy number after 100 attempts');
        }

        return policyNumber;
    } catch (error) {
        console.error('Error generating unique policy number:', error);
        throw error;
    }
}

module.exports = {
    generatePolicyNumber,
    getUniquePolicyNumber
};
