/**
 * Utility functions for password generation and hashing
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Generate a random temporary password
 * Format: 8 characters with uppercase, lowercase, number, and special character
 * @returns {string} Generated temporary password
 */
function generateTemporaryPassword(length = 10) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure password has at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill remaining characters randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}

/**
 * Hash a password using bcrypt
 * @param {string} password - The password to hash
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password, saltRounds = 10) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
async function comparePasswords(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}

/**
 * Generate a password reset token
 * @returns {string} Reset token
 */
function generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    generateTemporaryPassword,
    hashPassword,
    comparePasswords,
    generatePasswordResetToken
};
