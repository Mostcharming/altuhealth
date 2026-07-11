const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const notify = require('../../../utils/notify');
const config = require('../../../config');
const generateCode = require('../../../utils/verificationCode');
const {
    MAX_BULK_STAFF_ROWS,
    parseBulkStaffFile,
    prepareStaffRow
} = require('./bulkUpload');

async function runWithConcurrency(items, concurrency, worker) {
    let cursor = 0;
    const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        async () => {
            while (cursor < items.length) {
                const index = cursor;
                cursor += 1;
                await worker(items[index]);
            }
        }
    );

    await Promise.allSettled(workers);
}

function queueEnrollmentNotifications(models, company, notificationTasks) {
    if (!notificationTasks.length) return;

    setImmediate(async () => {
        await runWithConcurrency(notificationTasks, 5, async ({ staff, enrollee, rawPassword }) => {
            try {
                await notify(
                    { id: staff.id, email: staff.email, firstName: staff.firstName },
                    'staff',
                    'STAFF_ENROLLMENT_REQUIRED',
                    {
                        firstName: staff.firstName,
                        companyName: company.name,
                        loginLink: 'https://enrollee.altuhealth.com',
                        temporaryPassword: rawPassword,
                        policyNumber: enrollee.policyNumber
                    },
                    ['email']
                );

                await models.Staff.update(
                    { isNotified: true, notifiedAt: new Date() },
                    { where: { id: staff.id } }
                );
            } catch (error) {
                console.error(`Background enrollment notification failed for ${staff.email}:`, error);
            }
        });
    });
}

