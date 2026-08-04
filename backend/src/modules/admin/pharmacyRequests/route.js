'use strict';

const router = require('express').Router();
const PharmacyRequests = require('./controller');

router.post('/', PharmacyRequests.createPharmacyRequest);
router.get('/list', PharmacyRequests.listPharmacyRequests);
router.get('/summary', PharmacyRequests.getPharmacySummary);
router.get('/payments/list', PharmacyRequests.listPharmacyPayments);
router.get('/:id', PharmacyRequests.getPharmacyRequest);
router.patch('/:id/approve', PharmacyRequests.approvePharmacyRequest);
router.patch('/:id/reject', PharmacyRequests.rejectPharmacyRequest);
router.post('/:id/payment', PharmacyRequests.recordPharmacyPayment);

module.exports = router;
