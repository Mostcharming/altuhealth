'use strict';

const { Op } = require('sequelize');
const { isDependentLimitError, withDependentCapacity } = require('../../../utils/dependentLimit');
const { sendDependentAddedEmail } = require('../../../utils/sendDependentAddedEmail');

async function generateDependentPolicyNumber(parent, DependentModel, dependentCount, transaction) {
    for (let sequenceNumber = 1; sequenceNumber <= dependentCount + 1; sequenceNumber += 1) {
        const policyNumber = `${parent.policyNumber}-${sequenceNumber}`;
        const existingDependent = await DependentModel.findOne({
            where: { policyNumber },
            attributes: ['id'],
            transaction
        });

        if (!existingDependent) return policyNumber;
    }

    throw new Error('Unable to generate a unique dependent policy number');
}

async function createDependent(req, res, next) {
    try {
        const enrolleeId = req.user?.id;
        const enrolleeType = req.user?.type;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        let ParentModel;
        let DependentModel;
        let foreignKey;
        let subjectLabel;
        let notFoundMessage;
        let isRetailEnrollee = false;

        if (enrolleeType === 'Enrollee') {
            ParentModel = req.models.Enrollee;
            DependentModel = req.models.EnrolleeDependent;
            foreignKey = 'enrolleeId';
            subjectLabel = 'enrollee';
            notFoundMessage = 'Enrollee not found';
        } else if (enrolleeType === 'RetailEnrollee') {
            ParentModel = req.models.RetailEnrollee;
            DependentModel = req.models.RetailEnrolleeDependent;
            foreignKey = 'retailEnrolleeId';
            subjectLabel = 'retail enrollee';
            notFoundMessage = 'Retail enrollee not found';
            isRetailEnrollee = true;
        } else {
            return res.fail('Unsupported enrollee account type', 403);
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
            notes
        } = req.body || {};

        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!relationshipToEnrollee) return res.fail('`relationshipToEnrollee` is required', 400);

        const { dependent, enrollee, policyNumber } = await withDependentCapacity({
            ParentModel,
            DependentModel,
            parentId: enrolleeId,
            foreignKey,
            subjectLabel,
            notFoundMessage
        }, async ({ parent, dependentCount, transaction }) => {
            const generatedPolicyNumber = await generateDependentPolicyNumber(
                parent,
                DependentModel,
                dependentCount,
                transaction
            );

            const dependentData = {
                [foreignKey]: enrolleeId,
                policyNumber: generatedPolicyNumber,
                firstName,
                middleName,
                lastName,
                dateOfBirth,
                gender,
                phoneNumber,
                email,
                pictureUrl: req.profileImage?.url || null,
                isActive: true
            };

            if (isRetailEnrollee) {
                dependentData.relationship = relationshipToEnrollee;
            } else {
                Object.assign(dependentData, {
                    relationshipToEnrollee,
                    occupation,
                    maritalStatus,
                    preexistingMedicalRecords,
                    notes
                });
            }

            const createdDependent = await DependentModel.create(dependentData, { transaction });

            return {
                dependent: createdDependent,
                enrollee: parent,
                policyNumber: generatedPolicyNumber
            };
        });

        // Send email notification if email is provided
        if (email) {
            try {
                await sendDependentAddedEmail({
                    dependent,
                    enrollee,
                    isRetailEnrollee
                });
            } catch (notificationError) {
                console.log('Error sending notification:', notificationError);
                // Don't fail the request if notification fails
            }
        }

        // Create notification in database
        try {
            const {
                addEnrolleeDependentNotification,
                addRetailEnrolleeDependentNotification
            } = require('../../../utils/addNotifications');
            const notificationData = {
                title: 'Enrollment Confirmation',
                message: `You have been enrolled successfully. Your policy number is ${policyNumber}.`,
                notificationType: 'enrollment'
            };

            if (isRetailEnrollee) {
                await addRetailEnrolleeDependentNotification(req.models, {
                    retailEnrolleeDependentId: dependent.id,
                    ...notificationData
                });
            } else {
                await addEnrolleeDependentNotification(req.models, {
                    enrolleeDependentId: dependent.id,
                    ...notificationData
                });
            }
        } catch (notificationError) {
            console.log('Error creating notification:', notificationError);
        }

        return res.success({ dependent: dependent.toJSON() }, 'Dependent created successfully', 201);
    } catch (err) {
        if (isDependentLimitError(err)) {
            return res.fail(err.message, err.statusCode);
        }
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
