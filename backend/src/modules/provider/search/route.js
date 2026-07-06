const router = require('express').Router();
const { searchEnrolleeOrDependent, getSearchHistory, lookupEnrollee } = require('./controller');

// Search for enrollee or dependent
router.post('/', searchEnrolleeOrDependent);

// Get search history for a provider
// Lookup enrollee by policy number or email
router.get('/enrollee-lookup', lookupEnrollee);

router.get('/history', getSearchHistory);

module.exports = router;
