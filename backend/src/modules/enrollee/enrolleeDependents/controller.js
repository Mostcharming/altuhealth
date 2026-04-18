'use strict';

const { Op } = require('sequelize');

async function createDependent(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const {
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            gender,
            relationshipToEnrollee,
            phoneNumber,
            email,
            occupation,
            maritalStatus,
            preexistingMedicalRecords,
            notes
        } = req.body || {};

        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!relationshipToEnrollee) return res.fail('`relationshipToEnrollee` is required', 400);

        // Get the enrollee to access their policy number
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Count existing dependents to generate policy number
        const dependentCount = await EnrolleeDependent.count({
            where: { enrolleeId }
        });

        // Generate policy number: enrollee policy number + "-" + (count + 1)
        const policyNumber = `${enrollee.policyNumber}-${dependentCount + 1}`;

        const dependent = await EnrolleeDependent.create({
            enrolleeId,
            policyNumber,
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            gender,
            relationshipToEnrollee,
            phoneNumber,
            email,
            occupation,
            maritalStatus,
            preexistingMedicalRecords,
            notes,
            isActive: true
        });

        // Send email notification if email is provided
        if (email) {
            try {
                const notify = require('../../../utils/notify');
                await notify({
                    email,
                    id: dependent.id,
                    firstName,
                    lastName,
                    policyNumber
                }, 'dependent', 'dependent_enrollment', {
                    dependentName: `${firstName} ${lastName}`,
                    policyNumber,
                    enrolleeName: `${enrollee.firstName} ${enrollee.lastName}`
                }, 'email', false);
            } catch (notificationError) {
                console.log('Error sending notification:', notificationError);
                // Don't fail the request if notification fails
            }
        }

        // Create notification in database
        try {
            const { addEnrolleeDependentNotification } = require('../../../utils/addNotifications');
            await addEnrolleeDependentNotification(req.models, {
                enrolleeDependentId: dependent.id,
                title: 'Enrollment Confirmation',
                message: `You have been enrolled successfully. Your policy number is ${policyNumber}.`,
                notificationType: 'enrollment'
            });
        } catch (notificationError) {
            console.log('Error creating notification:', notificationError);
        }

        return res.success({ dependent: dependent.toJSON() }, 'Dependent created successfully', 201);
    } catch (err) {
        console.log('Error creating dependent:', err);
        return next(err);
    }
}

async function listDependents(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const { limit = 10, page = 1, q, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {
            enrolleeId // Only show dependents for the current enrollee
        };

        if (status !== undefined) {
            where.isActive = status === 'active' ? true : false;
        }

        if (q) {
            where[Op.or] = [
                { firstName: { [Op.iLike || Op.like]: `%${q}%` } },
                { lastName: { [Op.iLike || Op.like]: `%${q}%` } },
                { policyNumber: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } },
                { phoneNumber: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await EnrolleeDependent.count({ where });

        const findOptions = {
            where,
            order: [['enrollmentDate', 'DESC']],
            attributes: { exclude: ['password'] }
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const dependents = await EnrolleeDependent.findAll(findOptions);
        const data = dependents.map(dep => dep.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + dependents.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        console.log('Error listing dependents:', err);
        return next(err);
    }
}

async function getDependent(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const dependent = await EnrolleeDependent.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!dependent) {
            return res.fail('Dependent not found', 404);
        }

        // Ensure enrollee can only see their own dependents
        if (dependent.enrolleeId !== enrolleeId) {
            return res.fail('You do not have permission to view this dependent', 403);
        }

        return res.success(dependent.toJSON());
    } catch (err) {
        console.log('Error fetching dependent:', err);
        return next(err);
    }
}

async function updateDependent(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const dependent = await EnrolleeDependent.findByPk(id);

        if (!dependent) {
            return res.fail('Dependent not found', 404);
        }

        // Ensure enrollee can only update their own dependents
        if (dependent.enrolleeId !== enrolleeId) {
            return res.fail('You do not have permission to update this dependent', 403);
        }

        const {
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            gender,
            relationshipToEnrollee,
            phoneNumber,
            email,
            occupation,
            maritalStatus,
            preexistingMedicalRecords,
            notes,
            isActive
        } = req.body || {};

        if (firstName) dependent.firstName = firstName;
        if (middleName !== undefined) dependent.middleName = middleName;
        if (lastName) dependent.lastName = lastName;
        if (dateOfBirth) dependent.dateOfBirth = dateOfBirth;
        if (gender) dependent.gender = gender;
        if (relationshipToEnrollee) dependent.relationshipToEnrollee = relationshipToEnrollee;
        if (phoneNumber !== undefined) dependent.phoneNumber = phoneNumber;
        if (email !== undefined) dependent.email = email;
        if (occupation !== undefined) dependent.occupation = occupation;
        if (maritalStatus !== undefined) dependent.maritalStatus = maritalStatus;
        if (preexistingMedicalRecords !== undefined) dependent.preexistingMedicalRecords = preexistingMedicalRecords;
        if (notes !== undefined) dependent.notes = notes;
        if (isActive !== undefined) dependent.isActive = isActive;

        await dependent.save();

        return res.success({ dependent: dependent.toJSON() }, 'Dependent updated successfully');
    } catch (err) {
        console.log('Error updating dependent:', err);
        return next(err);
    }
}

async function deleteDependent(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const dependent = await EnrolleeDependent.findByPk(id);

        if (!dependent) {
            return res.fail('Dependent not found', 404);
        }

        // Ensure enrollee can only delete their own dependents
        if (dependent.enrolleeId !== enrolleeId) {
            return res.fail('You do not have permission to delete this dependent', 403);
        }

        await dependent.destroy();

        return res.success(null, 'Dependent deleted successfully');
    } catch (err) {
        console.log('Error deleting dependent:', err);
        return next(err);
    }
}

module.exports = {
    createDependent,
    listDependents,
    getDependent,
    updateDependent,
    deleteDependent
};
