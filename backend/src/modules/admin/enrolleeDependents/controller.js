const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const notify = require('../../../utils/notify');
const config = require('../../../config');

/**
 * Generate dependent policy number from enrollee policy number
 * Format: ENROLLEE_POLICY-XX where XX is a 2-digit sequence number
 */
async function generateDependentPolicyNumber(enrolleeId, EnrolleeDependent, Enrollee) {
    try {

        // Get the enrollee's policy number
        const enrollee = await Enrollee.findByPk(enrolleeId, {
            attributes: ['policyNumber'],
            raw: true
        });

        if (!enrollee) {
            throw new Error('Enrollee not found');
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
            const foundDependent = await EnrolleeDependent.findOne({
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

async function createEnrolleeDependent(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const { enrolleeId, firstName, middleName, lastName, dateOfBirth, gender, relationshipToEnrollee, phoneNumber, email, occupation, maritalStatus, preexistingMedicalRecords } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);
        if (!gender) return res.fail('`gender` is required', 400);
        if (!relationshipToEnrollee) return res.fail('`relationshipToEnrollee` is required', 400);

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Generate policy number
        const policyNumber = await generateDependentPolicyNumber(enrolleeId, EnrolleeDependent, Enrollee);

        const dependent = await EnrolleeDependent.create({
            enrolleeId,
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
            preexistingMedicalRecords: preexistingMedicalRecords || null
        });

        await addAuditLog(req.models, {
            action: 'enrollee_dependent.create',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} created for enrollee ${enrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id, enrolleeId }
        });

        return res.success({ dependent: dependent.toJSON() }, 'Enrollee dependent created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateEnrolleeDependent(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const { id } = req.params;
        const { firstName, middleName, lastName, dateOfBirth, gender, relationshipToEnrollee, phoneNumber, email, occupation, maritalStatus, preexistingMedicalRecords, isActive } = req.body || {};

        const dependent = await EnrolleeDependent.findByPk(id);
        if (!dependent) return res.fail('Enrollee dependent not found', 404);

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
            action: 'enrollee_dependent.update',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: dependent.id }
        });

        return res.success({ dependent }, 'Enrollee dependent updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteEnrolleeDependent(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const { id } = req.params;

        const dependent = await EnrolleeDependent.findByPk(id);
        if (!dependent) return res.fail('Enrollee dependent not found', 404);

        await dependent.destroy();

        await addAuditLog(req.models, {
            action: 'enrollee_dependent.delete',
            message: `Dependent ${dependent.firstName} ${dependent.lastName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { dependentId: id }
        });

        return res.success(null, 'Enrollee dependent deleted');
    } catch (err) {
        return next(err);
    }
}

async function listEnrolleeDependents(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const { limit = 10, page = 1, q, enrolleeId, relationshipToEnrollee, isActive, isVerified } = req.query;

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
        if (enrolleeId) {
            where.enrolleeId = enrolleeId;
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

        const total = await EnrolleeDependent.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email'],
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const dependents = await EnrolleeDependent.findAll(findOptions);
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

async function getEnrolleeDependent(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const { id } = req.params;

        const dependent = await EnrolleeDependent.findByPk(id, {
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email'],
                    required: false
                }
            ]
        });

        if (!dependent) return res.fail('Enrollee dependent not found', 404);

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

async function bulkCreateEnrolleeDependents(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const { enrolleeId } = req.body || {};
        const file = req.file;

        if (!file) {
            return res.fail('File is required', 400);
        }

        if (!enrolleeId) {
            return res.fail('`enrolleeId` is required', 400);
        }

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) {
            return res.fail('Enrollee not found', 404);
        }

        // Parse the file
        let rows = [];
        const fs = require('fs');
        const path = require('path');

        if (file.mimetype === 'text/csv') {
            // Parse CSV
            const csv = require('csv-parser');
            rows = await new Promise((resolve, reject) => {
                const result = [];
                require('fs')
                    .createReadStream(file.path)
                    .pipe(csv())
                    .on('data', (data) => result.push(data))
                    .on('end', () => resolve(result))
                    .on('error', reject);
            });
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            // Parse Excel
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile(file.path);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(worksheet);
        } else {
            return res.fail('Invalid file format. Only CSV and Excel files are allowed', 400);
        }

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.fail('File is empty or has no valid data', 400);
        }

        // Validate and create dependent records
        const createdDependents = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const rowNumber = i + 2; // +2 because row 1 is header, i starts from 0

                // Validate required fields
                if (!row.firstName) {
                    errors.push({ row: rowNumber, error: 'firstName is required' });
                    continue;
                }
                if (!row.lastName) {
                    errors.push({ row: rowNumber, error: 'lastName is required' });
                    continue;
                }
                if (!row.dateOfBirth) {
                    errors.push({ row: rowNumber, error: 'dateOfBirth is required' });
                    continue;
                }
                if (!row.gender) {
                    errors.push({ row: rowNumber, error: 'gender is required' });
                    continue;
                }
                if (!row.relationshipToEnrollee) {
                    errors.push({ row: rowNumber, error: 'relationshipToEnrollee is required' });
                    continue;
                }

                // Validate enum values
                if (!['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
                    errors.push({ row: rowNumber, error: `Invalid gender value: ${row.gender}` });
                    continue;
                }

                if (!['spouse', 'child', 'parent', 'sibling', 'other'].includes(row.relationshipToEnrollee.toLowerCase())) {
                    errors.push({ row: rowNumber, error: `Invalid relationshipToEnrollee value: ${row.relationshipToEnrollee}` });
                    continue;
                }

                // Validate maritalStatus if provided
                if (row.maritalStatus && !['single', 'married', 'divorced', 'widowed', 'separated'].includes(row.maritalStatus.toLowerCase())) {
                    errors.push({ row: rowNumber, error: `Invalid maritalStatus value: ${row.maritalStatus}` });
                    continue;
                }

                // Validate email if provided
                if (row.email && !String(row.email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    errors.push({ row: rowNumber, error: `Invalid email format: ${row.email}` });
                    continue;
                }

                // Generate policy number
                const policyNumber = await generateDependentPolicyNumber(enrolleeId, EnrolleeDependent, Enrollee);

                // Create the dependent
                const dependent = await EnrolleeDependent.create({
                    enrolleeId,
                    policyNumber,
                    firstName: row.firstName.trim(),
                    middleName: row.middleName ? row.middleName.trim() : null,
                    lastName: row.lastName.trim(),
                    dateOfBirth: new Date(row.dateOfBirth),
                    gender: row.gender.toLowerCase(),
                    relationshipToEnrollee: row.relationshipToEnrollee.toLowerCase(),
                    phoneNumber: row.phoneNumber ? row.phoneNumber.trim() : null,
                    email: row.email ? row.email.toLowerCase().trim() : null,
                    occupation: row.occupation ? row.occupation.trim() : null,
                    maritalStatus: row.maritalStatus ? row.maritalStatus.toLowerCase() : null,
                    preexistingMedicalRecords: row.preexistingMedicalRecords ? row.preexistingMedicalRecords.trim() : null
                });

                createdDependents.push(dependent.toJSON());
            } catch (err) {
                const rowNumber = i + 2;
                errors.push({ row: rowNumber, error: err.message });
            }
        }

        // Clean up uploaded file
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Error deleting uploaded file:', err);
        }

        // Log the bulk creation
        await addAuditLog(req.models, {
            action: 'enrollee_dependent.bulk_create',
            message: `${createdDependents.length} dependent(s) created via bulk upload for enrollee ${enrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { createdCount: createdDependents.length, errorCount: errors.length, enrolleeId }
        });

        // Return response
        const message =
            errors.length > 0
                ? `${createdDependents.length} dependent(s) created with ${errors.length} error(s)`
                : `${createdDependents.length} dependent(s) created successfully`;

        return res.success(
            { dependents: createdDependents, errors, createdCount: createdDependents.length, errorCount: errors.length },
            message,
            201
        );
    } catch (err) {
        // Clean up uploaded file
        if (req.file) {
            try {
                require('fs').unlinkSync(req.file.path);
            } catch (e) {
                console.error('Error deleting uploaded file:', e);
            }
        }
        return next(err);
    }
}

async function bulkVerifyEnrolleeDependents(req, res, next) {
    try {
        const { EnrolleeDependent } = req.models;
        const { dependentIds } = req.body || {};

        if (!dependentIds || !Array.isArray(dependentIds) || dependentIds.length === 0) {
            return res.fail('`dependentIds` array is required', 400);
        }

        const updateCount = await EnrolleeDependent.update(
            { isVerified: true, verifiedAt: new Date() },
            { where: { id: { [Op.in]: dependentIds } } }
        );

        await addAuditLog(req.models, {
            action: 'enrollee_dependent.bulk_verify',
            message: `${updateCount[0]} dependent(s) marked as verified`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { verifiedCount: updateCount[0] }
        });

        return res.success({ verifiedCount: updateCount[0] }, 'Dependent(s) marked as verified');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createEnrolleeDependent,
    updateEnrolleeDependent,
    deleteEnrolleeDependent,
    listEnrolleeDependents,
    getEnrolleeDependent,
    getRelationshipOptions,
    bulkCreateEnrolleeDependents,
    bulkVerifyEnrolleeDependents
};
