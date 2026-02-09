const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const notify = require('../../../utils/notify');
const config = require('../../../config');
const generateCode = require('../../../utils/verificationCode');

async function createStaff(req, res, next) {
    try {
        const { Staff, Company, CompanySubsidiary, Subscription, Enrollee, CompanyPlan, SubscriptionPlan } = req.models;
        const { firstName, middleName, lastName, email, phoneNumber, staffId, companyId, subsidiaryId, dateOfBirth, maxDependents, preexistingMedicalRecords, subscriptionId, gender } = req.body || {};

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

        if (email) {
            const existingEmail = await Staff.findOne({ where: { email } });
            if (existingEmail) return res.fail('Email already exists', 400);
        }

        if (staffId) {
            const existingStaffId = await Staff.findOne({ where: { staffId } });
            if (existingStaffId) return res.fail('Staff ID already exists', 400);
        }

        const staff = await Staff.create({
            firstName,
            middleName: middleName || null,
            lastName,
            email,
            phoneNumber,
            staffId,
            companyId,
            subsidiaryId: subsidiaryId || null,
            dateOfBirth: dateOfBirth || null,
            maxDependents: maxDependents || null,
            preexistingMedicalRecords: preexistingMedicalRecords || null,
            subscriptionId: subscriptionId || null
        });

        // Only create enrollee if subscriptionId is provided
        let enrollee = null;
        if (subscriptionId) {
            const subscriptionPlan = await SubscriptionPlan.findOne({
                where: { subscriptionId },
                raw: true
            });

            if (!subscriptionPlan) {
                return res.fail('No company plan found for the specified subscription', 404);
            }

            const planId = subscriptionPlan.companyPlanId;

            const companyPlan = await CompanyPlan.findByPk(planId);
            if (!companyPlan) return res.fail('Company plan not found', 404);
            if (companyPlan.companyId !== companyId) {
                return res.fail('Company plan does not belong to the specified company', 400);
            }

            const policyNumber = await getUniquePolicyNumber(Enrollee);

            // Generate password for enrollee
            const rawPassword = generateCode(10, { letters: true, numbers: true });
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            enrollee = await Enrollee.create({
                firstName,
                middleName: middleName || null,
                lastName,
                policyNumber,
                staffId: staff.id,
                companyId,
                companyPlanId: planId,
                dateOfBirth: dateOfBirth || new Date(),
                gender: gender || 'other',
                phoneNumber,
                email,
                maxDependents: maxDependents || null,
                preexistingMedicalRecords: preexistingMedicalRecords || null,
                isActive: true,
                password: hashedPassword
            });

            await staff.update({
                enrollmentStatus: 'enrolled'
            });
        }

        await addAuditLog(req.models, {
            action: 'staff.create',
            message: `Staff ${staff.firstName} ${staff.lastName} created${enrollee ? ` and enrollee created with policy ${enrollee.policyNumber}` : ''}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { staffId: staff.id, enrolleeId: enrollee?.id, policyNumber: enrollee?.policyNumber }
        });

        // Only send notification if email is provided
        if (staff.email) {
            const enrollmentLink = `${config.feUrl}/enroll/${staff.id}`;

            try {
                const notificationData = {
                    firstName: staff.firstName,
                    companyName: company.name,
                    enrollmentLink
                };

                // Include password in notification if enrollee was created
                if (enrollee) {
                    notificationData.password = rawPassword;
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
        const { Staff, Company, CompanySubsidiary, CompanyPlan } = req.models;
        const { companyId, subsidiaryId, companyPlanId } = req.body || {};
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

        if (companyPlanId) {
            const plan = await CompanyPlan.findByPk(companyPlanId);
            if (!plan) {
                return res.fail('Company plan not found', 404);
            }
            if (plan.companyId !== companyId) {
                return res.fail('Company plan does not belong to the specified company', 400);
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
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
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
                    companyPlanId
                } = row;

                if (!firstName) {
                    errors.push(`Row ${i + 2}: firstName is required`);
                    continue;
                }
                if (!lastName) {
                    errors.push(`Row ${i + 2}: lastName is required`);
                    continue;
                }
                if (!email) {
                    errors.push(`Row ${i + 2}: email is required`);
                    continue;
                }
                if (!phoneNumber) {
                    errors.push(`Row ${i + 2}: phoneNumber is required`);
                    continue;
                }
                if (!staffId) {
                    errors.push(`Row ${i + 2}: staffId is required`);
                    continue;
                }

                const existingEmail = await Staff.findOne({ where: { email } });
                if (existingEmail) {
                    errors.push(`Row ${i + 2}: Email already exists`);
                    continue;
                }

                const existingStaffId = await Staff.findOne({ where: { staffId } });
                if (existingStaffId) {
                    errors.push(`Row ${i + 2}: Staff ID already exists`);
                    continue;
                }

                const planIdToUse = companyPlanId || row.companyPlanId;

                if (planIdToUse) {
                    const plan = await CompanyPlan.findByPk(planIdToUse);
                    if (!plan) {
                        errors.push(`Row ${i + 2}: Company plan not found`);
                        continue;
                    }
                    if (plan.companyId !== companyId) {
                        errors.push(`Row ${i + 2}: Company plan does not belong to the specified company`);
                        continue;
                    }
                }

                const staff = await Staff.create({
                    firstName: firstName.trim(),
                    middleName: middleName ? middleName.trim() : null,
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phoneNumber: phoneNumber.trim(),
                    staffId: staffId.trim(),
                    companyId,
                    subsidiaryId: subsidiaryId || null,
                    dateOfBirth: dateOfBirth || null,
                    maxDependents: maxDependents ? parseInt(maxDependents) : null,
                    preexistingMedicalRecords: preexistingMedicalRecords ? preexistingMedicalRecords.trim() : null,
                    companyPlanId: planIdToUse || null
                });

                createdStaffs.push(staff.toJSON());

                const enrollmentLink = `${config.feUrl}/enroll/${staff.id}`;
                try {
                    await notify(
                        { id: staff.id, email: staff.email, firstName: staff.firstName, },
                        'staff',
                        'STAFF_ENROLLMENT_REQUIRED',
                        {
                            firstName: staff.firstName,
                            companyName: company.name,
                            enrollmentLink
                        }
                    );

                    await staff.update({
                        isNotified: true,
                        notifiedAt: new Date()
                    });
                } catch (notifyErr) {
                    console.error('Error sending enrollment email:', notifyErr);
                }
            } catch (err) {
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
            message: `${createdStaffs.length} staff(s) created via bulk upload`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { createdCount: createdStaffs.length, errorCount: errors.length }
        });

        const message =
            errors.length > 0
                ? `${createdStaffs.length} staff(s) created with ${errors.length} error(s)`
                : `${createdStaffs.length} staff(s) created successfully`;

        return res.success(
            { staffs: createdStaffs, errors, createdCount: createdStaffs.length, errorCount: errors.length },
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
        const { Staff, Company } = req.models;
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

        const enrollmentLink = `${config.feUrl}/enroll/${staff.id}`;
        const company = staff.Company;
        const companyName = company ? company.name : 'Your Company';

        try {
            await notify(
                { id: staff.id, email: staff.email, firstName: staff.firstName, },
                'staff',
                'STAFF_ENROLLMENT_REQUIRED',
                {
                    firstName: staff.firstName,
                    companyName: companyName,
                    enrollmentLink
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
                { staff: staff.toJSON() },
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
    bulkNotifyStaffs,
    bulkEnrollStaffs,
    bulkCreateStaffs,
    resendEnrollmentNotification
};
