const { errorHandler, responseFormatter } = require('../../middlewares/common/responseFormatter');
const { securityMiddleware } = require('../../middlewares/common/security');

const router = require('express').Router();

router.use(responseFormatter);

router.use('/auth', require('./auth/route'));

router.use(securityMiddleware);
// Add other provider routes here as needed
router.use('/account', require('./account/route'));
router.use('/search', require('./search/route'));
router.use('/appointments', require('./appointments/route'));
router.use('/tariffs', require('./tariffs/route'));
router.use('/authorization-codes', require('./authorizationCodes/route'));
router.use('/claims', require('./claims/route'));
router.use('/payment-advices', require('./paymentAdvices/route'));
router.use('/medical-records', require('./medicalRecords/route'));
router.use('/tickets', require('../common/tickets/route'));
router.use('/notifications', require('./notifications/route'));


router.use(errorHandler);


module.exports = router;
