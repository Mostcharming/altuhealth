const { errorHandler, responseFormatter } = require('../../middlewares/common/responseFormatter');
const { securityMiddleware } = require('../../middlewares/common/security');

const router = require('express').Router();

router.use(responseFormatter);

router.use('/auth', require('./auth/route'));

router.use(securityMiddleware);
// Add other enrollee routes here as needed
router.use('/account', require('./account/route'));
router.use('/appointments', require('./appointments/route'));
router.use('/benefits', require('./benefits/route'));
router.use('/dependents', require('./enrolleeDependents/route'));
router.use('/medical-history', require('./medicalHistory/route'));
router.use('/tickets', require('../common/tickets/route'));
router.use('/notifications', require('./notifications/route'));
router.use('/womens-health', require('./womensHealth/route'));

router.use(errorHandler);

module.exports = router;
