/**
 * Utility functions for authorization code generation
 */

/**
 * Generate a unique authorization code in the format AHL-AUTH-XXXXXXX-TIMESTAMP
 * where XXXXXXX is a random alphanumeric string and TIMESTAMP is a short timestamp
 * @returns {string} Generated authorization code
 */
function generateAuthorizationCode() {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `AHL-AUTH-${randomPart}-${timestamp}`;
}

/**
 * Get a unique authorization code ensuring it doesn't already exist
 * @param {Object} AuthorizationCode - Sequelize AuthorizationCode model
 * @returns {Promise<string>} Unique authorization code
 */
async function getUniqueAuthorizationCode(AuthorizationCode) {
    try {
        let authCode;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 100;

        // Keep generating until we find a unique one (max 100 attempts)
        while (exists && attempts < maxAttempts) {
            authCode = generateAuthorizationCode();
            const foundCode = await AuthorizationCode.findOne({
                where: { authorizationCode: authCode },
                attributes: ['id'],
                raw: true
            });
            exists = !!foundCode;
            attempts++;
        }

        if (exists) {
            throw new Error('Unable to generate unique authorization code after 100 attempts');
        }

        return authCode;
    } catch (error) {
        console.error('Error generating unique authorization code:', error);
        throw error;
    }
}

module.exports = {
    generateAuthorizationCode,
    getUniqueAuthorizationCode
};
