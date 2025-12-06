const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const notify = require('../../../utils/notify');
const config = require('../../../config');

async function createRetailEnrollee(req, res, next) {
    try {
        const { RetailEnrollee, Plan, Admin } = req.models;
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
            soldByUserId
        } = req.body || {};

        // Validate required fields
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
            isActive: true
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee.create',
            message: `Retail enrollee ${enrollee.firstName} ${enrollee.lastName} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { enrolleeId: enrollee.id }
        });

        return res.success({ enrollee: enrollee.toJSON() }, 'Retail enrollee created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrollees(req, res, next) {
    try {
        const { RetailEnrollee, Plan, Admin } = req.models;
        const { page = 1, limit = 20, search, planId, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        const offset = (page - 1) * limit;
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

        const { count, rows } = await RetailEnrollee.findAndCountAll({
            where,
            include: [
                { model: Plan, as: 'plan', attributes: ['id', 'name', 'description'] },
                { model: Admin, as: 'soldByUser', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        return res.success(
            {
                enrollees: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
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
                { model: Admin, as: 'soldByUser', attributes: ['id', 'firstName', 'lastName', 'email'] }
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

module.exports = {
    createRetailEnrollee,
    getRetailEnrollees,
    getRetailEnrolleeById,
    updateRetailEnrollee,
    deleteRetailEnrollee
};
