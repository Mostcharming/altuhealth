const { errorHandler, responseFormatter } = require('../../middlewares/common/responseFormatter');
const { securityMiddleware } = require('../../middlewares/common/security');

const router = require('express').Router();

router.use(responseFormatter);

router.use('/auth', require('./auth/route'));

router.use(securityMiddleware);
router.use('/account', require('./account/route'));
router.use('/notifications', require('./notifications/route'));
router.use('/roles', require('./roles/route'));
router.use('/units', require('./units/route'));
router.use('/admins', require('./admins/route'));
router.use('/plans', require('./plans/route'));
router.use('/exclusions', require('./exclusions/route'));
router.use('/approvals', require('./approvals/route'));
router.use('/benefit-categories', require('./benefitCategories/route'));
router.use('/benefits', require('./benefits/route'));
router.use('/diagnosis', require('./diagnosis/route'));
router.use('/provider-specializations', require('./providerSpecializations/route'));
router.use('/providers', require('./providers/route'));
router.use('/services', require('./services/route'));
router.use('/drugs', require('./drugs/route'));

router.use(errorHandler);


module.exports = router;
