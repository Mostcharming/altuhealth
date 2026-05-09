'use strict';

/**
 * Generate provider code in format: AHL-{country_code}-{state_code}-{lga_code}-{three_digits}
 * @param {string} countryCode - 2-letter country code (e.g., 'NG' for Nigeria)
 * @param {string} stateCode - 2-letter state code
 * @param {string} lgaCode - 2-letter LGA code
 * @returns {string} Provider code
 */
function generateProviderCode(countryCode, stateCode, lgaCode) {
    if (!countryCode || !stateCode || !lgaCode) {
        throw new Error('countryCode, stateCode, and lgaCode are required');
    }

    const countryPart = String(countryCode).toUpperCase().slice(0, 2);
    const statePart = String(stateCode).toUpperCase().slice(0, 2);
    const lgaPart = String(lgaCode).toUpperCase().slice(0, 2);

    // Generate 3 random digits
    const randomDigits = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');

    return `AHL-${countryPart}-${statePart}-${lgaPart}-${randomDigits}`;
}

/**
 * Generate provider UPN in format: AHL-{four_digits}
 * @returns {string} Provider UPN
 */
function generateProviderUPN() {
    // Generate 4 random digits
    const randomDigits = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

    return `AHL-${randomDigits}`;
}

module.exports = {
    generateProviderCode,
    generateProviderUPN
};
