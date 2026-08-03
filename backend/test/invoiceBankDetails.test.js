'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const migration = require('../src/database/migrations/20260803000000-add-invoice-bank-details');
const {
    getInvoiceBankDetails,
    updateInvoiceBankDetails,
    createInvoice,
    getInvoice
} = require('../src/modules/admin/invoices/controller');

function createResponse() {
    const result = {};
    return {
        result,
        success(data, message, status = 200) {
            Object.assign(result, { ok: true, data, message, status });
            return result;
        },
        fail(message, status = 400, data = null) {
            Object.assign(result, { ok: false, data, message, status });
            return result;
        }
    };
}

const configuredBankDetails = {
    bankName: 'Example Bank',
    accountName: 'AltuHealth Limited',
    accountNumber: '0012345678',
    sortCode: '110001',
    swiftCode: 'EXAMNGLA',
    paymentInstructions: 'Use the invoice number as the payment reference.'
};

test('invoice bank-details endpoint creates and returns an incomplete default configuration', async () => {
    let createdPayload;
    const req = {
        models: {
            GeneralSetting: {
                findOne: async () => null,
                async create(payload) {
                    createdPayload = payload;
                    return { id: 'setting-1', invoiceBankDetails: null };
                }
            }
        }
    };
    const res = createResponse();

    await getInvoiceBankDetails(req, res, error => {
        throw error;
    });

    assert.deepEqual(createdPayload, { invoiceBankDetails: null });
    assert.equal(res.result.ok, true);
    assert.equal(res.result.data.isConfigured, false);
    assert.deepEqual(
        res.result.data.missingFields.map(field => field.key),
        ['bankName', 'accountName', 'accountNumber']
    );
});

test('updating invoice bank details trims values and requires the three payment fields', async () => {
    let updatePayload;
    const auditLogs = [];
    const setting = {
        id: 'setting-1',
        invoiceBankDetails: null,
        async update(payload) {
            updatePayload = payload;
            this.invoiceBankDetails = payload.invoiceBankDetails;
        }
    };
    const models = {
        GeneralSetting: { findOne: async () => setting },
        AuditLog: {
            async create(payload) {
                auditLogs.push(payload);
                return payload;
            }
        }
    };

    const invalidResponse = createResponse();
    await updateInvoiceBankDetails({
        models,
        body: { bankName: 'Example Bank', accountName: ' ', accountNumber: '' }
    }, invalidResponse, error => {
        throw error;
    });

    assert.equal(invalidResponse.result.status, 400);
    assert.equal(updatePayload, undefined);

    const validResponse = createResponse();
    await updateInvoiceBankDetails({
        models,
        body: {
            bankDetails: {
                bankName: '  Example Bank ',
                accountName: ' AltuHealth Limited  ',
                accountNumber: ' 0012345678 '
            }
        },
        user: { id: 'admin-1', type: 'Admin' }
    }, validResponse, error => {
        throw error;
    });

    assert.deepEqual(updatePayload.invoiceBankDetails, {
        bankName: 'Example Bank',
        accountName: 'AltuHealth Limited',
        accountNumber: '0012345678',
        sortCode: '',
        swiftCode: '',
        paymentInstructions: ''
    });
    assert.equal(validResponse.result.data.isConfigured, true);
    assert.equal(auditLogs[0].action, 'invoice.bankDetails.update');
});

test('invoice generation is blocked until bank details are configured', async () => {
    let invoiceCreateCalled = false;
    const req = {
        body: {
            customerName: 'Test Customer',
            lineItems: [{ description: 'Health plan', unitPrice: 1000, subtotal: 1000 }]
        },
        models: {
            GeneralSetting: { findOne: async () => null },
            Invoice: {
                async create() {
                    invoiceCreateCalled = true;
                }
            },
            InvoiceLineItem: {},
            Enrollee: {},
            RetailEnrollee: {}
        }
    };
    const res = createResponse();

    await createInvoice(req, res, error => {
        throw error;
    });

    assert.equal(res.result.status, 409);
    assert.match(res.result.message, /configure invoice bank details/i);
    assert.equal(invoiceCreateCalled, false);
});

test('new invoices retain a snapshot of the configured bank details', async () => {
    let invoicePayload;
    const req = {
        body: {
            invoiceNumber: 'INV-TEST-001',
            customerName: 'Test Customer',
            lineItems: [{ description: 'Health plan', quantity: 1, unitPrice: 1000, subtotal: 1000 }]
        },
        user: { id: 'admin-1', type: 'Admin' },
        models: {
            GeneralSetting: {
                findOne: async () => ({ invoiceBankDetails: configuredBankDetails })
            },
            Invoice: {
                async create(payload) {
                    invoicePayload = payload;
                    return {
                        id: 'invoice-1',
                        toJSON: () => ({ id: 'invoice-1', ...payload })
                    };
                }
            },
            InvoiceLineItem: {
                async create(payload) {
                    return { toJSON: () => ({ id: 'line-1', ...payload }) };
                }
            },
            Enrollee: {},
            RetailEnrollee: {},
            AuditLog: { create: async payload => payload }
        }
    };
    const res = createResponse();

    await createInvoice(req, res, error => {
        throw error;
    });

    assert.equal(res.result.status, 201);
    assert.deepEqual(invoicePayload.bankDetails, configuredBankDetails);
    assert.deepEqual(res.result.data.invoice.bankDetails, configuredBankDetails);
});

test('legacy invoices fall back to current bank details without replacing invoice snapshots', async () => {
    const makeRequest = bankDetails => ({
        params: { id: 'invoice-1' },
        models: {
            Invoice: {
                findByPk: async () => ({
                    toJSON: () => ({ id: 'invoice-1', bankDetails })
                })
            },
            InvoiceLineItem: {},
            Admin: {},
            GeneralSetting: {
                findOne: async () => ({
                    invoiceBankDetails: {
                        ...configuredBankDetails,
                        accountNumber: '9999999999'
                    }
                })
            }
        }
    });

    const legacyResponse = createResponse();
    await getInvoice(makeRequest(null), legacyResponse, error => {
        throw error;
    });
    assert.equal(legacyResponse.result.data.bankDetails.accountNumber, '9999999999');

    const snapshotResponse = createResponse();
    await getInvoice(makeRequest(configuredBankDetails), snapshotResponse, error => {
        throw error;
    });
    assert.equal(snapshotResponse.result.data.bankDetails.accountNumber, '0012345678');
});

test('invoice bank-details migration adds configuration and snapshot columns atomically', async () => {
    const calls = [];
    const transaction = { id: 'transaction-1' };
    const queryInterface = {
        sequelize: {
            async transaction(callback) {
                return callback(transaction);
            }
        },
        async addColumn(table, column, definition, options) {
            calls.push({ table, column, definition, options });
        }
    };

    await migration.up(queryInterface, { JSON: 'JSON' });

    assert.deepEqual(
        calls.map(call => [call.table, call.column]),
        [
            ['general_settings', 'invoice_bank_details'],
            ['invoices', 'bank_details']
        ]
    );
    assert.ok(calls.every(call => call.options.transaction === transaction));
    assert.ok(calls.every(call => call.definition.allowNull === true));
});
