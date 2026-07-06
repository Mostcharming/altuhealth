'use strict';

const express = require('express');
const router = express.Router();
const Invoices = require('./controller');

// CRUD for invoices
router.post('/', Invoices.createInvoice);
router.get('/list', Invoices.listInvoices);
router.get('/:id', Invoices.getInvoice);
router.put('/:id', Invoices.updateInvoice);
router.delete('/:id', Invoices.deleteInvoice);

// Invoice line items
router.post('/:id/line-items', Invoices.addLineItem);
router.put('/:id/line-items/:lineItemId', Invoices.updateLineItem);
router.delete('/:id/line-items/:lineItemId', Invoices.deleteLineItem);

// Invoice actions
router.patch('/:id/cancel', Invoices.cancelInvoice);

module.exports = router;
