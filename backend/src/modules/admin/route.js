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
router.use('/companies', require('./companies/route'));
router.use('/company-subsidiaries', require('./companySubsidiaries/route'));
router.use('/company-plans', require('./companyPlans/route'));
router.use('/subscriptions', require('./subscriptions/route'));
router.use('/utilization-reviews', require('./utilizationReviews/route'));
router.use('/staffs', require('./staffs/route'));
router.use('/enrollees', require('./enrollees/route'));
router.use('/enrollee-dependents', require('./enrolleeDependents/route'));
router.use('/authorization-codes', require('./authorizationCodes/route'));
router.use('/retail-enrollees', require('./retailEnrollees/route'));
router.use('/retail-enrollee-dependents', require('./retailEnrolleeDependents/route'));
router.use('/retail-enrollees/:retailEnrolleeId/dependents', require('./retailEnrolleeDependents/route'));
router.use('/payment-batches', require('./paymentBatches/route'));
router.use('/payment-advices', require('./paymentAdvices/route'));
router.use('/claims', require('./claims/route'));
router.use('/appointments', require('./appointments/route'));
router.use('/admission-trackers', require('./admissionTrackers/route'));

router.use(errorHandler);


module.exports = router;
