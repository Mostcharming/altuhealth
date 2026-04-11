const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const notify = require('../../../utils/notify');
const config = require('../../../config');
const { generateTemporaryPassword, hashPassword } = require('../../../utils/passwordGenerator');

/**
 * Generate dependent policy number from enrollee policy number
 * Format: ENROLLEE_POLICY-XX where XX is a 2-digit sequence number
 */
async function generateDependentPolicyNumber(retailEnrolleeId, RetailEnrolleeDependent, RetailEnrollee) {
    try {
        // Get the enrollee's policy number
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
        const { retailEnrolleeId, firstName, middleName, lastName, dateOfBirth, gender, relationshipToEnrollee, phoneNumber, email, occupation, maritalStatus, preexistingMedicalRecords } = req.body || {};

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!relationshipToEnrollee) return res.fail('`relationshipToEnrollee` is required', 400);

        // Verify enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        // Generate temporary password
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await hashPassword(temporaryPassword);

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
            relationshipToEnrollee,
            phoneNumber: phoneNumber || null,
            email: email || null,
            occupation: occupation || null,
            maritalStatus: maritalStatus || null,
            preexistingMedicalRecords: preexistingMedicalRecords || null,
            password: hashedPassword
        });

        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.create',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} created for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, retailEnrolleeId }
        });

        // Send email notification if email is provided
        if (email) {
            try {
                await notify(
                    {
                        id: dependent.id,
                        email: dependent.email,
                        firstName: dependent.firstName,
                        enrolleeFirstName: enrollee.firstName,
                        enrolleeLastName: enrollee.lastName,
                        policyNumber: dependent.policyNumber,
                        temporaryPassword: temporaryPassword,
                        loginLink: `${config.retailEnrolleeDependentPortalUrl || config.enrolleeDependentPortalUrl}/login`
                    },
                    'retail_enrollee_dependent',
                    'RETAIL_ENROLLEE_DEPENDENT_CREATED',
                    {
                        firstName: dependent.firstName,
                        enrolleeFirstName: enrollee.firstName,
                        enrolleeLastName: enrollee.lastName,
                        policyNumber: dependent.policyNumber,
                        temporaryPassword: temporaryPassword,
                        loginLink: `${config.retailEnrolleeDependentPortalUrl || config.enrolleeDependentPortalUrl}/login`
                    },
                    ['email']
                );
            } catch (emailError) {
                console.error('Error sending notification email:', emailError);
                // Don't fail the request if email fails to send
            }
        }

        return res.success({ dependent: dependent.toJSON() }, 'Retail enrollee dependent created', 201);
    } catch (err) {
        return next(err);
    }
}


async function updateRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { id } = req.params;
        const { firstName, middleName, lastName, dateOfBirth, gender, relationshipToEnrollee, phoneNumber, email, occupation, maritalStatus, preexistingMedicalRecords, isActive } = req.body || {};

        const dependent = await RetailEnrolleeDependent.findByPk(id);
        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        const updates = {};

        if (firstName !== undefined) updates.firstName = firstName;
        if (middleName !== undefined) updates.middleName = middleName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updates.gender = gender;
        if (relationshipToEnrollee !== undefined) updates.relationshipToEnrollee = relationshipToEnrollee;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber || null;
        if (email !== undefined) updates.email = email || null;
        if (occupation !== undefined) updates.occupation = occupation || null;
        if (maritalStatus !== undefined) updates.maritalStatus = maritalStatus || null;
        if (preexistingMedicalRecords !== undefined) updates.preexistingMedicalRecords = preexistingMedicalRecords || null;
        if (isActive !== undefined) updates.isActive = isActive;

        await dependent.update(updates);

        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.update',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id }
        });

        return res.success({ dependent }, 'Retail enrollee dependent updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { id } = req.params;

        const dependent = await RetailEnrolleeDependent.findByPk(id);
        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        await dependent.destroy();

        await addAuditLog(req.models, {
            action: 'retail_enrollee_dependent.delete',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: id }
        });

        return res.success(null, 'Retail enrollee dependent deleted');
    } catch (err) {
        return next(err);
    }
}

