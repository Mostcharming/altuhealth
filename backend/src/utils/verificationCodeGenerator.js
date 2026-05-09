/**
 * Utility functions for enrollee verification code generation and validation
 */

const crypto = require('crypto');

/**
 * Generate a random verification code
 * Default format: 6-digit numeric code
 * @param {number} length - Length of code (default: 6)
 * @returns {string} Generated verification code
 */
function generateVerificationCode(length = 6) {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += digits[Math.floor(Math.random() * digits.length)];
    }
    return code;
}

/**
 * Generate a unique verification code with optional alphanumeric format
 * @param {boolean} alphanumeric - If true, generates alphanumeric code, else numeric
 * @param {number} length - Length of code
 * @returns {string} Generated code
 */
function generateAdvancedVerificationCode(alphanumeric = false, length = 8) {
    if (alphanumeric) {
        return crypto.randomBytes(length / 2).toString('hex').toUpperCase().substring(0, length);
    }
    return generateVerificationCode(length);
}

/**
 * Get unique verification code ensuring it doesn't already exist
 * @param {Object} Enrollee - Sequelize Enrollee model
 * @param {number} length - Code length (default: 6 digits)
 * @returns {Promise<string>} Unique verification code
 */
async function getUniqueVerificationCode(Enrollee, length = 6) {
    try {
        let code;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 100;

        while (exists && attempts < maxAttempts) {
            code = generateVerificationCode(length);
            const foundEnrollee = await Enrollee.findOne({
                where: { verificationCode: code },
                attributes: ['id'],
                raw: true
            });
            exists = !!foundEnrollee;
            attempts++;
        }

        if (exists) {
            throw new Error('Unable to generate unique verification code after 100 attempts');
        }

        return code;
    } catch (error) {
        console.error('Error generating unique verification code:', error);
        throw error;
    }
}

/**
 * Calculate expiration date for verification code
 * @param {number} expirationMinutes - How many minutes until code expires (default: 30)
 * @returns {Date} Expiration date
 */
function getVerificationCodeExpirationDate(expirationMinutes = 30) {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + expirationMinutes);
    return expirationDate;
}

/**
 * Check if verification code is expired
 * @param {Date} expirationDate - Expiration date of the code
 * @returns {boolean} True if expired, false if still valid
 */
function isVerificationCodeExpired(expirationDate) {
    if (!expirationDate) return true;
    return new Date() > expirationDate;
}

/**
 * Format verification code for display/sending (e.g., "123-456" from "123456")
 * @param {string} code - The verification code
 * @param {string} format - Format pattern (default: "XXX-XXX" for 6-digit)
 * @returns {string} Formatted code
 */
function formatVerificationCode(code, format = null) {
    if (!format) {
        // Auto-format based on code length
        if (code.length === 6) {
            return code.substring(0, 3) + '-' + code.substring(3);
        } else if (code.length === 8) {
            return code.substring(0, 4) + '-' + code.substring(4);
        }
    }
    return code;
}

module.exports = {
    generateVerificationCode,
    generateAdvancedVerificationCode,
    getUniqueVerificationCode,
    getVerificationCodeExpirationDate,
    isVerificationCodeExpired,
    formatVerificationCode
};
