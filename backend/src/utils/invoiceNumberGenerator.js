/**
 * Utility functions for invoice number generation
 */

/**
 * Generate invoice number in format: INV-YYYY-XXXXX
 * where YYYY is the current year and XXXXX is a sequential number
 * @param {number} sequenceNumber - Optional sequence number to use
 * @returns {string} Generated invoice number
 */
function generateInvoiceNumber(sequenceNumber) {
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

    return `INV-${year}-${numPart}`;
}

/**
 * Get the next invoice number based on the latest invoice in database
 * @param {Object} Invoice - Sequelize Invoice model
 * @returns {Promise<string>} Next invoice number
 */
async function getNextInvoiceNumber(Invoice) {
    try {
        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        // Get the latest invoice number for this year
        const latestInvoice = await Invoice.findOne({
            attributes: ['invoiceNumber'],
            where: {
                createdAt: {
                    [require('sequelize').Op.between]: [startOfYear, endOfYear]
                }
            },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        let nextNumber = 1;
        if (latestInvoice && latestInvoice.invoiceNumber) {
            // Extract number from code (INV-YYYY-XXXXX)
            const match = latestInvoice.invoiceNumber.match(/INV-\d+-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return generateInvoiceNumber(nextNumber);
    } catch (error) {
        console.error('Error generating invoice number:', error);
        return generateInvoiceNumber(1);
    }
}

/**
 * Get a unique invoice number ensuring it doesn't already exist
 * @param {Object} Invoice - Sequelize Invoice model
 * @returns {Promise<string>} Unique invoice number
 */
async function getUniqueInvoiceNumber(Invoice) {
    try {
        let invoiceNumber;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 100;

        // Keep generating until we find a unique one (max 100 attempts)
        while (exists && attempts < maxAttempts) {
            invoiceNumber = await getNextInvoiceNumber(Invoice);
            const foundInvoice = await Invoice.findOne({
                where: { invoiceNumber },
                attributes: ['id'],
                raw: true
            });
            exists = !!foundInvoice;
            attempts++;
        }

        if (exists) {
            throw new Error('Unable to generate unique invoice number after 100 attempts');
        }

        return invoiceNumber;
    } catch (error) {
        console.error('Error generating unique invoice number:', error);
        throw error;
    }
}

module.exports = {
    generateInvoiceNumber,
    getNextInvoiceNumber,
    getUniqueInvoiceNumber
};