async function listRetailEnrolleeDependents(req, res, next) {
    try {
        const { RetailEnrolleeDependent, RetailEnrollee } = req.models;
        const { limit = 10, page = 1, q, retailEnrolleeId, relationshipToEnrollee, isActive, isVerified } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        // Search by name, email, or policy number
        if (q) {
            where[Op.or] = [
                { firstName: { [Op.iLike || Op.like]: `%${q}%` } },
                { lastName: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } },
                { policyNumber: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        // Filter by enrollee
        if (retailEnrolleeId) {
            where.retailEnrolleeId = retailEnrolleeId;
        }

        // Filter by relationship
        if (relationshipToEnrollee) {
            where.relationshipToEnrollee = relationshipToEnrollee;
        }

        // Filter by active status
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        // Filter by verification status
        if (isVerified !== undefined) {
            where.isVerified = isVerified === 'true';
        }

        const total = await RetailEnrolleeDependent.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email'],
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const dependents = await RetailEnrolleeDependent.findAll(findOptions);
        const data = dependents.map(d => d.toJSON());

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
        return next(err);
    }
}

async function getRetailEnrolleeDependent(req, res, next) {
    try {
        const { RetailEnrolleeDependent, RetailEnrollee } = req.models;
        const { id } = req.params;

        const dependent = await RetailEnrolleeDependent.findByPk(id, {
            include: [
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email'],
                    required: false
                }
            ]
        });

        if (!dependent) return res.fail('Retail enrollee dependent not found', 404);

        return res.success(dependent.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function getRelationshipOptions(req, res, next) {
    try {
        const relationshipOptions = ['spouse', 'child', 'parent', 'sibling', 'other'];
        return res.success({ relationshipOptions });
    } catch (err) {
        return next(err);
    }
}

async function downloadIdCard(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { dependentId } = req.params;

        if (!dependentId) return res.fail('`dependentId` is required', 400);

        // Find dependent
        const dependent = await RetailEnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Dependent not found', 404);

        // Check if ID card URL exists
        if (!dependent.idCardUrl) {
            return res.fail('ID card not available for this dependent', 404);
        }

        // Return the ID card URL to the client
        return res.success(
            { idCardUrl: dependent.idCardUrl },
            'ID card retrieved successfully'
        );
    } catch (error) {
        console.error('Error downloading ID card:', error);
        next(error);
    }
}

async function resendVerificationCode(req, res, next) {
    try {
        const { RetailEnrolleeDependent } = req.models;
        const { dependentId } = req.params;
        const { via = 'email' } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);

        // Find dependent
        const dependent = await RetailEnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Dependent not found', 404);

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update dependent with new verification code
        await dependent.update({
            verificationCode,
            verificationCodeExpiry
        });

        // Send verification code via email or SMS
        try {
            const notify = require('../../../utils/notify');
            if (via === 'email') {
                await notify.sendEmail({
                    to: dependent.email,
                    subject: 'Verification Code',
                    template: 'verification-code',
                    data: {
                        name: `${dependent.firstName} ${dependent.lastName}`,
                        verificationCode
                    }
                });
            } else if (via === 'sms') {
                await notify.sendSMS({
                    to: dependent.phoneNumber,
                    message: `Your verification code is: ${verificationCode}`
                });
            }
        } catch (error) {
            console.warn('Error sending verification code:', error);
            // Don't fail the request if notification fails
        }

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_dependent.resend_verification_code',
            message: `Resent verification code to dependent ${dependentId} via ${via}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId, via }
        });

        return res.success(
            {},
            `Verification code sent successfully via ${via}`
        );
    } catch (error) {
        console.error('Error resending verification code:', error);
        next(error);
    }
}

// Import sub-controllers
const medicalHistoryController = require('./medicalHistoryController');
const authorizationCodeController = require('./authorizationCodeController');

module.exports = {
    createRetailEnrolleeDependent,
    updateRetailEnrolleeDependent,
    deleteRetailEnrolleeDependent,
    listRetailEnrolleeDependents,
    getRetailEnrolleeDependent,
    getRelationshipOptions,
    downloadIdCard,
    resendVerificationCode,
    ...medicalHistoryController,
    ...authorizationCodeController
};