async function createStaff(req, res, next) {
    let transaction;
    try {
        const { Staff, Company, CompanySubsidiary, Subscription, Enrollee, CompanyPlan, SubscriptionPlan } = req.models;
        const { firstName, middleName, lastName, email, phoneNumber, staffId, companyId, subsidiaryId, dateOfBirth, maxDependents, preexistingMedicalRecords, subscriptionId, gender, policyNumber } = req.body || {};

        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!companyId) return res.fail('`companyId` is required', 400);

        const company = await Company.findByPk(companyId);
        if (!company) return res.fail('Company not found', 404);

        if (subsidiaryId) {
            const subsidiary = await CompanySubsidiary.findByPk(subsidiaryId);
            if (!subsidiary) return res.fail('Subsidiary not found', 404);
            if (subsidiary.companyId !== companyId) {
                return res.fail('Subsidiary does not belong to the specified company', 400);
            }
        }
        if (subscriptionId) {
            const subscription = await Subscription.findByPk(subscriptionId);
            if (!subscription) return res.fail('Subscription not found', 404);
            if (subscription.companyId !== companyId) {
                return res.fail('Subscription does not belong to the specified company', 400);
            }
        }
        // Auto-generate email if not provided
        const generatedEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.name.toLowerCase().replace(/\s+/g, '')}.enrollee`;

        if (generatedEmail) {
            const existingEmail = await Staff.findOne({ where: { email: generatedEmail } });
            if (existingEmail) return res.fail('Email already exists', 400);
        }

        const providedPolicyNumber = policyNumber && String(policyNumber).trim() ? String(policyNumber).trim() : null;
        if (providedPolicyNumber) {
            const existingPolicyNumber = await Enrollee.findOne({ where: { policyNumber: providedPolicyNumber } });
            if (existingPolicyNumber) return res.fail('Policy number already exists', 400);
        }

        // Auto-generate staffId if not provided
        const generatedStaffId = staffId || `STF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Start transaction for atomic staff and enrollee creation
        transaction = await Staff.sequelize.transaction();

        const staff = await Staff.create({
            firstName,
            middleName: middleName || null,
            lastName,
            email: generatedEmail,
            phoneNumber,
            staffId: generatedStaffId,
            companyId,
            subsidiaryId: subsidiaryId || null,
            dateOfBirth: dateOfBirth || null,
            maxDependents: maxDependents === undefined || maxDependents === null || maxDependents === '' ? null : maxDependents,
            preexistingMedicalRecords: preexistingMedicalRecords || null,
            subscriptionId: subscriptionId || null
        }, { transaction });

        // Always create enrollee for staff member
        let enrollee = null;
        let rawPassword = null;
        let hashedPassword = null;

        try {

            const subscriptionPlan = await SubscriptionPlan.findOne({
                where: { subscriptionId },
                raw: true
            });

            const planId = subscriptionPlan.companyPlanId;

            const companyPlan = await CompanyPlan.findByPk(planId);

            if (companyPlan) {
                const enrolleePolicyNumber = providedPolicyNumber || await getUniquePolicyNumber(Enrollee);

                // Generate password for enrollee
                rawPassword = generateCode(10, { letters: true, numbers: true });
                hashedPassword = await bcrypt.hash(rawPassword, 10);

                enrollee = await Enrollee.create({
                    firstName,
                    middleName: middleName || null,
                    lastName,
                    policyNumber: enrolleePolicyNumber,
                    staffId: staff.id,
                    companyId,
                    companyPlanId: planId,
                    dateOfBirth: dateOfBirth || new Date('1990-01-01'),
                    gender: gender || 'other',
                    phoneNumber: phoneNumber || generatedEmail,
                    email: generatedEmail,
                    maxDependents: maxDependents === undefined || maxDependents === null || maxDependents === '' ? null : maxDependents,
                    preexistingMedicalRecords: preexistingMedicalRecords || null,
                    isActive: true,
                    password: hashedPassword
                }, { transaction });

                await staff.update({
                    enrollmentStatus: 'enrolled'
                }, { transaction });
            }
        } catch (enrolleeErr) {
            console.error('Error creating enrollee:', enrolleeErr);
            // Continue even if enrollee creation fails - staff will still be created
        }

        // Commit transaction before audit log and notifications (which are not critical for atomicity)
        await transaction.commit();

        await addAuditLog(req.models, {
            action: 'staff.create',
            message: `Staff ${staff.firstName} ${staff.lastName} created${enrollee ? ` and enrollee created with policy ${enrollee.policyNumber}` : ''}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { staffId: staff.id, enrolleeId: enrollee?.id, policyNumber: enrollee?.policyNumber }
        });

        // Send notification with generated password and policy details
        if (staff.email) {
            const enrollmentLink = `https://enrollee.altuhealth.com`;

            try {
                const notificationData = {
                    firstName: staff.firstName,
                    companyName: company.name,
                    loginLink: enrollmentLink
                };

                // Include password and policy number in notification if enrollee was created
                if (enrollee) {
                    notificationData.temporaryPassword = rawPassword;
                    notificationData.policyNumber = enrollee.policyNumber;
                }

                await notify(
                    { id: staff.id, email: staff.email, firstName: staff.firstName, },
                    'staff',
                    'STAFF_ENROLLMENT_REQUIRED',
                    notificationData
                );

                await staff.update({
                    isNotified: true,
                    notifiedAt: new Date()
                });
            } catch (notifyErr) {
                console.error('Error sending enrollment email:', notifyErr);
            }
        }

        return res.success({ staff: staff.toJSON(), enrollee: enrollee?.toJSON() }, 'Staff created', 201);
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        return next(err);
    }
}

