const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const { getUniqueAuthorizationCode } = require('../../../utils/authorizationCodeGenerator');
const { getUniqueVerificationCode, getVerificationCodeExpirationDate, isVerificationCodeExpired, formatVerificationCode } = require('../../../utils/verificationCodeGenerator');
const notify = require('../../../utils/notify');
const generateCode = require('../../../utils/verificationCode');
const { resolveMemberIdCardUrl } = require('../../../utils/idCard');

const CORPORATE_ENROLLMENT_TEMPLATE = 'STAFF_ENROLLMENT_REQUIRED';
const ENROLLEE_PORTAL_URL = 'https://enrollee.altuhealth.com';

async function mapWithConcurrency(items, concurrency, worker) {
    const results = new Array(items.length);
    let cursor = 0;
    const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        async () => {
            while (cursor < items.length) {
                const index = cursor;
                cursor += 1;

                try {
                    results[index] = {
                        ok: true,
                        value: await worker(items[index])
                    };
                } catch (error) {
                    results[index] = { ok: false, error };
                }
            }
        }
    );

    await Promise.all(workers);
    return results;
}

async function sendCorporateEnrollmentNotification(enrollee) {
    if (!enrollee.email) {
        throw new Error('Enrollee email is not available');
    }

    const previousPassword = enrollee.password ?? null;
    const rawPassword = generateCode(10, { letters: true, numbers: true });
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await enrollee.update({ password: hashedPassword });

    try {
        // notify resolves the editable template and records the rendered message
        // in NotificationLog after a successful delivery.
        await notify(
            {
                id: enrollee.id,
                email: enrollee.email,
                phoneNumber: enrollee.phoneNumber,
                firstName: enrollee.firstName
            },
            'enrollee',
            CORPORATE_ENROLLMENT_TEMPLATE,
            {
                firstName: enrollee.firstName,
                companyName: enrollee.Company?.name || 'Your Company',
                temporaryPassword: rawPassword,
                policyNumber: enrollee.policyNumber,
                loginLink: ENROLLEE_PORTAL_URL
            },
            ['email']
        );
    } catch (error) {
        try {
            await enrollee.update({ password: previousPassword });
        } catch (restoreError) {
            console.error(`Failed to restore password for enrollee ${enrollee.id}:`, restoreError);
        }
        throw error;
    }

    return {
        enrolleeId: enrollee.id,
        staffId: enrollee.staffId,
        email: enrollee.email
    };
}

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
            country,
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
            country: country || null,
            state: state || null,
            lga: lga || null,
            address: address || null,
            occupation: occupation || null,
            maritalStatus: maritalStatus || null,
            gender,
            phoneNumber,
            email,
            maxDependents: maxDependents === undefined || maxDependents === null || maxDependents === '' ? null : maxDependents,
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
        const { Enrollee, Staff, Company, CompanyPlan, Subscription } = req.models;
        const {
            page = 1,
            limit = 10,
            search = '',
            companyId = null,
            companyPlanId = null,
            subscriptionId = null,
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

        const staffInclude = {
            model: Staff,
            attributes: ['id', 'firstName', 'lastName', 'staffId', 'subscriptionId'],
            required: Boolean(subscriptionId),
            include: [
                {
                    model: Subscription,
                    attributes: ['id', 'code', 'startDate', 'endDate', 'status'],
                    required: false
                }
            ]
        };

        if (subscriptionId) {
            staffInclude.where = { subscriptionId };
        }

        const queryOptions = {
            where,
            include: [
                staffInclude,
                { model: Company, attributes: ['id', 'name'] },
                {
                    model: CompanyPlan,
                    as: 'companyPlan',
                    attributes: ['id', 'name', 'planType', 'planCycle', 'annualPremiumPrice', 'currency']
                }
            ],
            order: [['createdAt', 'DESC']],
            subQuery: false,
            distinct: true
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
                    pages: parsedLimit === null ? 1 : Math.ceil(count / parseInt(limit)),
                    hasNextPage: parsedLimit === null ? false : offset + rows.length < count,
                    hasPreviousPage: parsedLimit === null ? false : Number(page) > 1
                }
            },
            'Enrollees retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching enrollees:', error);
        next(error);
    }
}

