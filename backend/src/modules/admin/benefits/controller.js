const { Op } = require('sequelize');
const fs = require('fs');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { validateBenefit, validateBenefitUpdate } = require('../../../utils/benefitValidation');

async function createBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { name, description, limit, amount, benefitCategoryId, isCovered, coverageType, coverageValue } = req.body || {};

        // Validate input
        const validationErrors = validateBenefit(req.body);
        if (validationErrors.length > 0) {
            return res.fail(validationErrors.join(', '), 400);
        }

        // Validate benefit category exists
        const benefitCategory = await BenefitCategory.findByPk(benefitCategoryId);
        if (!benefitCategory) {
            return res.fail('Benefit category not found', 400);
        }

        // Check if benefit name already exists within the same category
        const existingBenefit = await Benefit.findOne({
            where: {
                name,
                benefitCategoryId
            }
        });
        if (existingBenefit) {
            return res.fail('Benefit with this name already exists in this category', 400);
        }

        const sequelize = Benefit.sequelize;

        let benefit;
        await sequelize.transaction(async (t) => {
            benefit = await Benefit.create({
                name,
                description,
                limit,
                amount,
                benefitCategoryId,
                isCovered: isCovered || false,
                coverageType: isCovered ? coverageType : null,
                coverageValue: isCovered ? coverageValue : null
            }, { transaction: t });

            // Update benefit category count
            await benefitCategory.increment('count', { transaction: t });
        });

        await addAuditLog(req.models, {
            action: 'benefit.create',
            message: `Benefit ${benefit.name} created in category ${benefitCategory.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitId: benefit.id, benefitCategoryId }
        });

        // Include category in response
        const result = { ...benefit.toJSON(), benefitCategory };

        return res.success(result, 'Benefit created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { id } = req.params;
        const { name, description, limit, amount, benefitCategoryId, isCovered, coverageType, coverageValue } = req.body || {};

        // Validate input
        const validationErrors = validateBenefitUpdate(req.body);
        if (validationErrors.length > 0) {
            return res.fail(validationErrors.join(', '), 400);
        }

        const benefit = await Benefit.findByPk(id);
        if (!benefit) return res.fail('Benefit not found', 404);

        const oldCategoryId = benefit.benefitCategoryId;

        // Validate new benefit category if provided
        if (benefitCategoryId && benefitCategoryId !== oldCategoryId) {
            const newBenefitCategory = await BenefitCategory.findByPk(benefitCategoryId);
            if (!newBenefitCategory) {
                return res.fail('New benefit category not found', 400);
            }
        }

        // Check if benefit name already exists within the target category
        if (name) {
            const targetCategoryId = benefitCategoryId || oldCategoryId;
            const existingBenefit = await Benefit.findOne({
                where: {
                    name,
                    benefitCategoryId: targetCategoryId,
                    id: { [Op.ne]: id }
                }
            });
            if (existingBenefit) {
                return res.fail('Benefit with this name already exists in this category', 400);
            }
        }

        const sequelize = Benefit.sequelize;

        await sequelize.transaction(async (t) => {
            const updateData = {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(limit !== undefined && { limit }),
                ...(amount !== undefined && { amount }),
                ...(benefitCategoryId !== undefined && { benefitCategoryId }),
                ...(isCovered !== undefined && { isCovered }),
                ...(isCovered && coverageType !== undefined && { coverageType }),
                ...(isCovered && coverageValue !== undefined && { coverageValue })
            };

            // Clear coverage fields if not marked as covered
            if (isCovered === false) {
                updateData.coverageType = null;
                updateData.coverageValue = null;
            }

            await benefit.update(updateData, { transaction: t });

            // If category changed, update counts
            if (benefitCategoryId && benefitCategoryId !== oldCategoryId) {
                // Decrease count in old category
                await BenefitCategory.decrement('count', {
                    where: { id: oldCategoryId },
                    transaction: t
                });

                // Increase count in new category
                await BenefitCategory.increment('count', {
                    where: { id: benefitCategoryId },
                    transaction: t
                });
            }
        });

        // Get updated benefit with category
        const updatedBenefit = await Benefit.findByPk(id);
        const benefitCategory = await BenefitCategory.findByPk(updatedBenefit.benefitCategoryId);

        await addAuditLog(req.models, {
            action: 'benefit.update',
            message: `Benefit ${updatedBenefit.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitId: id, benefitCategoryId: updatedBenefit.benefitCategoryId }
        });

        const result = { ...updatedBenefit.toJSON(), benefitCategory };

        return res.success(result, 'Benefit updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { id } = req.params;

        const benefit = await Benefit.findByPk(id);
        if (!benefit) return res.fail('Benefit not found', 404);

        const benefitCategoryId = benefit.benefitCategoryId;
        const benefitName = benefit.name;

        const sequelize = Benefit.sequelize;

        await sequelize.transaction(async (t) => {
            await benefit.destroy({ transaction: t });

            // Update benefit category count
            await BenefitCategory.decrement('count', {
                where: { id: benefitCategoryId },
                transaction: t
            });
        });

        await addAuditLog(req.models, {
            action: 'benefit.delete',
            message: `Benefit ${benefitName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitId: id, benefitCategoryId }
        });

        return res.success(null, 'Benefit deleted successfully');
    } catch (err) {
        return next(err);
    }
}

async function listBenefits(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { limit = 10, page = 1, q, benefitCategoryId } = req.query;

        // if client passes limit=all (case-insensitive), return all results without pagination
        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where.name = { [Op.iLike || Op.like]: `%${q}%` };
        }
        if (benefitCategoryId) {
            where.benefitCategoryId = benefitCategoryId;
        }

        // total count for pagination
        const total = await Benefit.count({ where });

        const findOptions = {
            where,
            include: [{
                model: BenefitCategory,
                attributes: ['id', 'name']
            }],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const benefits = await Benefit.findAll(findOptions);

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + benefits.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: benefits,
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

async function getBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { id } = req.params;

        const benefit = await Benefit.findByPk(id, {
            include: [{
                model: BenefitCategory,
                attributes: ['id', 'name']
            }]
        });

        if (!benefit) return res.fail('Benefit not found', 404);

        return res.success(benefit);
    } catch (err) {
        return next(err);
    }
}

async function bulkCreateBenefits(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const file = req.file;

        if (!file) {
            return res.fail('File is required', 400);
        }

        if (!file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
            return res.fail('Invalid file format. Only CSV and Excel files are allowed', 400);
        }

        let rows;

        if (file.mimetype === 'text/csv') {
            // Parse CSV
            const csv = require('csv-parser');
            const results = [];
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (row) => results.push(row))
                .on('end', async () => {
                    try {
                        rows = results;
                        await processBenefitRows(rows, file, req, res);
                    } catch (err) {
                        return next(err);
                    }
                })
                .on('error', (err) => {
                    return next(err);
                });
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
            // Parse Excel
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile(file.path);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(worksheet);

            try {
                await processBenefitRows(rows, file, req, res);
            } catch (err) {
                return next(err);
            }
        } else {
            return res.fail('Invalid file format. Only CSV and Excel files are allowed', 400);
        }
    } catch (err) {
        // Clean up uploaded file
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Error deleting uploaded file:', e);
            }
        }
        return next(err);
    }
}

async function processBenefitRows(rows, file, req, res) {
    try {
        const { Benefit, BenefitCategory } = req.models;

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.fail('File is empty or has no valid data', 400);
        }

        const createdBenefits = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];
                const rowNumber = i + 2; // +2 because row 1 is header, i starts from 0

                // Validate required fields
                if (!row.name || !row.name.trim()) {
                    errors.push({ row: rowNumber, error: 'name is required' });
                    continue;
                }

                if (!row.benefitCategoryId || !row.benefitCategoryId.trim()) {
                    errors.push({ row: rowNumber, error: 'benefitCategoryId is required' });
                    continue;
                }

                // Validate that amount or limit is provided
                if ((row.amount === undefined || row.amount === '') && (row.limit === undefined || row.limit === '')) {
                    errors.push({ row: rowNumber, error: 'At least one of amount or limit is required' });
                    continue;
                }

                // Validate that benefitCategoryId exists
                const benefitCategory = await BenefitCategory.findByPk(row.benefitCategoryId.trim());
                if (!benefitCategory) {
                    errors.push({ row: rowNumber, error: `Benefit category with ID ${row.benefitCategoryId} not found` });
                    continue;
                }

                // Check if benefit name already exists within the same category
                const existingBenefit = await Benefit.findOne({
                    where: {
                        name: row.name.trim(),
                        benefitCategoryId: row.benefitCategoryId.trim()
                    }
                });
                if (existingBenefit) {
                    errors.push({ row: rowNumber, error: `Benefit with this name already exists in this category` });
                    continue;
                }

                // Validate amount if provided
                const amount = row.amount !== undefined && row.amount !== '' ? parseFloat(row.amount) : null;
                if (amount !== null && isNaN(amount)) {
                    errors.push({ row: rowNumber, error: `Invalid amount value: ${row.amount}` });
                    continue;
                }

                // Validate limit if provided
                const limit = row.limit !== undefined && row.limit !== '' ? parseInt(row.limit) : null;
                if (limit !== null && isNaN(limit)) {
                    errors.push({ row: rowNumber, error: `Invalid limit value: ${row.limit}` });
                    continue;
                }

                const sequelize = Benefit.sequelize;

                let benefit;
                await sequelize.transaction(async (t) => {
                    benefit = await Benefit.create({
                        name: row.name.trim(),
                        description: row.description ? row.description.trim() : null,
                        amount: amount,
                        limit: limit,
                        benefitCategoryId: row.benefitCategoryId.trim()
                    }, { transaction: t });

                    // Update benefit category count
                    await benefitCategory.increment('count', { transaction: t });
                });

                createdBenefits.push(benefit.toJSON());
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
            action: 'benefit.bulk_create',
            message: `${createdBenefits.length} benefit(s) created via bulk upload`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { createdCount: createdBenefits.length, errorCount: errors.length }
        });

        // Return response
        const message =
            errors.length > 0
                ? `${createdBenefits.length} benefit(s) created with ${errors.length} error(s)`
                : `${createdBenefits.length} benefit(s) created successfully`;

        return res.success(
            { benefits: createdBenefits, errors, createdCount: createdBenefits.length, errorCount: errors.length },
            message,
            201
        );
    } catch (err) {
        // Clean up uploaded file
        try {
            fs.unlinkSync(file.path);
        } catch (e) {
            console.error('Error deleting uploaded file:', e);
        }
        throw err;
    }
}

module.exports = {
    createBenefit,
    updateBenefit,
    deleteBenefit,
    listBenefits,
    getBenefit,
    bulkCreateBenefits,
};
