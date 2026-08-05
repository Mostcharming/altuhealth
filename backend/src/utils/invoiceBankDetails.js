'use strict';

const REQUIRED_INVOICE_BANK_DETAIL_FIELDS = [
    { key: 'bankName', label: 'Bank name' },
    { key: 'accountName', label: 'Account name' },
    { key: 'accountNumber', label: 'Account number' }
];

function normalizeValue(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeInvoiceBankDetails(value = {}) {
    const details = value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};

    return {
        bankName: normalizeValue(details.bankName),
        accountName: normalizeValue(details.accountName),
        accountNumber: normalizeValue(details.accountNumber),
        sortCode: normalizeValue(details.sortCode),
        swiftCode: normalizeValue(details.swiftCode),
        paymentInstructions: normalizeValue(details.paymentInstructions)
    };
}

function getMissingInvoiceBankDetailFields(value) {
    const details = normalizeInvoiceBankDetails(value);

    return REQUIRED_INVOICE_BANK_DETAIL_FIELDS
        .filter(({ key }) => !details[key])
        .map(({ key, label }) => ({ key, label }));
}

function isInvoiceBankDetailsConfigured(value) {
    return getMissingInvoiceBankDetailFields(value).length === 0;
}

module.exports = {
    REQUIRED_INVOICE_BANK_DETAIL_FIELDS,
    normalizeInvoiceBankDetails,
    getMissingInvoiceBankDetailFields,
    isInvoiceBankDetailsConfigured
};
