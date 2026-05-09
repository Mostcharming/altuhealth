const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');

/**
 * Generate dependent policy number from retail enrollee policy number
 * Format: ENROLLEE_POLICY-XX where XX is a 2-digit sequence number
 */
async function generateDependentPolicyNumber(retailEnrolleeId, RetailEnrolleeDependent, RetailEnrollee) {
    try {
        // Get the retail enrollee's policy number
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId, {
            attributes: ['policyNumber'],
            raw: true
        });

        if (!enrollee) {
            throw new Error('Retail enrollee not found');
        }

        const basePolicy = enrollee.policyNumber;
        let sequenceNumber = 1;
        let policyNumber;
        let exists = true;
        let attempts = 0;
        const maxAttempts = 100;

        // Keep generating until we find a unique one (max 100 attempts)
        while (exists && attempts < maxAttempts) {
            policyNumber = `${basePolicy}-${String(sequenceNumber).padStart(2, '0')}`;
            const foundDependent = await RetailEnrolleeDependent.findOne({
                where: { policyNumber },
                attributes: ['id'],
                raw: true
            });
            exists = !!foundDependent;
            sequenceNumber++;
            attempts++;
        }

        if (exists) {
            throw new Error('Unable to generate unique policy number for dependent after 100 attempts');
        }

        return policyNumber;
    } catch (error) {
        console.error('Error generating dependent policy number:', error);
        throw error;
    }
}

async function createRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent, RetailEnrollee } = req.models;
        const { retailEnrolleeId, firstName, middleName, lastName, dateOfBirth, gender, relationship, phoneNumber, email, state, lga, country, address } = req.body || {};

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!relationship) return res.fail('`relationship` is required', 400);

        // Verify retail enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        // Generate policy number
        const policyNumber = await generateDependentPolicyNumber(retailEnrolleeId, RetailEnrolleeDependent, RetailEnrollee);

        const dependent = await RetailEnrolleeDependent.create({
            retailEnrolleeId,
            policyNumber,
            firstName,
            middleName: middleName || null,
            lastName,
            dateOfBirth,
            gender,
            relationship,
            phoneNumber: phoneNumber || null,
            email: email || null,
            state: state || null,
            lga: lga || null,
            country: country || null,
            address: address || null,
            isActive: true
        });

        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.create',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} created for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId }
        });

        return res.success({ dependent: dependent.toJSON() }, 'Retail enrollee dependent created', 201);
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeDependents(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { retailEnrolleeId } = req.params;
        const { page = 1, limit = 20, search, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);

        const offset = (page - 1) * limit;
        const where = { retailEnrolleeId };

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phoneNumber: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (isActive !== undefined) where.isActive = isActive === 'true';

        const { count, rows } = await RetailEnrolleeDependent.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        return res.success(
            {
                dependents: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Retail enrollee dependents retrieved successfully'
        );
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeDependentById(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { retailEnrolleeId, dependentId } = req.params;

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!dependentId) return res.fail('`dependentId` is required', 400);

        const dependent = await RetailEnrolleeDependent.findOne({
            where: { id: dependentId, retailEnrolleeId }
        });

        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        return res.success({ dependent }, 'Retail enrollee dependent retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function updateRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { retailEnrolleeId, dependentId } = req.params;
        const { firstName, middleName, lastName, dateOfBirth, gender, relationship, phoneNumber, email, state, lga, country, address, isActive } = req.body || {};

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!dependentId) return res.fail('`dependentId` is required', 400);

        const dependent = await RetailEnrolleeDependent.findOne({
            where: { id: dependentId, retailEnrolleeId }
        });

        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        const updates = {};

        if (firstName !== undefined) updates.firstName = firstName;
        if (middleName !== undefined) updates.middleName = middleName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updates.gender = gender;
        if (relationship !== undefined) updates.relationship = relationship;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber || null;
        if (email !== undefined) updates.email = email || null;
        if (state !== undefined) updates.state = state || null;
        if (lga !== undefined) updates.lga = lga || null;
        if (country !== undefined) updates.country = country || null;
        if (address !== undefined) updates.address = address || null;
        if (isActive !== undefined) updates.isActive = isActive;

        await dependent.update(updates);

        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.update',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId }
        });

        return res.success({ dependent }, 'Retail enrollee dependent updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { retailEnrolleeId, dependentId } = req.params;

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!dependentId) return res.fail('`dependentId` is required', 400);

        const dependent = await RetailEnrolleeDependent.findOne({
            where: { id: dependentId, retailEnrolleeId }
        });

        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        await dependent.destroy();

        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.delete',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId }
        });

        return res.success({}, 'Retail enrollee dependent deleted successfully');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createRetailEnrolleeDependent,
    getRetailEnrolleeDependents,
    getRetailEnrolleeDependentById,
    updateRetailEnrolleeDependent,
    deleteRetailEnrolleeDependent
};
