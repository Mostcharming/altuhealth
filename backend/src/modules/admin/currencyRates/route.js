'use strict';

const express = require('express');
const router = express.Router();
const CurrencyRates = require('./controller');

router.get('/list', CurrencyRates.listCurrencyRates);
router.post('/fetch-latest', CurrencyRates.fetchLatestRates);
router.post('/', CurrencyRates.createCurrencyRate);
router.get('/:id', CurrencyRates.getCurrencyRate);
router.put('/:id', CurrencyRates.updateCurrencyRate);
router.delete('/:id', CurrencyRates.deleteCurrencyRate);

module.exports = router;