async function lookupEnrollee(req, res, next) {
    try {
        const { Enrollee } = req.models;
        const { query = '' } = req.query;

        const searchValue = String(query || '').trim();
        if (!searchValue) {
            return res.fail('`query` is required', 400);
        }

        let enrollee = await Enrollee.findOne({
            where: {
                [Op.or]: [
                    { policyNumber: searchValue },
                    { email: { [Op.iLike]: searchValue } }
                ]
            },
            attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email']
        });

        if (!enrollee) {
            enrollee = await Enrollee.findOne({
                where: {
                    [Op.or]: [
                        { policyNumber: { [Op.iLike]: `%${searchValue}%` } },
                        { email: { [Op.iLike]: `%${searchValue}%` } }
                    ]
                },
                attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email'],
                order: [['createdAt', 'DESC']]
            });
        }

        if (!enrollee) return res.fail('Enrollee not found', 404);

        return res.success(
            { enrollee },
            'Enrollee lookup successful'
        );
    } catch (error) {
        console.error('Error looking up enrollee:', error);
        next(error);
    }
}

async function getEnrolleeById(req, res, next) {
    try {
        const { Enrollee, Staff, Company, CompanyPlan, Subscription, EnrolleeMedicalHistory, AuthorizationCode, Provider, Diagnosis } = req.models;
        const { enrolleeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        const enrollee = await Enrollee.findByPk(enrolleeId, {
            include: [
                {
                    model: Staff,
                    attributes: ['id', 'firstName', 'lastName', 'staffId', 'email', 'phoneNumber', 'subscriptionId'],
                    include: [
                        {
                            model: Subscription,
                            attributes: ['id', 'code', 'mode', 'startDate', 'endDate', 'status', 'notes'],
                            required: false
                        }
                    ]
                },
                { model: Company, attributes: ['id', 'name'] },
                {
                    model: CompanyPlan,
                    as: 'companyPlan',
                    attributes: [
                        'id',
                        'name',
                        'planType',
                        'planCycle',
                        'annualPremiumPrice',
                        'currency',
                        'description',
                        'maxNumberOfDependents',
                        'isActive'
                    ]
                },
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

async function updateEnrolleeBasicDetails(req, res, next) {
    try {
        const { Enrollee } = req.models;
        const { enrolleeId } = req.params;
        const updates = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        if (updates.email && updates.email !== enrollee.email) {
            return res.fail('Reach out to system admin to change the email', 400);
        }

        const allowedFields = [
            'firstName',
            'middleName',
            'lastName',
            'dateOfBirth',
            'country',
            'state',
            'lga',
            'address',
            'occupation',
            'maritalStatus',
            'gender',
            'phoneNumber',
            'maxDependents',
            'preexistingMedicalRecords'
        ];

        const payload = {};
        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(updates, field)) {
                payload[field] = updates[field];
            }
        });

        if (Object.prototype.hasOwnProperty.call(payload, 'firstName') && !payload.firstName) return res.fail('`firstName` is required', 400);
        if (Object.prototype.hasOwnProperty.call(payload, 'lastName') && !payload.lastName) return res.fail('`lastName` is required', 400);
        if (Object.prototype.hasOwnProperty.call(payload, 'dateOfBirth') && !payload.dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (Object.prototype.hasOwnProperty.call(payload, 'gender') && !payload.gender) return res.fail('`gender` is required', 400);
        if (Object.prototype.hasOwnProperty.call(payload, 'phoneNumber') && !payload.phoneNumber) return res.fail('`phoneNumber` is required', 400);

        if (!payload.firstName && !enrollee.firstName) return res.fail('`firstName` is required', 400);
        if (!payload.lastName && !enrollee.lastName) return res.fail('`lastName` is required', 400);
        if (!payload.dateOfBirth && !enrollee.dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!payload.gender && !enrollee.gender) return res.fail('`gender` is required', 400);
        if (!payload.phoneNumber && !enrollee.phoneNumber) return res.fail('`phoneNumber` is required', 400);

        await enrollee.update(payload);

        await addAuditLog(req.models, {
            action: 'enrollee.basicDetailsUpdated',
            message: `Updated basic details for enrollee with policy number ${enrollee.policyNumber}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { enrollee },
            'Enrollee basic details updated successfully'
        );
    } catch (error) {
        console.error('Error updating enrollee basic details:', error);
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
        const { Enrollee, Company, Staff, NotificationTemplate } = req.models;
        const { enrolleeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Find enrollee
        const enrollee = await Enrollee.findByPk(enrolleeId, {
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Staff,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                }
            ]
        });
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Check if enrollee has email
        if (!enrollee.email) {
            return res.fail('Enrollee email is not available', 400);
        }

        const notificationTemplate = await NotificationTemplate.findOne({
            where: { act: CORPORATE_ENROLLMENT_TEMPLATE },
            attributes: ['id', 'act', 'subj', 'emailStatus']
        });
        if (!notificationTemplate) {
            return res.fail('Complete HMO Enrollment notification template was not found', 409);
        }
        if (!notificationTemplate.emailStatus) {
            return res.fail('Complete HMO Enrollment email notification is disabled', 409);
        }

        const sent = await sendCorporateEnrollmentNotification(enrollee);
        if (sent.staffId) {
            await Staff.update(
                { isNotified: true, notifiedAt: new Date() },
                { where: { id: sent.staffId } }
            );
        }

        // Add audit log
        await addAuditLog(req.models, {
            action: 'verification.codeResent',
            message: `Resent enrollment notification to ${enrollee.email} with new password`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { message: 'Enrollment notification resent successfully with new password' },
            'Enrollment notification resent successfully'
        );
    } catch (error) {
        console.error('Error resending verification code:', error);
        next(error);
    }
}

async function bulkResendEnrollmentNotifications(req, res, next) {
    try {
        const { Enrollee, Company, Staff, NotificationTemplate } = req.models;
        const {
            enrolleeIds: requestedEnrolleeIds,
            companyId: requestedCompanyId,
            sendAllForCompany = false,
            confirmation
        } = req.body || {};

        const companyId = typeof requestedCompanyId === 'string'
            ? requestedCompanyId.trim()
            : '';
        const enrolleeIds = Array.isArray(requestedEnrolleeIds)
            ? [...new Set(
                requestedEnrolleeIds
                    .filter((id) => typeof id === 'string')
                    .map((id) => id.trim())
                    .filter(Boolean)
            )]
            : [];

        let company = null;
        let where;
        let scope;

        if (sendAllForCompany === true) {
            if (!companyId) {
                return res.fail('`companyId` is required to notify all enrollees for a company', 400);
            }
            if (confirmation !== companyId) {
                return res.fail('Company notification confirmation does not match the selected company', 400);
            }

            company = await Company.findByPk(companyId, {
                attributes: ['id', 'name']
            });
            if (!company) return res.fail('Company not found', 404);

            where = { companyId };
            scope = 'company';
        } else {
            if (enrolleeIds.length === 0) {
                return res.fail('Select at least one enrollee to notify', 400);
            }
            if (enrolleeIds.length > 1000) {
                return res.fail('A maximum of 1,000 selected enrollees can be notified at once', 400);
            }

            where = {
                id: { [Op.in]: enrolleeIds },
                ...(companyId ? { companyId } : {})
            };
            scope = 'selected';
        }

        const notificationTemplate = await NotificationTemplate.findOne({
            where: { act: CORPORATE_ENROLLMENT_TEMPLATE },
            attributes: ['id', 'act', 'subj', 'emailStatus']
        });
        if (!notificationTemplate) {
            return res.fail('Complete HMO Enrollment notification template was not found', 409);
        }
        if (!notificationTemplate.emailStatus) {
            return res.fail('Complete HMO Enrollment email notification is disabled', 409);
        }

        const enrollees = await Enrollee.findAll({
            where,
            attributes: [
                'id',
                'firstName',
                'lastName',
                'email',
                'phoneNumber',
                'policyNumber',
                'password',
                'companyId',
                'staffId'
            ],
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        if (scope === 'selected' && enrollees.length !== enrolleeIds.length) {
            return res.fail(
                companyId
                    ? 'One or more selected enrollees do not belong to the selected company or no longer exist'
                    : 'One or more selected enrollees no longer exist',
                409
            );
        }
        if (enrollees.length === 0) {
            return res.fail('No enrollees found for this notification request', 404);
        }

        const outcomes = await mapWithConcurrency(
            enrollees,
            5,
            sendCorporateEnrollmentNotification
        );
        const sent = outcomes
            .filter((outcome) => outcome.ok)
            .map((outcome) => outcome.value);
        const failures = outcomes
            .map((outcome, index) => ({ outcome, enrollee: enrollees[index] }))
            .filter(({ outcome }) => !outcome.ok)
            .map(({ outcome, enrollee }) => ({
                enrolleeId: enrollee.id,
                email: enrollee.email || null,
                reason: outcome.error instanceof Error
                    ? outcome.error.message
                    : 'Notification could not be sent'
            }));

        const notifiedStaffIds = [...new Set(sent.map((item) => item.staffId).filter(Boolean))];
        if (notifiedStaffIds.length > 0) {
            try {
                await Staff.update(
                    { isNotified: true, notifiedAt: new Date() },
                    { where: { id: { [Op.in]: notifiedStaffIds } } }
                );
            } catch (staffUpdateError) {
                console.error('Failed to update staff notification status:', staffUpdateError);
            }
        }

        try {
            await addAuditLog(req.models, {
                action: scope === 'company'
                    ? 'enrollee.bulk_resend_enrollment_notification_company'
                    : 'enrollee.bulk_resend_enrollment_notification',
                message: scope === 'company'
                    ? `Complete HMO Enrollment notification retriggered for ${sent.length} enrollee(s) in ${company.name}`
                    : `Complete HMO Enrollment notification retriggered for ${sent.length} selected enrollee(s)`,
                userId: req.user?.id || null,
                userType: req.user?.type || 'admin',
                meta: {
                    scope,
                    companyId: companyId || null,
                    templateAct: CORPORATE_ENROLLMENT_TEMPLATE,
                    requestedCount: enrollees.length,
                    sentCount: sent.length,
                    failedCount: failures.length,
                    failedEnrolleeIds: failures.map((failure) => failure.enrolleeId)
                }
            });
        } catch (auditError) {
            console.error('Failed to record bulk enrollment notification audit log:', auditError);
        }

        return res.success(
            {
                scope,
                companyId: companyId || null,
                template: {
                    act: notificationTemplate.act,
                    subject: notificationTemplate.subj
                },
                requestedCount: enrollees.length,
                sentCount: sent.length,
                failedCount: failures.length,
                failures
            },
            failures.length === 0
                ? `Enrollment notification sent to ${sent.length} enrollee(s)`
                : `Enrollment notification sent to ${sent.length} enrollee(s); ${failures.length} failed`
        );
    } catch (error) {
        console.error('Error bulk resending enrollment notifications:', error);
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

        const idCardUrl = resolveMemberIdCardUrl(enrollee);
        if (!idCardUrl) {
            return res.fail('ID card not available for this enrollee', 404);
        }

        return res.success(
            { idCardUrl },
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
    lookupEnrollee,
    getEnrolleeById,
    updateEnrollee,
    updateEnrolleeBasicDetails,
    deleteEnrollee,
    sendVerificationCode,
    verifyEnrollee,
    resendVerificationCode,
    bulkResendEnrollmentNotifications,
    downloadIdCard
};
