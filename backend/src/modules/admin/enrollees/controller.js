const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const { getUniqueAuthorizationCode } = require('../../../utils/authorizationCodeGenerator');
const { getUniqueVerificationCode, getVerificationCodeExpirationDate, isVerificationCodeExpired, formatVerificationCode } = require('../../../utils/verificationCodeGenerator');
const notify = require('../../../utils/notify');

async function createEnrollee(req, res, next) {
    try {
        const { Enrollee, Staff, Company, CompanyPlan, Diagnosis, Provider } = req.models;
        const {
            firstName,
            middleName,
            lastName,
            staffId,
            companyId,
            companyPlanId,
            dateOfBirth,
            state,
            lga,
            address,
            occupation,
            maritalStatus,
            gender,
            phoneNumber,
            email,
            maxDependents,
            preexistingMedicalRecords,
            expirationDate,
            pictureUrl,
            idCardUrl
        } = req.body || {};

        // Validate required fields
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!staffId) return res.fail('`staffId` is required', 400);
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!companyPlanId) return res.fail('`companyPlanId` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);
        if (!email) return res.fail('`email` is required', 400);

        // Verify staff exists and belongs to the company
        const staff = await Staff.findByPk(staffId);
        if (!staff) return res.fail('Staff not found', 404);
        if (staff.companyId !== companyId) {
            return res.fail('Staff does not belong to the specified company', 400);
        }

        // Check if staff is already enrolled
        const existingEnrollee = await Enrollee.findOne({ where: { staffId } });
        if (existingEnrollee) return res.fail('Staff is already enrolled', 400);

        // Verify company exists
        const company = await Company.findByPk(companyId);
        if (!company) return res.fail('Company not found', 404);

        // Verify company plan exists and belongs to the company
        const companyPlan = await CompanyPlan.findByPk(companyPlanId);
        if (!companyPlan) return res.fail('Company plan not found', 404);
        if (companyPlan.companyId !== companyId) {
            return res.fail('Company plan does not belong to the specified company', 400);
        }

        // Check if email already exists
        const existingEmail = await Enrollee.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);

        // Generate unique policy number
        const policyNumber = await getUniquePolicyNumber(Enrollee);

        // Create enrollee
        const enrollee = await Enrollee.create({
            firstName,
            middleName: middleName || null,
            lastName,
            policyNumber,
            staffId,
            companyId,
            companyPlanId,
            dateOfBirth,
            state: state || null,
            lga: lga || null,
            address: address || null,
            occupation: occupation || null,
            maritalStatus: maritalStatus || null,
            gender,
            phoneNumber,
            email,
            maxDependents: maxDependents || null,
            preexistingMedicalRecords: preexistingMedicalRecords || null,
            expirationDate: expirationDate || null,
            pictureUrl: pictureUrl || null,
            idCardUrl: idCardUrl || null,
            isActive: true
        });

        // Update staff enrollment status
        await Staff.update(
            { enrollmentStatus: 'enrolled' },
            { where: { id: staffId } }
        );

        // Add audit log
        await addAuditLog(req.models, {
            action: 'enrollee.created',
            message: `Created enrollee with policy number ${policyNumber} for staff ${staffId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { enrollee },
            'Enrollee created successfully',
            201
        );
    } catch (error) {
        console.error('Error creating enrollee:', error);
        next(error);
    }
}

async function getEnrollees(req, res, next) {
    try {
        const { Enrollee, Staff, Company, CompanyPlan } = req.models;
        const {
            page = 1,
            limit = 10,
            search = '',
            companyId = null,
            companyPlanId = null,
            isActive = true
        } = req.query;

        const where = {};
        const parsedLimit = limit === 'all' ? null : parseInt(limit);
        const offset = limit === 'all' ? 0 : (page - 1) * parseInt(limit);

        if (isActive !== undefined && isActive !== 'all') {
            where.isActive = isActive === 'true' || isActive === true;
        }

        if (companyId) where.companyId = companyId;
        if (companyPlanId) where.companyPlanId = companyPlanId;

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phoneNumber: { [Op.iLike]: `%${search}%` } },
                { policyNumber: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const queryOptions = {
            where,
            include: [
                { model: Staff, attributes: ['id', 'firstName', 'lastName', 'staffId'] },
                { model: Company, attributes: ['id', 'name'] },
                { model: CompanyPlan, attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']],
            subQuery: false
        };

        if (parsedLimit !== null) {
            queryOptions.limit = parsedLimit;
            queryOptions.offset = offset;
        }

        const { count, rows } = await Enrollee.findAndCountAll(queryOptions);

        return res.success(
            {
                enrollees: rows,
                pagination: {
                    total: count,
                    page: parsedLimit === null ? 1 : parseInt(page),
                    limit: parsedLimit === null ? count : parseInt(limit),
                    pages: parsedLimit === null ? 1 : Math.ceil(count / parseInt(limit))
                }
            },
            'Enrollees retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching enrollees:', error);
        next(error);
    }
}

async function getEnrolleeById(req, res, next) {
    try {
        const { Enrollee, Staff, Company, CompanyPlan, EnrolleeMedicalHistory, AuthorizationCode, Provider, Diagnosis } = req.models;
        const { enrolleeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        const enrollee = await Enrollee.findByPk(enrolleeId, {
            include: [
                { model: Staff, attributes: ['id', 'firstName', 'lastName', 'staffId', 'email', 'phoneNumber'] },
                { model: Company, attributes: ['id', 'name'] },
                { model: CompanyPlan, attributes: ['id', 'name'] },
                // {
                //     model: EnrolleeMedicalHistory,
                //     as: 'medicalHistories',
                //     include: [
                //         { model: Provider, attributes: ['id', 'name', 'code'] },
                //         { model: Diagnosis, attributes: ['id', 'name', 'code'] }
                //     ]
                // },
                // {
                //     model: AuthorizationCode,
                //     as: 'authorizationCodes',
                //     include: [
                //         { model: Provider, attributes: ['id', 'name', 'code'] },
                //         { model: Diagnosis, attributes: ['id', 'name', 'code'] }
                //     ]
                // }
            ]
        });

        if (!enrollee) return res.fail('Enrollee not found', 404);

        return res.success(
            { enrollee },
            'Enrollee retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching enrollee:', error);
        next(error);
    }
}

async function updateEnrollee(req, res, next) {
    try {
        const { Enrollee, Company, CompanyPlan } = req.models;
        const { enrolleeId } = req.params;
        const updates = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // If updating company or plan, verify they exist
        if (updates.companyId && updates.companyId !== enrollee.companyId) {
            const company = await Company.findByPk(updates.companyId);
            if (!company) return res.fail('Company not found', 404);
        }

        if (updates.companyPlanId && updates.companyPlanId !== enrollee.companyPlanId) {
            const companyPlan = await CompanyPlan.findByPk(updates.companyPlanId);
            if (!companyPlan) return res.fail('Company plan not found', 404);
        }

        // Check if email is being updated and if it already exists
        if (updates.email && updates.email !== enrollee.email) {
            const existingEmail = await Enrollee.findOne({ where: { email: updates.email } });
            if (existingEmail) return res.fail('Email already exists', 400);
        }

        // Update enrollee
        await enrollee.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'enrollee.updated',
            message: `Updated enrollee with policy number ${enrollee.policyNumber}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { enrollee },
            'Enrollee updated successfully'
        );
    } catch (error) {
        console.error('Error updating enrollee:', error);
        next(error);
    }
}