async function updateStaff(req, res, next) {
    try {
        const { Staff, Company, CompanySubsidiary, Subscription } = req.models;
        const { id } = req.params;
        const { firstName, middleName, lastName, email, phoneNumber, staffId, companyId, subsidiaryId, enrollmentStatus, isNotified, notifiedAt, isActive, dateOfBirth, maxDependents, preexistingMedicalRecords, subscriptionId } = req.body || {};

        const staff = await Staff.findByPk(id);
        if (!staff) return res.fail('Staff not found', 404);

        const updates = {};

        if (firstName !== undefined) updates.firstName = firstName;
        if (middleName !== undefined) updates.middleName = middleName;
        if (lastName !== undefined) updates.lastName = lastName;

        if (email !== undefined) {
            if (email) {
                const existingEmail = await Staff.findOne({ where: { email, id: { [Op.ne]: id } } });
                if (existingEmail) return res.fail('Email already exists', 400);
            }
            updates.email = email || null;
        }

        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber || null;

        if (staffId !== undefined) {
            if (staffId) {
                const existingStaffId = await Staff.findOne({ where: { staffId, id: { [Op.ne]: id } } });
                if (existingStaffId) return res.fail('Staff ID already exists', 400);
            }
            updates.staffId = staffId || null;
        }

        if (companyId !== undefined) {
            const company = await Company.findByPk(companyId);
            if (!company) return res.fail('Company not found', 404);
            updates.companyId = companyId;
        }

        if (subsidiaryId !== undefined) {
            if (subsidiaryId) {
                const subsidiary = await CompanySubsidiary.findByPk(subsidiaryId);
                if (!subsidiary) return res.fail('Subsidiary not found', 404);
                const targetCompanyId = companyId || staff.companyId;
                if (subsidiary.companyId !== targetCompanyId) {
                    return res.fail('Subsidiary does not belong to the specified company', 400);
                }
            }
            updates.subsidiaryId = subsidiaryId || null;
        }

        if (enrollmentStatus !== undefined) {
            if (!['enrolled', 'not_enrolled'].includes(enrollmentStatus)) {
                return res.fail('Invalid `enrollmentStatus`. Must be one of: enrolled, not_enrolled', 400);
            }
            updates.enrollmentStatus = enrollmentStatus;
        }

        if (isNotified !== undefined) updates.isNotified = isNotified;

        if (notifiedAt !== undefined) updates.notifiedAt = notifiedAt;

        if (isActive !== undefined) updates.isActive = isActive;

        if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth || null;

        if (maxDependents !== undefined) {
            updates.maxDependents = maxDependents === null || maxDependents === '' ? null : maxDependents;
        }

        if (preexistingMedicalRecords !== undefined) updates.preexistingMedicalRecords = preexistingMedicalRecords || null;

        if (subscriptionId !== undefined) {
            if (subscriptionId) {
                const subscription = await Subscription.findByPk(subscriptionId);
                if (!subscription) return res.fail('Subscription not found', 404);
                const targetCompanyId = companyId || staff.companyId;
                if (subscription.companyId !== targetCompanyId) {
                    return res.fail('Subscription does not belong to the specified company', 400);
                }
            }
            updates.subscriptionId = subscriptionId || null;
        }

        await staff.update(updates);

        await addAuditLog(req.models, {
            action: 'staff.update',
            message: `Staff ${staff.firstName} ${staff.lastName} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { staffId: staff.id }
        });

        return res.success({ staff }, 'Staff updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteStaff(req, res, next) {
    try {
        const { Staff } = req.models;
        const { id } = req.params;

        const staff = await Staff.findByPk(id);
        if (!staff) return res.fail('Staff not found', 404);

        await staff.destroy();

        await addAuditLog(req.models, {
            action: 'staff.delete',
            message: `Staff ${staff.firstName} ${staff.lastName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { staffId: id }
        });

        return res.success(null, 'Staff deleted');
    } catch (err) {
        return next(err);
    }
}

async function listStaffs(req, res, next) {
    try {
        const { Staff, Company, CompanySubsidiary, CompanyPlan } = req.models;
        const { limit = 10, page = 1, q, companyId, subsidiaryId, enrollmentStatus, isNotified, isActive } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { firstName: { [Op.iLike || Op.like]: `%${q}%` } },
                { lastName: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } },
                { staffId: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (companyId) {
            where.companyId = companyId;
        }

        if (subsidiaryId) {
            where.subsidiaryId = subsidiaryId;
        }

        if (enrollmentStatus) {
            where.enrollmentStatus = enrollmentStatus;
        }

        if (isNotified !== undefined) {
            where.isNotified = isNotified === 'true';
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const total = await Staff.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanySubsidiary,
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const staffs = await Staff.findAll(findOptions);
        const data = staffs.map(s => s.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + staffs.length < total);
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

async function getStaff(req, res, next) {
    try {
        const { Staff, Company, CompanySubsidiary, CompanyPlan } = req.models;
        const { id } = req.params;

        const staff = await Staff.findByPk(id, {
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanySubsidiary,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanyPlan,
                    attributes: ['id', 'name', 'planId'],
                    required: false
                }
            ]
        });

        if (!staff) return res.fail('Staff not found', 404);

        return res.success(staff.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function getEnrollmentStatusOptions(req, res, next) {
    try {
        const enrollmentStatusOptions = ['enrolled', 'not_enrolled'];
        return res.success({ enrollmentStatusOptions });
    } catch (err) {
        return next(err);
    }
}

async function downloadCompanyEnrollees(req, res, next) {
    try {
        const { Staff, Enrollee, Company, CompanyPlan } = req.models;
        const { companyId } = req.params;

        if (!companyId) return res.fail('`companyId` is required', 400);

        const company = await Company.findByPk(companyId, {
            attributes: ['id', 'name'],
            raw: true
        });
        if (!company) return res.fail('Company not found', 404);

        const staffs = await Staff.findAll({
            where: { companyId },
            attributes: ['id'],
            raw: true
        });

        const staffIds = staffs.map((staff) => staff.id);
        if (staffIds.length === 0) {
            return res.fail('No staff found for this company', 404);
        }

        const enrollees = await Enrollee.findAll({
            where: { staffId: { [Op.in]: staffIds } },
            include: [
                {
                    model: Staff,
                    attributes: ['id', 'firstName', 'lastName', 'staffId', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanyPlan,
                    as: 'companyPlan',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const rows = enrollees.map((enrollee, index) => {
            const item = enrollee.toJSON();
            return {
                'S/N': index + 1,
                'Policy Number': item.policyNumber || '',
                'First Name': item.firstName || '',
                'Middle Name': item.middleName || '',
                'Last Name': item.lastName || '',
                Email: item.email || '',
                'Phone Number': item.phoneNumber || '',
                Gender: item.gender || '',
                'Date of Birth': item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : '',
                Country: item.country || '',
                State: item.state || '',
                LGA: item.lga || '',
                Address: item.address || '',
                Occupation: item.occupation || '',
                'Marital Status': item.maritalStatus || '',
                'Company': item.Company?.name || company.name || '',
                'Company Plan': item.companyPlan?.name || '',
                'Staff ID': item.Staff?.staffId || '',
                'Staff Name': [item.Staff?.firstName, item.Staff?.lastName].filter(Boolean).join(' '),
                'Max Dependents': item.maxDependents ?? '',
                'Pre-existing Medical Records': item.preexistingMedicalRecords || '',
                Status: item.isActive ? 'Active' : 'Inactive',
                Verified: item.isVerified ? 'Yes' : 'No',
                'Created At': item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : ''
            };
        });

        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Enrollees');

        const buffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer'
        });

        const safeCompanyName = String(company.name || 'company')
            .replace(/[^a-z0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
        const filename = `${safeCompanyName || 'company'}-enrollees.xlsx`;

        await addAuditLog(req.models, {
            action: 'staff.company_enrollees_download',
            message: `Downloaded enrollee list for company ${company.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyId, enrolleeCount: enrollees.length }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    } catch (err) {
        return next(err);
    }
}

async function downloadCompanyStaffs(req, res, next) {
    try {
        const { Staff, Enrollee, Company, CompanySubsidiary, Subscription } = req.models;
        const { companyId } = req.params;

        if (!companyId) return res.fail('`companyId` is required', 400);

        const company = await Company.findByPk(companyId, {
            attributes: ['id', 'name'],
            raw: true
        });
        if (!company) return res.fail('Company not found', 404);

        const staffs = await Staff.findAll({
            where: { companyId },
            attributes: [
                'id',
                'firstName',
                'middleName',
                'lastName',
                'email',
                'phoneNumber',
                'staffId',
                'dateOfBirth',
                'maxDependents',
                'preexistingMedicalRecords',
                'enrollmentStatus',
                'isNotified',
                'notifiedAt',
                'isActive',
                'createdAt'
            ],
            include: [
                {
                    model: Enrollee,
                    as: 'enrollee',
                    attributes: ['id', 'policyNumber', 'gender', 'isActive', 'createdAt'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanySubsidiary,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Subscription,
                    attributes: ['id', 'code', 'status', 'startDate', 'endDate'],
                    required: false
                }
            ],
            order: [
                ['lastName', 'ASC'],
                ['firstName', 'ASC']
            ]
        });

        if (staffs.length === 0) {
            return res.fail('No staff found for this company', 404);
        }

        const formatDate = (value) => value ? new Date(value).toISOString().split('T')[0] : '';
        const rows = staffs.map((staff, index) => {
            const item = staff.toJSON();
            return {
                'S/N': index + 1,
                'Policy Number': item.enrollee?.policyNumber || '',
                'First Name': item.firstName || '',
                'Middle Name': item.middleName || '',
                'Last Name': item.lastName || '',
                Email: item.email || '',
                'Phone Number': item.phoneNumber || '',
                'Staff ID': item.staffId || '',
                Company: item.Company?.name || company.name || '',
                Subsidiary: item.CompanySubsidiary?.name || '',
                Subscription: item.Subscription?.code || '',
                'Subscription Status': item.Subscription?.status || '',
                'Subscription Start Date': formatDate(item.Subscription?.startDate),
                'Subscription End Date': formatDate(item.Subscription?.endDate),
                'Date of Birth': formatDate(item.dateOfBirth),
                Gender: item.enrollee?.gender || '',
                'Max Dependents': item.maxDependents ?? '',
                'Pre-existing Medical Records': item.preexistingMedicalRecords || '',
                'Enrollment Status': item.enrollmentStatus || '',
                Notified: item.isNotified ? 'Yes' : 'No',
                'Notified At': formatDate(item.notifiedAt),
                Status: item.isActive ? 'Active' : 'Inactive',
                'Enrollee Status': item.enrollee ? (item.enrollee.isActive ? 'Active' : 'Inactive') : '',
                'Created At': formatDate(item.createdAt)
            };
        });

        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff List');

        const buffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer'
        });

        const safeCompanyName = String(company.name || 'company')
            .replace(/[^a-z0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
        const filename = `${safeCompanyName || 'company'}-staff-list.xlsx`;

        await addAuditLog(req.models, {
            action: 'staff.company_staffs_download',
            message: `Downloaded staff list for company ${company.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyId, staffCount: staffs.length }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    } catch (err) {
        return next(err);
    }
}

async function bulkNotifyStaffs(req, res, next) {
    try {
        const { Staff } = req.models;
        const { staffIds } = req.body || {};

        if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
            return res.fail('`staffIds` array is required', 400);
        }

        const updateCount = await Staff.update(
            { isNotified: true, notifiedAt: new Date() },
            { where: { id: { [Op.in]: staffIds } } }
        );

        await addAuditLog(req.models, {
            action: 'staff.bulk_notify',
            message: `${updateCount[0]} staff(s) marked as notified`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { notifiedCount: updateCount[0] }
        });

        return res.success({ notifiedCount: updateCount[0] }, 'Staff(s) marked as notified');
    } catch (err) {
        return next(err);
    }
}

async function bulkEnrollStaffs(req, res, next) {
    try {
        const { Staff } = req.models;
        const { staffIds } = req.body || {};

        if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
            return res.fail('`staffIds` array is required', 400);
        }

        const updateCount = await Staff.update(
            { enrollmentStatus: 'enrolled' },
            { where: { id: { [Op.in]: staffIds } } }
        );

        await addAuditLog(req.models, {
            action: 'staff.bulk_enroll',
            message: `${updateCount[0]} staff(s) enrolled`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { enrolledCount: updateCount[0] }
        });

        return res.success({ enrolledCount: updateCount[0] }, 'Staff(s) enrolled successfully');
    } catch (err) {
        return next(err);
    }
}

async function bulkCreateStaffs(req, res, next) {
    const file = req.file;

    try {
        const { Staff, Company, CompanySubsidiary, Subscription, Enrollee, CompanyPlan, SubscriptionPlan } = req.models;
        const { companyId, subsidiaryId, subscriptionId, companyPlanId } = req.body || {};

        req.setTimeout(120000);
        res.setTimeout(120000);

        if (!file) {
            return res.fail('File is required', 400);
        }

        if (!companyId) {
            return res.fail('`companyId` is required', 400);
        }

        if (!subscriptionId) {
            return res.fail('`subscriptionId` is required', 400);
        }

        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.fail('Company not found', 404);
        }

        if (subsidiaryId) {
            const subsidiary = await CompanySubsidiary.findByPk(subsidiaryId);
            if (!subsidiary) {
                return res.fail('Subsidiary not found', 404);
            }
            if (subsidiary.companyId !== companyId) {
                return res.fail('Subsidiary does not belong to the specified company', 400);
            }
        }

        const subscription = await Subscription.findByPk(subscriptionId);
        if (!subscription) {
            return res.fail('Subscription not found', 404);
        }
        if (subscription.companyId !== companyId) {
            return res.fail('Subscription does not belong to the specified company', 400);
        }

        const now = new Date();
        if (
            subscription.status !== 'active'
            || new Date(subscription.startDate) > now
            || new Date(subscription.endDate) < now
        ) {
            return res.fail('The selected subscription is not currently active', 400);
        }

        const subscriptionPlans = await SubscriptionPlan.findAll({
            where: { subscriptionId },
            attributes: ['companyPlanId'],
            raw: true
        });
        if (!subscriptionPlans.length) {
            return res.fail('No company plan is linked to the selected subscription', 400);
        }

        const selectedPlanLink = companyPlanId
            ? subscriptionPlans.find((item) => String(item.companyPlanId) === String(companyPlanId))
            : subscriptionPlans.length === 1
                ? subscriptionPlans[0]
                : null;

        if (!selectedPlanLink) {
            return res.fail(
                companyPlanId
                    ? 'The selected company plan is not linked to this subscription'
                    : '`companyPlanId` is required when a subscription has multiple plans',
                400
            );
        }

        const companyPlan = await CompanyPlan.findByPk(selectedPlanLink.companyPlanId);
        if (!companyPlan || companyPlan.companyId !== companyId || companyPlan.isActive === false) {
            return res.fail('The selected company plan is invalid or inactive', 400);
        }

        const rows = await parseBulkStaffFile(file);

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.fail('File is empty or has no valid data', 400);
        }

        if (rows.length > MAX_BULK_STAFF_ROWS) {
            return res.fail(
                `A maximum of ${MAX_BULK_STAFF_ROWS} staff rows can be uploaded at once`,
                400
            );
        }

        const createdStaffs = [];
        const createdEnrollees = [];
        const errors = [];
        const notificationTasks = [];
        const preparedRows = rows.map((row, index) => prepareStaffRow(row, {
            companyName: company.name,
            rowNumber: index + 2
        }));
        const seenEmails = new Map();
        const seenPolicies = new Map();

        preparedRows.forEach((entry) => {
            const emailKey = entry.data.email.toLowerCase();
            if (seenEmails.has(emailKey)) {
                entry.errors.push(`email duplicates row ${seenEmails.get(emailKey)}`);
            } else {
                seenEmails.set(emailKey, entry.rowNumber);
            }

            if (entry.data.policyNumber) {
                const policyKey = entry.data.policyNumber.toUpperCase();
                if (seenPolicies.has(policyKey)) {
                    entry.errors.push(`policyNumber duplicates row ${seenPolicies.get(policyKey)}`);
                } else {
                    seenPolicies.set(policyKey, entry.rowNumber);
                }
            }
        });

        const uploadEmails = Array.from(seenEmails.keys());
        const uploadPolicies = Array.from(seenPolicies.keys());
        const [existingStaffs, existingEnrollees] = await Promise.all([
            uploadEmails.length
                ? Staff.findAll({
                    where: { email: { [Op.in]: uploadEmails } },
                    attributes: ['email'],
                    raw: true
                })
                : [],
            uploadPolicies.length
                ? Enrollee.findAll({
                    where: { policyNumber: { [Op.in]: uploadPolicies } },
                    attributes: ['policyNumber'],
                    raw: true
                })
                : []
        ]);
        const existingEmails = new Set(existingStaffs.map((staff) => String(staff.email).toLowerCase()));
        const existingPolicies = new Set(
            existingEnrollees.map((enrollee) => String(enrollee.policyNumber).toUpperCase())
        );

        preparedRows.forEach((entry) => {
            if (existingEmails.has(entry.data.email.toLowerCase())) {
                entry.errors.push('email already exists');
            }
            if (
                entry.data.policyNumber
                && existingPolicies.has(entry.data.policyNumber.toUpperCase())
            ) {
                entry.errors.push('policyNumber already exists');
            }
        });

        await Promise.all(
            preparedRows
                .filter((entry) => entry.errors.length === 0)
                .map(async (entry) => {
                    entry.rawPassword = generateCode(10, { letters: true, numbers: true });
                    entry.hashedPassword = await bcrypt.hash(entry.rawPassword, 10);
                })
        );

        for (const entry of preparedRows) {
            let transaction;

            if (entry.errors.length) {
                errors.push({
                    row: entry.rowNumber,
                    message: entry.errors.join('; '),
                    errors: entry.errors
                });
                continue;
            }

            try {
                const {
                    firstName,
                    middleName,
                    lastName,
                    email,
                    phoneNumber,
                    staffId,
                    dateOfBirth,
                    maxDependents,
                    preexistingMedicalRecords,
                    gender,
                    policyNumber
                } = entry.data;

                const generatedStaffId = staffId || `STF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                transaction = await Staff.sequelize.transaction();

                const staff = await Staff.create({
                    firstName,
                    middleName,
                    lastName,
                    email,
                    phoneNumber,
                    staffId: generatedStaffId,
                    companyId,
                    subsidiaryId: subsidiaryId || null,
                    dateOfBirth: dateOfBirth || null,
                    maxDependents,
                    preexistingMedicalRecords,
                    subscriptionId
                }, { transaction });

                if (Staff.sequelize.getDialect() === 'postgres') {
                    await Staff.sequelize.query(
                        "SELECT pg_advisory_xact_lock(hashtext('enrollee_policy_number'))",
                        { transaction }
                    );
                }

                const enrolleePolicyNumber = policyNumber
                    || await getUniquePolicyNumber(Enrollee, { transaction });
                const enrollee = await Enrollee.create({
                    firstName,
                    middleName,
                    lastName,
                    policyNumber: enrolleePolicyNumber,
                    staffId: staff.id,
                    companyId,
                    companyPlanId: companyPlan.id,
                    dateOfBirth: dateOfBirth || new Date('1990-01-01'),
                    expirationDate: subscription.endDate,
                    gender,
                    phoneNumber: phoneNumber || email,
                    email,
                    maxDependents,
                    preexistingMedicalRecords,
                    isActive: true,
                    password: entry.hashedPassword
                }, { transaction });

                await staff.update({ enrollmentStatus: 'enrolled' }, { transaction });
                await transaction.commit();

                createdStaffs.push(staff.toJSON());
                createdEnrollees.push(enrollee.toJSON());
                notificationTasks.push({
                    staff: staff.toJSON(),
                    enrollee: enrollee.toJSON(),
                    rawPassword: entry.rawPassword
                });
            } catch (err) {
                if (transaction && !transaction.finished) {
                    await transaction.rollback();
                }
                errors.push({
                    row: entry.rowNumber,
                    message: err.message,
                    errors: [err.message]
                });
            }
        }

        try {
            await addAuditLog(req.models, {
                action: 'staff.bulk_create',
                message: `${createdStaffs.length} staff(s) and enrollee(s) created via bulk upload`,
                userId: (req.user && req.user.id) ? req.user.id : null,
                userType: (req.user && req.user.type) ? req.user.type : null,
                meta: {
                    createdCount: createdStaffs.length,
                    enrolleeCount: createdEnrollees.length,
                    errorCount: errors.length,
                    subscriptionId,
                    companyPlanId: companyPlan.id
                }
            });
        } catch (auditError) {
            console.error('Failed to record staff bulk upload audit log:', auditError);
        }

        queueEnrollmentNotifications(req.models, company, notificationTasks);

        const message =
            errors.length > 0
                ? `${createdStaffs.length} staff(s) created with ${errors.length} error(s)`
                : `${createdStaffs.length} staff(s) created successfully`;

        return res.success(
            {
                staffs: createdStaffs,
                enrollees: createdEnrollees,
                errors,
                createdCount: createdStaffs.length,
                enrolleeCount: createdEnrollees.length,
                errorCount: errors.length,
                totalRows: preparedRows.length,
                notificationQueuedCount: notificationTasks.length,
                companyPlan: {
                    id: companyPlan.id,
                    name: companyPlan.name
                }
            },
            message,
            errors.length > 0 ? 207 : 201
        );
    } catch (err) {
        return next(err);
    } finally {
        if (file?.path) {
            const fs = require('fs');
            await fs.promises.unlink(file.path).catch((error) => {
                if (error.code !== 'ENOENT') {
                    console.error('Error deleting uploaded staff file:', error);
                }
            });
        }
    }
}

async function resendEnrollmentNotification(req, res, next) {
    try {
        const { Staff, Company, Enrollee } = req.models;
        const { id } = req.params;

        const staff = await Staff.findByPk(id, {
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        });

        if (!staff) {
            return res.fail('Staff not found', 404);
        }

        if (!staff.email) {
            return res.fail('Staff email is not available', 400);
        }

        // Find enrollee record by staff.id
        const enrollee = await Enrollee.findOne({
            where: { staffId: staff.id }
        });

        if (!enrollee) {
            return res.fail('Enrollee record not found for this staff', 404);
        }

        // Generate a new password and hash it
        const rawPassword = generateCode(10, { letters: true, numbers: true });
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Update enrollee with new password
        await enrollee.update({
            password: hashedPassword
        });

        const enrollmentLink = `https://enrollee.altuhealth.com`;
        const company = staff.Company;
        const companyName = company ? company.name : 'Your Company';
        const policyNumber = enrollee.policyNumber;

        try {
            await notify(
                { id: staff.id, email: staff.email, firstName: staff.firstName, },
                'staff',
                'STAFF_ENROLLMENT_REMINDER',
                {
                    firstName: staff.firstName,
                    companyName: companyName,
                    loginLink: enrollmentLink,
                    policyNumber: policyNumber,
                    temporaryPassword: rawPassword
                }
            );

            // Update the notified status and timestamp
            await staff.update({
                isNotified: true,
                notifiedAt: new Date()
            });

            await addAuditLog(req.models, {
                action: 'staff.resend_enrollment_notification',
                message: `Enrollment notification resent to staff ${staff.firstName} ${staff.lastName}`,
                userId: (req.user && req.user.id) ? req.user.id : null,
                userType: (req.user && req.user.type) ? req.user.type : null,
                meta: { staffId: staff.id }
            });

            return res.success(
                { staff: staff.toJSON(), enrollee: enrollee.toJSON() },
                'Enrollment notification sent successfully'
            );
        } catch (notifyErr) {
            console.error('Error sending enrollment email:', notifyErr);
            return res.fail(
                'Failed to send enrollment notification. Please try again.',
                500
            );
        }
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createStaff,
    updateStaff,
    deleteStaff,
    listStaffs,
    getStaff,
    getEnrollmentStatusOptions,
    downloadCompanyStaffs,
    downloadCompanyEnrollees,
    bulkNotifyStaffs,
    bulkEnrollStaffs,
    bulkCreateStaffs,
    resendEnrollmentNotification
};
