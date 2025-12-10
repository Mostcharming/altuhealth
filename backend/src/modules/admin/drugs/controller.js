'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

async function createDrug(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const {
            name,
            unit,
            description,
            strength,
            price,
            providerId,
            // status
        } = req.body || {};

        // Validate required fields
        if (!name) return res.fail('`name` is required', 400);
        if (!unit) return res.fail('`unit` is required', 400);
        if (!price) return res.fail('`price` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Create drug
        const drug = await Drug.create({
            name,
            unit,
            description,
            strength,
            price,
            providerId,
            // status: status || 'pending'
        });

        // Create admin approval request
        try {
            await createAdminApproval(req.models, {
                model: 'Drug',
                modelId: drug.id,
                action: 'create',
                details: {
                    name: drug.name,
                    unit: drug.unit,
                    strength: drug.strength,
                    price: drug.price,
                    providerId: drug.providerId
                },
                requestedBy: (req.user && req.user.id) ? req.user.id : null,
                requestedByType: (req.user && req.user.type) ? req.user.type : 'Admin',
                comments: `New drug created: ${drug.name}`
            });
        } catch (approvalErr) {
            if (console && console.warn) console.warn('Failed to create approval for drug:', approvalErr.message || approvalErr);
        }

        await addAuditLog(req.models, {
            action: 'drug.create',
            message: `Drug ${drug.name} created for Provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { drugId: drug.id, providerId }
        });

        return res.success({ drug: drug.toJSON() }, 'Drug created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateDrug(req, res, next) {
    try {
        const { Drug } = req.models;
        const { id } = req.params;
        const {
            name,
            unit,
            description,
            strength,
            price,
            status
        } = req.body || {};

        const drug = await Drug.findByPk(id);
        if (!drug) return res.fail('Drug not found', 404);

        const updates = {};

        if (name !== undefined) updates.name = name;
        if (unit !== undefined) updates.unit = unit;
        if (description !== undefined) updates.description = description;
        if (strength !== undefined) updates.strength = strength;
        if (price !== undefined) updates.price = price;
        if (status !== undefined) updates.status = status;

        await drug.update(updates);

        await addAuditLog(req.models, {
            action: 'drug.update',
            message: `Drug ${drug.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { drugId: drug.id }
        });

        return res.success({ drug }, 'Drug updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteDrug(req, res, next) {
    try {
        const { Drug } = req.models;
        const { id } = req.params;

        const drug = await Drug.findByPk(id);
        if (!drug) return res.fail('Drug not found', 404);

        await drug.destroy();

        await addAuditLog(req.models, {
            action: 'drug.delete',
            message: `Drug ${drug.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { drugId: id }
        });

        return res.success(null, 'Drug deleted');
    } catch (err) {
        return next(err);
    }
}

async function listDrugs(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { limit = 10, page = 1, q, providerId, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { unit: { [Op.iLike || Op.like]: `%${q}%` } },
                { strength: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (providerId) where.providerId = providerId;
        if (status) where.status = status;

        const total = await Drug.count({ where });

        const findOptions = {
            where,
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const drugs = await Drug.findAll(findOptions);
        const data = drugs.map(d => d.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + drugs.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getDrug(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { id } = req.params;

        const drug = await Drug.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
                }
            ]
        });

        if (!drug) return res.fail('Drug not found', 404);

        return res.success(drug.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function deleteAllDrugsByProvider(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { providerId } = req.params;

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Get all drugs for this provider
        const drugs = await Drug.findAll({ where: { providerId } });

        if (drugs.length === 0) {
            return res.success({ count: 0 }, 'No drugs found for this provider');
        }

        // Delete all drugs for this provider
        await Drug.destroy({ where: { providerId } });

        await addAuditLog(req.models, {
            action: 'drug.deleteAll',
            message: `All drugs deleted for Provider ${provider.name} (${drugs.length} drugs)`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId, deletedCount: drugs.length }
        });

        return res.success({ count: drugs.length }, `${drugs.length} drug(s) deleted for provider`);
    } catch (err) {
        return next(err);
    }
}

async function bulkCreateDrugs(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { providerId } = req.body || {};
        const file = req.file;

        if (!file) {
            return res.fail('File is required', 400);
        }

        if (!providerId) {
            return res.fail('`providerId` is required', 400);
        }

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) {
            return res.fail('Provider not found', 404);
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

        // Validate and create drug records
        const createdDrugs = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const rowNumber = i + 2; // +2 because row 1 is header, i starts from 0

                // Validate required fields
                if (!row.name) {
                    errors.push({ row: rowNumber, error: 'name is required' });
                    continue;
                }
                if (!row.unit) {
                    errors.push({ row: rowNumber, error: 'unit is required' });
                    continue;
                }
                if (!row.price) {
                    errors.push({ row: rowNumber, error: 'price is required' });
                    continue;
                }

                // Create the drug
                const drug = await Drug.create({
                    name: row.name.trim(),
                    unit: row.unit.trim(),
                    description: row.description ? row.description.trim() : null,
                    strength: row.strength ? row.strength.trim() : null,
                    price: parseFloat(row.price),
                    providerId,
                    status: row.status ? row.status.toLowerCase() : 'pending'
                });

                createdDrugs.push(drug.toJSON());
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
            action: 'drug.bulk_create',
            message: `${createdDrugs.length} drug(s) created via bulk upload for provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { createdCount: createdDrugs.length, errorCount: errors.length, providerId }
        });

        // Return response
        const message =
            errors.length > 0
                ? `${createdDrugs.length} drug(s) created with ${errors.length} error(s)`
                : `${createdDrugs.length} drug(s) created successfully`;

        return res.success(
            { drugs: createdDrugs, errors, createdCount: createdDrugs.length, errorCount: errors.length },
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

module.exports = {
    createDrug,
    updateDrug,
    deleteDrug,
    listDrugs,
    getDrug,
    deleteAllDrugsByProvider,
    bulkCreateDrugs
};
