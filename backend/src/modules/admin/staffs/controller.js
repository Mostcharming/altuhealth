const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const notify = require('../../../utils/notify');
const config = require('../../../config');
const generateCode = require('../../../utils/verificationCode');

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
            maxDependents: maxDependents || null,
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
                    maxDependents: maxDependents || null,
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

        if (maxDependents !== undefined) updates.maxDependents = maxDependents || null;

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
    try {
        const { Staff, Company, CompanySubsidiary, Subscription, Enrollee, CompanyPlan, SubscriptionPlan } = req.models;
        const { companyId, subsidiaryId, subscriptionId } = req.body || {};
        const file = req.file;

        if (!file) {
            return res.fail('File is required', 400);
        }

        if (!companyId) {
            return res.fail('`companyId` is required', 400);
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

        if (subscriptionId) {
            const subscription = await Subscription.findByPk(subscriptionId);
            if (!subscription) {
                return res.fail('Subscription not found', 404);
            }
            if (subscription.companyId !== companyId) {
                return res.fail('Subscription does not belong to the specified company', 400);
            }
        }

        let rows = [];
        const fs = require('fs');
        const path = require('path');

        if (file.mimetype === 'text/csv') {
            const csv = require('csv-parser');
            rows = await new Promise((resolve, reject) => {
                const data = [];
                fs.createReadStream(file.path)
                    .pipe(csv())
                    .on('data', (row) => data.push(row))
                    .on('end', () => resolve(data))
                    .on('error', reject);
            });
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile(file.path);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(worksheet);
        } else {
            return res.fail('Invalid file format. Only CSV and Excel files are supported', 400);
        }

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.fail('File is empty or has no valid data', 400);
        }

        const createdStaffs = [];
        const createdEnrollees = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            let transaction;
            try {
                const row = rows[i];
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
                    policyNumber,
                    subscriptionId: rowSubscriptionId
                } = row;

                if (!firstName) {
                    errors.push(`Row ${i + 2}: firstName is required`);
                    continue;
                }
                if (!lastName) {
                    errors.push(`Row ${i + 2}: lastName is required`);
                    continue;
                }

                // Auto-generate email if not provided
                const generatedEmail = email || `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}@${company.name.toLowerCase().replace(/\s+/g, '')}.enrollee`;

                const existingEmail = await Staff.findOne({ where: { email: generatedEmail } });
                if (existingEmail) {
                    errors.push(`Row ${i + 2}: Email already exists`);
                    continue;
                }

                // Auto-generate staffId if not provided
                const generatedStaffId = staffId || `STF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Use subscriptionId from row if provided, otherwise use the one from body
                const subscriptionIdToUse = rowSubscriptionId || subscriptionId;

                // Start transaction for atomic staff and enrollee creation
                transaction = await Staff.sequelize.transaction();

                const staff = await Staff.create({
                    firstName: firstName.trim(),
                    middleName: middleName ? middleName.trim() : null,
                    lastName: lastName.trim(),
                    email: generatedEmail,
                    phoneNumber: phoneNumber ? phoneNumber.trim() : null,
                    staffId: generatedStaffId,
                    companyId,
                    subsidiaryId: subsidiaryId || null,
                    dateOfBirth: dateOfBirth || null,
                    maxDependents: maxDependents ? parseInt(maxDependents) : null,
                    preexistingMedicalRecords: preexistingMedicalRecords ? preexistingMedicalRecords.trim() : null,
                    subscriptionId: subscriptionIdToUse || null
                }, { transaction });

                // Only create enrollee if subscriptionId is provided
                let enrollee = null;
                let rawPassword = null;

                if (subscriptionIdToUse) {
                    const subscriptionPlan = await SubscriptionPlan.findOne({
                        where: { subscriptionId: subscriptionIdToUse },
                        raw: true
                    });

                    if (!subscriptionPlan) {
                        await transaction.rollback();
                        errors.push(`Row ${i + 2}: No company plan found for the specified subscription`);
                        continue;
                    }

                    const planId = subscriptionPlan.companyPlanId;

                    const companyPlan = await CompanyPlan.findByPk(planId);
                    if (!companyPlan) {
                        await transaction.rollback();
                        errors.push(`Row ${i + 2}: Company plan not found`);
                        continue;
                    }
                    if (companyPlan.companyId !== companyId) {
                        await transaction.rollback();
                        errors.push(`Row ${i + 2}: Company plan does not belong to the specified company`);
                        continue;
                    }

                    const providedPolicyNumber = policyNumber && String(policyNumber).trim() ? String(policyNumber).trim() : null;
                    if (providedPolicyNumber) {
                        const existingPolicyNumber = await Enrollee.findOne({ where: { policyNumber: providedPolicyNumber } });
                        if (existingPolicyNumber) {
                            await transaction.rollback();
                            errors.push(`Row ${i + 2}: Policy number already exists`);
                            continue;
                        }
                    }
                    const enrolleePolicyNumber = providedPolicyNumber || await getUniquePolicyNumber(Enrollee);

                    // Generate password for enrollee
                    rawPassword = generateCode(10, { letters: true, numbers: true });
                    const hashedPassword = await bcrypt.hash(rawPassword, 10);

                    enrollee = await Enrollee.create({
                        firstName: firstName.trim(),
                        middleName: middleName ? middleName.trim() : null,
                        lastName: lastName.trim(),
                        policyNumber: enrolleePolicyNumber,
                        staffId: staff.id,
                        companyId,
                        companyPlanId: planId,
                        dateOfBirth: dateOfBirth || new Date(),
                        gender: gender || 'other',
                        phoneNumber: phoneNumber ? phoneNumber.trim() : generatedEmail,
                        email: generatedEmail,
                        maxDependents: maxDependents ? parseInt(maxDependents) : null,
                        preexistingMedicalRecords: preexistingMedicalRecords ? preexistingMedicalRecords.trim() : null,
                        isActive: true,
                        password: hashedPassword
                    }, { transaction });

                    await staff.update({
                        enrollmentStatus: 'enrolled'
                    }, { transaction });
                }

                // Commit transaction before audit log and notifications
                await transaction.commit();

                createdStaffs.push(staff.toJSON());
                if (enrollee) {
                    createdEnrollees.push(enrollee.toJSON());
                }

                // Send notification if email is provided
                if (staff.email) {
                    try {
                        const notificationData = {
                            firstName: staff.firstName,
                            companyName: company.name,
                            loginLink: `https://enrollee.altuhealth.com`
                        };

                        // Include password and policy number in notification if enrollee was created
                        if (enrollee) {
                            notificationData.temporaryPassword = rawPassword;
                            notificationData.policyNumber = enrollee.policyNumber;
                        }

                        await notify(
                            { id: staff.id, email: staff.email, firstName: staff.firstName },
                            'staff',
                            'STAFF_ENROLLMENT_REQUIRED',
                            notificationData
                        );

                        await staff.update({
                            isNotified: true,
                            notifiedAt: new Date()
                        });
                    } catch (notifyErr) {
                        console.error(`Error sending enrollment email for ${staff.email}:`, notifyErr);
                    }
                }
            } catch (err) {
                if (transaction) {
                    await transaction.rollback();
                }
                errors.push(`Row ${i + 2}: ${err.message}`);
            }
        }

        // Clean up uploaded file
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Error deleting uploaded file:', err);
        }

        await addAuditLog(req.models, {
            action: 'staff.bulk_create',
            message: `${createdStaffs.length} staff(s) created via bulk upload${createdEnrollees.length > 0 ? ` with ${createdEnrollees.length} enrollee(s)` : ''}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { createdCount: createdStaffs.length, enrolleeCount: createdEnrollees.length, errorCount: errors.length }
        });

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
                errorCount: errors.length
            },
            message,
            201
        );
    } catch (err) {
        if (req.file) {
            try {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Error deleting uploaded file:', e);
            }
        }
        return next(err);
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
    downloadCompanyEnrollees,
    bulkNotifyStaffs,
    bulkEnrollStaffs,
    bulkCreateStaffs,
    resendEnrollmentNotification
};
