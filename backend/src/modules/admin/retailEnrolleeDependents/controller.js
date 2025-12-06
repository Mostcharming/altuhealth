const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const notify = require('../../../utils/notify');
const config = require('../../../config');

async function createRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent, RetailEnrollee } = req.models;
        const {
            retailEnrolleeId,
            firstName,
            middleName,
            lastName,
            phoneNumber,
            email,
            dateOfBirth,
            gender,
            relationship,
            state,
            lga,
            country,
            address
        } = req.body || {};

        // Validate required fields
        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!relationship) return res.fail('`relationship` is required', 400);

        // Verify retail enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        // If email is provided, check if it already exists
        if (email) {
            const existingEmail = await RetailEnrolleeDependent.findOne({ where: { email } });
            if (existingEmail) return res.fail('Email already exists', 400);
        }

        // Create dependent
        const dependent = await RetailEnrolleeDependent.create({
            retailEnrolleeId,
            firstName,
            middleName: middleName || null,
            lastName,
            phoneNumber: phoneNumber || null,
            email: email || null,
            dateOfBirth,
            gender,
            relationship,
            state: state || null,
            lga: lga || null,
            country: country || null,
            address: address || null,
            isActive: true
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.create',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} created for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId }
        });

        return res.success({ dependent: dependent.toJSON() }, 'Retail enrollee dependent created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeDependents(req, res, next) {
    try {
        const { RetailEnrolleeDependent, RetailEnrollee } = req.models;
        const { retailEnrolleeId: paramRetailEnrolleeId } = req.params;
        const { page = 1, limit = 20, search, isActive, retailEnrolleeId: queryRetailEnrolleeId, sortBy = 'createdAt', sortOrder = 'DESC', q } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // Handle both param-based and query-based filtering
        const retailEnrolleeId = paramRetailEnrolleeId || queryRetailEnrolleeId;
        if (retailEnrolleeId) {
            where.retailEnrolleeId = retailEnrolleeId;
        }

        // Search by first name, last name, email, or phone number
        const searchQuery = search || q;
        if (searchQuery) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${searchQuery}%` } },
                { lastName: { [Op.iLike]: `%${searchQuery}%` } },
                { email: { [Op.iLike]: `%${searchQuery}%` } },
                { phoneNumber: { [Op.iLike]: `%${searchQuery}%` } }
            ];
        }

        if (isActive !== undefined) where.isActive = isActive === 'true';

        const { count, rows } = await RetailEnrolleeDependent.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [{
                model: RetailEnrollee,
                as: 'RetailEnrollee',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            distinct: true
        });

        return res.success(
            {
                list: rows,
                count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
                hasNextPage: parseInt(page) * parseInt(limit) < count,
                hasPreviousPage: parseInt(page) > 1
            },
            'Retail enrollee dependents retrieved successfully'
        );
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeDependentById(req, res, next) {
    try {
        const { RetailEnrolleeDependent, RetailEnrollee } = req.models;
        const { retailEnrolleeId: paramRetailEnrolleeId, dependentId } = req.params;

        const dependent = await RetailEnrolleeDependent.findByPk(dependentId, {
            include: [{
                model: RetailEnrollee,
                as: 'RetailEnrollee',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });
        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        if (paramRetailEnrolleeId && dependent.retailEnrolleeId !== paramRetailEnrolleeId) {
            return res.fail('Dependent does not belong to the specified enrollee', 400);
        }

        return res.success({ dependent }, 'Retail enrollee dependent retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function updateRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { retailEnrolleeId: paramRetailEnrolleeId, dependentId } = req.params;
        const {
            firstName,
            middleName,
            lastName,
            phoneNumber,
            email,
            dateOfBirth,
            gender,
            relationship,
            state,
            lga,
            country,
            address,
            isActive
        } = req.body || {};

        const dependent = await RetailEnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        if (paramRetailEnrolleeId && dependent.retailEnrolleeId !== paramRetailEnrolleeId) {
            return res.fail('Dependent does not belong to the specified enrollee', 400);
        }

        // Check if email already exists (if being changed)
        if (email && email !== dependent.email) {
            const existingEmail = await RetailEnrolleeDependent.findOne({ where: { email } });
            if (existingEmail) return res.fail('Email already exists', 400);
        }

        const updates = {};
        if (firstName !== undefined) updates.firstName = firstName;
        if (middleName !== undefined) updates.middleName = middleName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber || null;
        if (email !== undefined) updates.email = email || null;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updates.gender = gender;
        if (relationship !== undefined) updates.relationship = relationship;
        if (state !== undefined) updates.state = state || null;
        if (lga !== undefined) updates.lga = lga || null;
        if (country !== undefined) updates.country = country || null;
        if (address !== undefined) updates.address = address || null;
        if (isActive !== undefined) updates.isActive = isActive;

        await dependent.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.update',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId: dependent.retailEnrolleeId }
        });

        return res.success({ dependent }, 'Retail enrollee dependent updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { retailEnrolleeId: paramRetailEnrolleeId, dependentId } = req.params;

        const dependent = await RetailEnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        if (paramRetailEnrolleeId && dependent.retailEnrolleeId !== paramRetailEnrolleeId) {
            return res.fail('Dependent does not belong to the specified enrollee', 400);
        }

        await dependent.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.delete',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId: dependent.retailEnrolleeId }
        });

        return res.success(null, 'Retail enrollee dependent deleted successfully');
    } catch (err) {
        return next(err);
    }
}

function getRelationshipOptions(req, res, next) {
    try {
        const relationships = ['spouse', 'child', 'parent', 'sibling', 'other'];
        return res.success({ relationships }, 'Relationship options retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createRetailEnrolleeDependent,
    getRetailEnrolleeDependents,
    getRetailEnrolleeDependentById,
    updateRetailEnrolleeDependent,
    deleteRetailEnrolleeDependent,
    getRelationshipOptions
};
