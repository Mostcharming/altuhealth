const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const { getNextSubscriptionReferenceNumber } = require('../../../utils/subscriptionReferenceNumberGenerator');
const { calculatePlanCycleFromDates, calculateAmountPaidFromPlan, generatePaymentReference, calculateEndDateFromCycle } = require('../../../utils/subscriptionCalculationHelper');
const notify = require('../../../utils/notify');
const generateCode = require('../../../utils/verificationCode');
const config = require('../../../config');

async function createRetailEnrollee(req, res, next) {
    try {
        const { RetailEnrollee, Plan, Admin, RetailEnrolleeSubscription } = req.models;
        const {
            firstName,
            middleName,
            lastName,
            phoneNumber,
            email,
            dateOfBirth,
            state,
            lga,
            country,
            maxDependents,
            planId,
            subscriptionStartDate,
            subscriptionEndDate,
            soldByUserId,
            // Optional subscription fields (will be auto-calculated)
            datePaid,
            notes
        } = req.body || {};

        // Validate required fields for enrollee
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);
        if (!email) return res.fail('`email` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!planId) return res.fail('`planId` is required', 400);
        if (!subscriptionStartDate) return res.fail('`subscriptionStartDate` is required', 400);

        // Check if email already exists
        const existingEmail = await RetailEnrollee.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);

        // Check if phone number already exists
        const existingPhone = await RetailEnrollee.findOne({ where: { phoneNumber } });
        if (existingPhone) return res.fail('Phone number already exists', 400);

        // Verify plan exists
        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // Verify sold by user exists if provided
        if (soldByUserId) {
            const admin = await Admin.findByPk(soldByUserId);
            if (!admin) return res.fail('Admin user not found', 404);
        }

        // Generate unique policy number
        const policyNumber = await getUniquePolicyNumber(RetailEnrollee);

        // Generate password and hash it
        const rawPassword = generateCode(10, { letters: true, numbers: true });
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Create retail enrollee
        const enrollee = await RetailEnrollee.create({
            firstName,
            middleName: middleName || null,
            lastName,
            policyNumber,
            phoneNumber,
            email,
            dateOfBirth,
            state: state || null,
            lga: lga || null,
            country: country || null,
            maxDependents: maxDependents || null,
            planId,
            subscriptionStartDate,
            subscriptionEndDate: subscriptionEndDate || null,
            soldByUserId: soldByUserId || null,
            isActive: true,
            password: hashedPassword
        });

        // Generate unique subscription reference number
        const referenceNumber = await getNextSubscriptionReferenceNumber(RetailEnrolleeSubscription);

        // Calculate plan cycle from dates if end date is provided
        let planCycle = 'monthly'; // default
        let calculatedEndDate = subscriptionEndDate;
        if (subscriptionEndDate) {
            planCycle = calculatePlanCycleFromDates(subscriptionStartDate, subscriptionEndDate);
        } else {
            // If no end date provided, use start date + 1 month
            const tempDate = new Date(subscriptionStartDate);
            tempDate.setMonth(tempDate.getMonth() + 1);
            tempDate.setDate(tempDate.getDate() - 1);
            calculatedEndDate = tempDate;
        }

        // Calculate amount paid from plan's annual premium
        const amountPaid = calculateAmountPaidFromPlan(plan.annualPremiumPrice, planCycle);

        // Generate payment reference
        const paymentReference = generatePaymentReference();

        // Create retail enrollee subscription
        const subscription = await RetailEnrolleeSubscription.create({
            referenceNumber,
            retailEnrolleeId: enrollee.id,
            planId,
            planCycle,
            amountPaid,
            currency: 'NGN',
            datePaid: datePaid ? new Date(datePaid) : new Date(),
            subscriptionStartDate: new Date(subscriptionStartDate),
            subscriptionEndDate: calculatedEndDate ? new Date(calculatedEndDate) : null,
            paymentMethod: 'admin_funded',
            transactionReference: paymentReference,
            paymentGatewayProvider: 'manual',
            paymentGatewayTransactionId: paymentReference,
            status: 'active',
            isRenewal: false,
            previousSubscriptionId: null,
            notes: notes || null
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee.create',
            message: `Retail enrollee ${enrollee.firstName} ${enrollee.lastName} created with subscription ${subscription.referenceNumber}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { enrolleeId: enrollee.id, subscriptionId: subscription.id }
        });

        // Send enrollment notification email (don't block main flow on failure)
        try {
            const enrollmentLink = `https://enrollee.altuhealth.com/login`;
            await notify(
                { id: enrollee.id, email: enrollee.email, firstName: enrollee.firstName },
                'retail_enrollee',
                'RETAIL_ENROLLEE_ENROLLMENT',
                {
                    firstName: enrollee.firstName,
                    policyNumber: enrollee.policyNumber,
                    temporaryPassword: rawPassword,
                    loginLink: enrollmentLink,
                    planName: plan.name,
                    subscriptionStartDate: new Date(subscriptionStartDate).toLocaleDateString('en-NG')
                },
                ['email'],
                true
            );
        } catch (notifyErr) {
            console.error('Failed to send retail enrollee enrollment notification', notifyErr);
            // Non-fatal error: don't block main flow
        }

        return res.success(
            {
                enrollee: enrollee.toJSON(),
                subscription: subscription.toJSON()
            },
            'Retail enrollee and subscription created successfully',
            201
        );
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrollees(req, res, next) {
    try {
        const { RetailEnrollee, Plan, Admin } = req.models;
        const { page = 1, limit = 20, search, planId, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        const isAll = limit === 'all';
        const limitNum = isAll ? null : parseInt(limit);
        const offset = isAll ? 0 : (page - 1) * limitNum;
        const where = {};

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phoneNumber: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (planId) where.planId = planId;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const queryOptions = {
            where,
            include: [
                { model: Plan, as: 'plan', attributes: ['id', 'name', 'description'] },
                { model: Admin, as: 'soldByUser', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { association: 'subscriptions', attributes: ['id', 'referenceNumber', 'planCycle', 'amountPaid', 'currency', 'status', 'subscriptionStartDate', 'subscriptionEndDate'] }
            ],
            order: [[sortBy, sortOrder]],
            distinct: true
        };

        if (!isAll) {
            queryOptions.limit = limitNum;
            queryOptions.offset = offset;
        }

        const { count, rows } = await RetailEnrollee.findAndCountAll(queryOptions);

        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(count / limitNum) : 1);
        const hasPrevPage = !isAll && parseInt(page) > 1;
        const hasNextPage = !isAll && (offset + rows.length < count);

        return res.success(
            {
                enrollees: rows,
                pagination: {
                    total: count,
                    page: isAll ? 1 : parseInt(page),
                    limit: isAll ? 'all' : limitNum,
                    pages: totalPages,
                    hasPrevPage,
                    hasNextPage
                }
            },
            'Retail enrollees retrieved successfully'
        );
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeById(req, res, next) {
    try {
        const { RetailEnrollee, Plan, Admin } = req.models;
        const { retailEnrolleeId } = req.params;

        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId, {
            include: [
                { model: Plan, as: 'plan', attributes: ['id', 'name', 'description'] },
                { model: Admin, as: 'soldByUser', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { association: 'subscriptions', attributes: ['id', 'referenceNumber', 'planCycle', 'amountPaid', 'currency', 'status', 'subscriptionStartDate', 'subscriptionEndDate'] }
            ]
        });

        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        return res.success({ enrollee }, 'Retail enrollee retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function updateRetailEnrollee(req, res, next) {
    try {
        const { RetailEnrollee, Plan, Admin } = req.models;
        const { retailEnrolleeId } = req.params;
        const {
            firstName,
            middleName,
            lastName,
            phoneNumber,
            email,
            dateOfBirth,
            state,
            lga,
            country,
            maxDependents,
            planId,
            subscriptionStartDate,
            subscriptionEndDate,
            soldByUserId,
            isActive
        } = req.body || {};

        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        // Check if email already exists (if being changed)
        if (email && email !== enrollee.email) {
            const existingEmail = await RetailEnrollee.findOne({ where: { email } });
            if (existingEmail) return res.fail('Email already exists', 400);
        }

        // Check if phone number already exists (if being changed)
        if (phoneNumber && phoneNumber !== enrollee.phoneNumber) {
            const existingPhone = await RetailEnrollee.findOne({ where: { phoneNumber } });
            if (existingPhone) return res.fail('Phone number already exists', 400);
        }

        // Verify plan exists if provided
        if (planId && planId !== enrollee.planId) {
            const plan = await Plan.findByPk(planId);
            if (!plan) return res.fail('Plan not found', 404);
        }

        // Verify sold by user exists if provided
        if (soldByUserId && soldByUserId !== enrollee.soldByUserId) {
            const admin = await Admin.findByPk(soldByUserId);
            if (!admin) return res.fail('Admin user not found', 404);
        }

        const updates = {};
        if (firstName !== undefined) updates.firstName = firstName;
        if (middleName !== undefined) updates.middleName = middleName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (email !== undefined) updates.email = email;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        if (state !== undefined) updates.state = state || null;
        if (lga !== undefined) updates.lga = lga || null;
        if (country !== undefined) updates.country = country || null;
        if (maxDependents !== undefined) updates.maxDependents = maxDependents || null;
        if (planId !== undefined) updates.planId = planId;
        if (subscriptionStartDate !== undefined) updates.subscriptionStartDate = subscriptionStartDate;
        if (subscriptionEndDate !== undefined) updates.subscriptionEndDate = subscriptionEndDate || null;
        if (soldByUserId !== undefined) updates.soldByUserId = soldByUserId || null;
        if (isActive !== undefined) updates.isActive = isActive;

        await enrollee.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee.update',
            message: `Retail enrollee ${enrollee.firstName} ${enrollee.lastName} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { enrolleeId: enrollee.id }
        });

        return res.success({ enrollee }, 'Retail enrollee updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteRetailEnrollee(req, res, next) {
    try {
        const { RetailEnrollee } = req.models;
        const { retailEnrolleeId } = req.params;

        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        await enrollee.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee.delete',
            message: `Retail enrollee ${enrollee.firstName} ${enrollee.lastName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { enrolleeId: enrollee.id }
        });

        return res.success(null, 'Retail enrollee deleted successfully');
    } catch (err) {
        return next(err);
    }
}

async function createRetailEnrolleeSubscription(req, res, next) {
    try {
        const { RetailEnrollee, Plan, RetailEnrolleeSubscription } = req.models;
        const { retailEnrolleeId } = req.params;
        const {
            planId,
            subscriptionStartDate,
            subscriptionEndDate,
            datePaid,
            isRenewal,
            previousSubscriptionId,
            notes
        } = req.body || {};

        // Validate required subscription fields
        if (!planId) return res.fail('`planId` is required', 400);
        if (!subscriptionStartDate) return res.fail('`subscriptionStartDate` is required', 400);

        // Verify enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        // Verify plan exists
        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // If this is a renewal, verify previous subscription exists
        if (isRenewal && previousSubscriptionId) {
            const previousSub = await RetailEnrolleeSubscription.findByPk(previousSubscriptionId);
            if (!previousSub) return res.fail('Previous subscription not found', 404);
        }

        // Generate unique subscription reference number
        const referenceNumber = await getNextSubscriptionReferenceNumber(RetailEnrolleeSubscription);

        // Calculate plan cycle from dates if end date is provided
        let planCycle = 'monthly'; // default
        let calculatedEndDate = subscriptionEndDate;
        if (subscriptionEndDate) {
            planCycle = calculatePlanCycleFromDates(subscriptionStartDate, subscriptionEndDate);
        } else {
            // If no end date provided, use start date + cycle period
            calculatedEndDate = calculateEndDateFromCycle(subscriptionStartDate, planCycle);
        }

        // Calculate amount paid from plan's annual premium
        const amountPaid = calculateAmountPaidFromPlan(plan.annualPremiumPrice, planCycle);

        // Generate payment reference
        const paymentReference = generatePaymentReference();

        // Create subscription
        const subscription = await RetailEnrolleeSubscription.create({
            referenceNumber,
            retailEnrolleeId,
            planId,
            planCycle,
            amountPaid,
            currency: 'NGN',
            datePaid: datePaid ? new Date(datePaid) : new Date(),
            subscriptionStartDate: new Date(subscriptionStartDate),
            subscriptionEndDate: calculatedEndDate ? new Date(calculatedEndDate) : null,
            paymentMethod: 'admin_funded',
            transactionReference: paymentReference,
            paymentGatewayProvider: 'manual',
            paymentGatewayTransactionId: paymentReference,
            status: 'active',
            isRenewal: isRenewal || false,
            previousSubscriptionId: previousSubscriptionId || null,
            notes: notes || null
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_subscription.create',
            message: `Subscription ${subscription.referenceNumber} created for enrollee ${enrollee.firstName} ${enrollee.lastName}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { enrolleeId: enrollee.id, subscriptionId: subscription.id }
        });

        return res.success({ subscription: subscription.toJSON() }, 'Subscription created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateRetailEnrolleeSubscription(req, res, next) {
    try {
        const { RetailEnrolleeSubscription, Plan } = req.models;
        const { subscriptionId } = req.params;
        const {
            planCycle,
            amountPaid,
            currency,
            datePaid,
            subscriptionStartDate,
            subscriptionEndDate,
            paymentMethod,
            transactionReference,
            paymentGatewayProvider,
            paymentGatewayTransactionId,
            status,
            notes
        } = req.body || {};

        const subscription = await RetailEnrolleeSubscription.findByPk(subscriptionId);
        if (!subscription) return res.fail('Subscription not found', 404);

        const updates = {};
        if (planCycle !== undefined) updates.planCycle = planCycle;
        if (amountPaid !== undefined) updates.amountPaid = amountPaid;
        if (currency !== undefined) updates.currency = currency;
        if (datePaid !== undefined) updates.datePaid = new Date(datePaid);
        if (subscriptionStartDate !== undefined) updates.subscriptionStartDate = new Date(subscriptionStartDate);
        if (subscriptionEndDate !== undefined) updates.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
        if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
        if (transactionReference !== undefined) updates.transactionReference = transactionReference || null;
        if (paymentGatewayProvider !== undefined) updates.paymentGatewayProvider = paymentGatewayProvider || null;
        if (paymentGatewayTransactionId !== undefined) updates.paymentGatewayTransactionId = paymentGatewayTransactionId || null;
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes || null;

        await subscription.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_subscription.update',
            message: `Subscription ${subscription.referenceNumber} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subscriptionId: subscription.id }
        });

        return res.success({ subscription: subscription.toJSON() }, 'Subscription updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeSubscriptions(req, res, next) {
    try {
        const { RetailEnrolleeSubscription, Plan, RetailEnrollee } = req.models;
        const { retailEnrolleeId } = req.params;
        const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        // Verify enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        const offset = (page - 1) * limit;
        const where = { retailEnrolleeId };

        if (status) where.status = status;

        const { count, rows } = await RetailEnrolleeSubscription.findAndCountAll({
            where,
            include: [
                { model: Plan, as: 'plan', attributes: ['id', 'name', 'description'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        return res.success(
            {
                subscriptions: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Subscriptions retrieved successfully'
        );
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createRetailEnrollee,
    getRetailEnrollees,
    getRetailEnrolleeById,
    updateRetailEnrollee,
    deleteRetailEnrollee,
    createRetailEnrolleeSubscription,
    updateRetailEnrolleeSubscription,
    getRetailEnrolleeSubscriptions
};
