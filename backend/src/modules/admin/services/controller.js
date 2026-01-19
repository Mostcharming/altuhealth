'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

async function createService(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const {
            name,
            code,
            description,
            requiresPreauthorization,
            priceType,
            fixedPrice,
            rateType,
            rateAmount,
            price, // for backwards compatibility
            providerId,
            status
        } = req.body || {};

        // Validate required fields
        if (!name) return res.fail('`name` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);

        // Validate pricing (either fixed or rate)
        const finalPriceType = priceType || 'fixed';
        if (finalPriceType === 'fixed') {
            const finalFixedPrice = fixedPrice || price;
            if (!finalFixedPrice) return res.fail('`fixedPrice` is required when `priceType` is "fixed"', 400);
        } else if (finalPriceType === 'rate') {
            if (!rateType) return res.fail('`rateType` is required when `priceType` is "rate"', 400);
            if (!rateAmount) return res.fail('`rateAmount` is required when `priceType` is "rate"', 400);
        } else {
            return res.fail('`priceType` must be either "fixed" or "rate"', 400);
        }

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Auto-generate service code based on provider code
        let serviceCode = code;
        if (!serviceCode) {
            // Get the count of existing services for this provider
            const serviceCount = await Service.count({ where: { providerId } });
            const nextServiceNumber = serviceCount + 1;
            serviceCode = `${provider.code}-s${nextServiceNumber}`;
        }

        // Check for duplicate code
        const existingCode = await Service.findOne({ where: { code: serviceCode } });
        if (existingCode) return res.fail('Service code already exists', 400);

        // Create service
        const service = await Service.create({
            name,
            code: serviceCode,
            description,
            requiresPreauthorization: requiresPreauthorization || false,
            priceType: finalPriceType,
            fixedPrice: finalPriceType === 'fixed' ? (fixedPrice || price) : null,
            rateType: finalPriceType === 'rate' ? rateType : null,
            rateAmount: finalPriceType === 'rate' ? rateAmount : null,
            price: fixedPrice || price, // keep for backwards compatibility
            providerId,
            status: status || 'pending'
        });

        // Create admin approval request
        // try {
        //     await createAdminApproval(req.models, {
        //         model: 'Service',
        //         modelId: service.id,
        //         action: 'create',
        //         details: {
        //             name: service.name,
        //             code: service.code,
        //             requiresPreauthorization: service.requiresPreauthorization,
        //             price: service.price,
        //             providerId: service.providerId
        //         },
        //         requestedBy: (req.user && req.user.id) ? req.user.id : null,
        //         requestedByType: (req.user && req.user.type) ? req.user.type : 'Admin',
        //         comments: `New service created: ${service.name} (${service.code})`
        //     });
        // } catch (approvalErr) {
        //     if (console && console.warn) console.warn('Failed to create approval for service:', approvalErr.message || approvalErr);
        // }

        await addAuditLog(req.models, {
            action: 'service.create',
            message: `Service ${service.name} created for Provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { serviceId: service.id, providerId }
        });

        return res.success({ service: service.toJSON() }, 'Service created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateService(req, res, next) {
    try {
        const { Service } = req.models;
        const { id } = req.params;
        const {
            name,
            code,
            description,
            requiresPreauthorization,
            priceType,
            fixedPrice,
            rateType,
            rateAmount,
            price, // for backwards compatibility
            status
        } = req.body || {};

        const service = await Service.findByPk(id);
        if (!service) return res.fail('Service not found', 404);

        const updates = {};

        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (requiresPreauthorization !== undefined) updates.requiresPreauthorization = requiresPreauthorization;
        if (status !== undefined) updates.status = status;

        // Handle pricing updates
        if (priceType !== undefined) {
            const finalPriceType = priceType;

            if (finalPriceType === 'fixed') {
                const finalFixedPrice = fixedPrice !== undefined ? fixedPrice : (price !== undefined ? price : service.fixedPrice);
                if (!finalFixedPrice) return res.fail('`fixedPrice` is required when `priceType` is "fixed"', 400);
                updates.priceType = 'fixed';
                updates.fixedPrice = finalFixedPrice;
                updates.price = finalFixedPrice; // maintain backwards compatibility
                updates.rateType = null;
                updates.rateAmount = null;
            } else if (finalPriceType === 'rate') {
                const finalRateType = rateType !== undefined ? rateType : service.rateType;
                const finalRateAmount = rateAmount !== undefined ? rateAmount : service.rateAmount;
                if (!finalRateType) return res.fail('`rateType` is required when `priceType` is "rate"', 400);
                if (!finalRateAmount) return res.fail('`rateAmount` is required when `priceType` is "rate"', 400);
                updates.priceType = 'rate';
                updates.rateType = finalRateType;
                updates.rateAmount = finalRateAmount;
                updates.fixedPrice = null;
                updates.price = null; // clear price when using rate
            } else {
                return res.fail('`priceType` must be either "fixed" or "rate"', 400);
            }
        } else {
            // If priceType not being changed, handle individual price field updates
            if (fixedPrice !== undefined) {
                if (service.priceType === 'fixed') {
                    updates.fixedPrice = fixedPrice;
                    updates.price = fixedPrice;
                } else {
                    return res.fail('Cannot update `fixedPrice` when `priceType` is not "fixed"', 400);
                }
            }
            if (rateAmount !== undefined) {
                if (service.priceType === 'rate') {
                    updates.rateAmount = rateAmount;
                } else {
                    return res.fail('Cannot update `rateAmount` when `priceType` is not "rate"', 400);
                }
            }
            if (rateType !== undefined) {
                if (service.priceType === 'rate') {
                    updates.rateType = rateType;
                } else {
                    return res.fail('Cannot update `rateType` when `priceType` is not "rate"', 400);
                }
            }
            if (price !== undefined && !fixedPrice) {
                updates.fixedPrice = price;
                updates.price = price;
            }
        }

        // Handle code update with uniqueness check
        if (code !== undefined && code !== service.code) {
            const existingCode = await Service.findOne({ where: { code, id: { [Op.ne]: id } } });
            if (existingCode) return res.fail('Service code already exists', 400);
            updates.code = code;
        }

        await service.update(updates);

        await addAuditLog(req.models, {
            action: 'service.update',
            message: `Service ${service.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { serviceId: service.id }
        });

        return res.success({ service }, 'Service updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteService(req, res, next) {
    try {
        const { Service } = req.models;
        const { id } = req.params;

        const service = await Service.findByPk(id);
        if (!service) return res.fail('Service not found', 404);

        await service.destroy();

        await addAuditLog(req.models, {
            action: 'service.delete',
            message: `Service ${service.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { serviceId: id }
        });

        return res.success(null, 'Service deleted');
    } catch (err) {
        return next(err);
    }
}

async function listServices(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const { limit = 10, page = 1, q, providerId, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { code: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (providerId) where.providerId = providerId;
        if (status) where.status = status;

        const total = await Service.count({ where });

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

        const services = await Service.findAll(findOptions);
        const data = services.map(s => s.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + services.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getService(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const { id } = req.params;

        const service = await Service.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
                }
            ]
        });

        if (!service) return res.fail('Service not found', 404);

        return res.success(service.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function deleteAllServicesByProvider(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const { providerId } = req.params;

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Get all services for this provider
        const services = await Service.findAll({ where: { providerId } });

        if (services.length === 0) {
            return res.success({ count: 0 }, 'No services found for this provider');
        }

        // Delete all services for this provider
        await Service.destroy({ where: { providerId } });

        await addAuditLog(req.models, {
            action: 'service.deleteAll',
            message: `All services deleted for Provider ${provider.name} (${services.length} services)`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId, deletedCount: services.length }
        });

        return res.success({ count: services.length }, `${services.length} service(s) deleted for provider`);
    } catch (err) {
        return next(err);
    }
}

async function bulkCreateServices(req, res, next) {
    try {
        const { Service, Provider } = req.models;
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

        // Validate and create service records
        const createdServices = [];
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

                // Validate pricing
                const priceType = row.priceType ? row.priceType.toLowerCase() : 'fixed';
                if (priceType === 'fixed') {
                    const fixedPrice = row.fixedPrice || row.price;
                    if (!fixedPrice) {
                        errors.push({ row: rowNumber, error: 'fixedPrice or price is required for fixed price type' });
                        continue;
                    }
                } else if (priceType === 'rate') {
                    if (!row.rateType) {
                        errors.push({ row: rowNumber, error: 'rateType is required for rate price type' });
                        continue;
                    }
                    if (!row.rateAmount) {
                        errors.push({ row: rowNumber, error: 'rateAmount is required for rate price type' });
                        continue;
                    }
                } else {
                    errors.push({ row: rowNumber, error: 'priceType must be either "fixed" or "rate"' });
                    continue;
                }

                // Generate service code if not provided
                let serviceCode = row.code;
                if (!serviceCode) {
                    const serviceCount = await Service.count({ where: { providerId } });
                    const nextServiceNumber = serviceCount + createdServices.length + 1;
                    serviceCode = `${provider.code}-s${nextServiceNumber}`;
                }

                // Check for duplicate code
                const existingCode = await Service.findOne({ where: { code: serviceCode } });
                if (existingCode) {
                    errors.push({ row: rowNumber, error: `Service code already exists: ${serviceCode}` });
                    continue;
                }

                // Prepare service data
                const serviceData = {
                    name: row.name.trim(),
                    code: serviceCode,
                    description: row.description ? row.description.trim() : null,
                    requiresPreauthorization: row.requiresPreauthorization === 'true' || row.requiresPreauthorization === true ? true : false,
                    priceType,
                    providerId,
                    status: row.status ? row.status.toLowerCase() : 'pending'
                };

                // Add pricing fields based on type
                if (priceType === 'fixed') {
                    const fixedPrice = row.fixedPrice || row.price;
                    serviceData.fixedPrice = parseFloat(fixedPrice);
                    serviceData.price = parseFloat(fixedPrice); // maintain backwards compatibility
                } else {
                    serviceData.rateType = row.rateType.toLowerCase();
                    serviceData.rateAmount = parseFloat(row.rateAmount);
                }

                // Create the service
                const service = await Service.create(serviceData);
                createdServices.push(service.toJSON());
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
            action: 'service.bulk_create',
            message: `${createdServices.length} service(s) created via bulk upload for provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { createdCount: createdServices.length, errorCount: errors.length, providerId }
        });

        // Return response
        const message =
            errors.length > 0
                ? `${createdServices.length} service(s) created with ${errors.length} error(s)`
                : `${createdServices.length} service(s) created successfully`;

        return res.success(
            { services: createdServices, errors, createdCount: createdServices.length, errorCount: errors.length },
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
    createService,
    updateService,
    deleteService,
    listServices,
    getService,
    deleteAllServicesByProvider,
    bulkCreateServices
};
