const express = require('express');
const router = express.Router();
const {
    // Subscription
    createSubscription,
    updateSubscription,
    deleteSubscription,
    listSubscriptions,
    getSubscription,
    getModeOptions,
    // Subscription Plans
    addPlanToSubscription,
    removePlanFromSubscription,
    getSubscriptionPlans,
    listSubscriptionPlans
} = require('./controller');

// ========== SUBSCRIPTION ROUTES ==========

// List subscriptions
router.get('/list', listSubscriptions);

// Get mode options
router.get('/mode-options', getModeOptions);

// Create subscription
router.post('/', createSubscription);

// Get single subscription with related plans
router.get('/:id', getSubscription);

// Update subscription
router.put('/:id', updateSubscription);

// Delete subscription
router.delete('/:id', deleteSubscription);

// ========== SUBSCRIPTION PLAN ROUTES ==========

// List all subscription plans (with optional filtering)
router.get('/plans/list', listSubscriptionPlans);

// Get plans for specific subscription
router.get('/:subscriptionId/plans', getSubscriptionPlans);

// Add plan to subscription
router.post('/plans/add', addPlanToSubscription);

// Remove plan from subscription
router.delete('/plans/:id', removePlanFromSubscription);

module.exports = router;
