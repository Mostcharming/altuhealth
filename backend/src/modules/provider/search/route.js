const router = require('express').Router();
const { searchEnrolleeOrDependent, getSearchHistory } = require('./controller');

// Search for enrollee or dependent
router.post('/', searchEnrolleeOrDependent);

// Get search history for a provider
router.get('/history', getSearchHistory);

module.exports = router;