async function deleteEnrollee(req, res, next) {
    try {
        const { Enrollee, Staff } = req.models;
        const { enrolleeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Get the staff ID before deletion
        const staffId = enrollee.staffId;

        // Delete enrollee
        await enrollee.destroy();

        // Update staff enrollment status back to not_enrolled
        await Staff.update(
            { enrollmentStatus: 'not_enrolled' },
            { where: { id: staffId } }
        );

        // Add audit log
        await addAuditLog(req.models, {
            action: 'enrollee.deleted',
            message: `Deleted enrollee with policy number ${enrollee.policyNumber}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            null,
            'Enrollee deleted successfully'
        );
    } catch (error) {
        console.error('Error deleting enrollee:', error);
        next(error);
    }
}

async function sendVerificationCode(req, res, next) {
    try {
        const { Enrollee } = req.models;
        const { enrolleeId } = req.params;
        const { via = 'email' } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!['email', 'sms', 'both'].includes(via)) {
            return res.fail('`via` must be either email, sms, or both', 400);
        }

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Check if already verified
        if (enrollee.isVerified) {
            return res.fail('Enrollee is already verified', 400);
        }

        // Generate unique verification code
        const verificationCode = await getUniqueVerificationCode(Enrollee);
        const expirationDate = getVerificationCodeExpirationDate(30); // 30 minutes

        // Update enrollee with verification code
        await enrollee.update({
            verificationCode,
            verificationCodeExpiresAt: expirationDate,
            verificationAttempts: 0
        });

        // Send verification code via email/SMS
        const formattedCode = formatVerificationCode(verificationCode);
        const sendViaChannels = via === 'both' ? ['email', 'sms'] : [via];

        // Send notification using the notify function
        await notify(
            enrollee,
            'enrollee',
            'OTP',
            {
                firstName: enrollee.firstName,
                code: formattedCode,
                expiresIn: '30 minutes'
            },
            sendViaChannels,
            true
        ).catch(err => console.error('Error sending verification code:', err));

        // Add audit log
        await addAuditLog(req.models, {
            action: 'verification.codeSent',
            message: `Sent verification code to ${enrollee.email} via ${via}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            {
                message: `Verification code sent via ${via}`,
                expiresIn: '30 minutes'
            },
            'Verification code sent successfully'
        );
    } catch (error) {
        console.error('Error sending verification code:', error);
        next(error);
    }
}

async function verifyEnrollee(req, res, next) {
    try {
        const { Enrollee } = req.models;
        const { enrolleeId } = req.params;
        const { verificationCode } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!verificationCode) return res.fail('`verificationCode` is required', 400);

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Check if already verified
        if (enrollee.isVerified) {
            return res.fail('Enrollee is already verified', 400);
        }

        // Check if verification code matches
        if (enrollee.verificationCode !== verificationCode) {
            // Increment verification attempts
            await enrollee.update({
                verificationAttempts: enrollee.verificationAttempts + 1
            });

            // Check if max attempts exceeded (5 attempts)
            if (enrollee.verificationAttempts >= 5) {
                return res.fail('Maximum verification attempts exceeded. Please request a new code.', 400);
            }

            return res.fail('Invalid verification code', 400);
        }

        // Check if code is expired
        if (isVerificationCodeExpired(enrollee.verificationCodeExpiresAt)) {
            return res.fail('Verification code has expired. Please request a new one.', 400);
        }

        // Mark as verified
        const verifiedAt = new Date();
        await enrollee.update({
            isVerified: true,
            verifiedAt,
            verificationCode: null, // Clear the code after verification
            verificationCodeExpiresAt: null,
            verificationAttempts: 0
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'enrollee.verified',
            message: `Enrollee ${enrollee.email} verified successfully`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { enrollee },
            'Enrollee verified successfully'
        );
    } catch (error) {
        console.error('Error verifying enrollee:', error);
        next(error);
    }
}

async function resendVerificationCode(req, res, next) {
    try {
        const { Enrollee } = req.models;
        const { enrolleeId } = req.params;
        const { via = 'email' } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Check if already verified
        if (enrollee.isVerified) {
            return res.fail('Enrollee is already verified', 400);
        }

        // Generate new verification code
        const verificationCode = await getUniqueVerificationCode(Enrollee);
        const expirationDate = getVerificationCodeExpirationDate(30);

        // Update enrollee with new code
        await enrollee.update({
            verificationCode,
            verificationCodeExpiresAt: expirationDate,
            verificationAttempts: 0 // Reset attempts on resend
        });

        // Send verification code
        const formattedCode = formatVerificationCode(verificationCode);


        // Send notification using the notify function
        await notify(
            enrollee,
            'enrollee',
            'OTP',
            {
                firstName: enrollee.firstName,
                code: formattedCode,
                expiresIn: '30 minutes'
            },
            ['email', 'sms'],
            true
        ).catch(err => console.error('Error sending verification code:', err));

        // Add audit log
        await addAuditLog(req.models, {
            action: 'verification.codeResent',
            message: `Resent verification code to ${enrollee.email}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { message: `Verification code resent via ${via}` },
            'Verification code resent successfully'
        );
    } catch (error) {
        console.error('Error resending verification code:', error);
        next(error);
    }
}

async function downloadIdCard(req, res, next) {
    try {
        const { Enrollee } = req.models;
        const { enrolleeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Check if ID card URL exists
        if (!enrollee.idCardUrl) {
            return res.fail('ID card not available for this enrollee', 404);
        }

        // Return the ID card URL to the client
        return res.success(
            { idCardUrl: enrollee.idCardUrl },
            'ID card retrieved successfully'
        );
    } catch (error) {
        console.error('Error downloading ID card:', error);
        next(error);
    }
}

module.exports = {
    createEnrollee,
    getEnrollees,
    getEnrolleeById,
    updateEnrollee,
    deleteEnrollee,
    sendVerificationCode,
    verifyEnrollee,
    resendVerificationCode,
    downloadIdCard
};
