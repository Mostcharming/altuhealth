'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

async function createSubsidiary(req, res, next) {
    try {
        const { CompanySubsidiary, Company } = req.models;
        const {
            companyId,
            name,
            registrationNumber,
            email,
            phoneNumber,
            secondaryPhoneNumber,
            address,
            city,
            state,
            country,
            zipCode,
            website,
            industryType,
            numberOfEmployees,
            contactPersonName,
            contactPersonTitle,
            contactPersonEmail,
            contactPersonPhoneNumber,
            taxIdentificationNumber,
            bankName,
            bankAccountNumber,
            bankCode,
            subsidiaryType,
            establishmentDate,
            operatingLicense,
            licenseExpiryDate,
            parentSubsidiaryId,
            metadata
        } = req.body || {};

        // Validate required fields
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!name) return res.fail('`name` is required', 400);
        if (!email) return res.fail('`email` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);
        if (!address) return res.fail('`address` is required', 400);
        if (!city) return res.fail('`city` is required', 400);
        if (!state) return res.fail('`state` is required', 400);
        if (!country) return res.fail('`country` is required', 400);
        if (!contactPersonName) return res.fail('`contactPersonName` is required', 400);

        // Verify company exists
        const company = await Company.findByPk(companyId);
        if (!company) return res.fail('Company not found', 404);

        // Check if email is unique
        const existingSubsidiary = await CompanySubsidiary.findOne({ where: { email } });
        if (existingSubsidiary) return res.fail('Email already exists', 400);

        // Check if registrationNumber is unique (if provided)
        if (registrationNumber) {
            const existingReg = await CompanySubsidiary.findOne({ where: { registrationNumber } });
            if (existingReg) return res.fail('Registration number already exists', 400);
        }

        // Create subsidiary
        const subsidiary = await CompanySubsidiary.create({
            companyId,
            name,
            registrationNumber,
            email,
            phoneNumber,
            secondaryPhoneNumber,
            address,
            city,
            state,
            country,
            zipCode,
            website,
            industryType,
            numberOfEmployees,
            contactPersonName,
            contactPersonTitle,
            contactPersonEmail,
            contactPersonPhoneNumber,
            taxIdentificationNumber,
            bankName,
            bankAccountNumber,
            bankCode,
            subsidiaryType: subsidiaryType || 'branch',
            establishmentDate,
            operatingLicense,
            licenseExpiryDate,
            parentSubsidiaryId,
            metadata,
            isActive: true
        });

        // Create admin approval request
        // try {
        //     await createAdminApproval(req.models, {
        //         model: 'CompanySubsidiary',
        //         modelId: subsidiary.id,
        //         action: 'create',
        //         details: {
        //             name: subsidiary.name,
        //             email: subsidiary.email,
        //             companyId: subsidiary.companyId,
        //             address: subsidiary.address,
        //             city: subsidiary.city,
        //             state: subsidiary.state,
        //             country: subsidiary.country
        //         },
        //         requestedBy: (req.user && req.user.id) ? req.user.id : null,
        //         requestedByType: (req.user && req.user.type) ? req.user.type : 'Admin',
        //         comments: `New company subsidiary created: ${subsidiary.name}`
        //     });
        // } catch (approvalErr) {
        //     if (console && console.warn) console.warn('Failed to create approval for subsidiary:', approvalErr.message || approvalErr);
        // }

        await addAuditLog(req.models, {
            action: 'companySubsidiary.create',
            message: `Company Subsidiary ${subsidiary.name} created for Company ${company.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subsidiaryId: subsidiary.id, companyId }
        });

        return res.success({ subsidiary: subsidiary.toJSON() }, 'Company subsidiary created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateSubsidiary(req, res, next) {
    try {
        const { CompanySubsidiary } = req.models;
        const { id } = req.params;
        const {
            name,
            registrationNumber,
            email,
            phoneNumber,
            secondaryPhoneNumber,
            address,
            city,
            state,
            country,
            zipCode,
            website,
            industryType,
            numberOfEmployees,
            contactPersonName,
            contactPersonTitle,
            contactPersonEmail,
            contactPersonPhoneNumber,
            taxIdentificationNumber,
            bankName,
            bankAccountNumber,
            bankCode,
            subsidiaryType,
            establishmentDate,
            operatingLicense,
            licenseExpiryDate,
            isActive,
            parentSubsidiaryId,
            metadata
        } = req.body || {};

        const subsidiary = await CompanySubsidiary.findByPk(id);
        if (!subsidiary) return res.fail('Company subsidiary not found', 404);

        const updates = {};

        if (name !== undefined) updates.name = name;
        if (registrationNumber !== undefined) updates.registrationNumber = registrationNumber;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (secondaryPhoneNumber !== undefined) updates.secondaryPhoneNumber = secondaryPhoneNumber;
        if (address !== undefined) updates.address = address;
        if (city !== undefined) updates.city = city;
        if (state !== undefined) updates.state = state;
        if (country !== undefined) updates.country = country;
        if (zipCode !== undefined) updates.zipCode = zipCode;
        if (website !== undefined) updates.website = website;
        if (industryType !== undefined) updates.industryType = industryType;
        if (numberOfEmployees !== undefined) updates.numberOfEmployees = numberOfEmployees;
        if (contactPersonName !== undefined) updates.contactPersonName = contactPersonName;
        if (contactPersonTitle !== undefined) updates.contactPersonTitle = contactPersonTitle;
        if (contactPersonEmail !== undefined) updates.contactPersonEmail = contactPersonEmail;
        if (contactPersonPhoneNumber !== undefined) updates.contactPersonPhoneNumber = contactPersonPhoneNumber;
        if (taxIdentificationNumber !== undefined) updates.taxIdentificationNumber = taxIdentificationNumber;
        if (bankName !== undefined) updates.bankName = bankName;
        if (bankAccountNumber !== undefined) updates.bankAccountNumber = bankAccountNumber;
        if (bankCode !== undefined) updates.bankCode = bankCode;
        if (subsidiaryType !== undefined) updates.subsidiaryType = subsidiaryType;
        if (establishmentDate !== undefined) updates.establishmentDate = establishmentDate;
        if (operatingLicense !== undefined) updates.operatingLicense = operatingLicense;
        if (licenseExpiryDate !== undefined) updates.licenseExpiryDate = licenseExpiryDate;
        if (isActive !== undefined) updates.isActive = isActive;
        if (parentSubsidiaryId !== undefined) updates.parentSubsidiaryId = parentSubsidiaryId;
        if (metadata !== undefined) updates.metadata = metadata;

        // Validate unique email (if being updated)
        if (email !== undefined) {
            const other = await CompanySubsidiary.findOne({
                where: { email, id: { [Op.ne]: id } }
            });
            if (other) return res.fail('Email already exists', 400);
            updates.email = email;
        }

        // Validate unique registration number (if being updated)
        if (registrationNumber !== undefined && registrationNumber) {
            const other = await CompanySubsidiary.findOne({
                where: { registrationNumber, id: { [Op.ne]: id } }
            });
            if (other) return res.fail('Registration number already exists', 400);
        }

        await subsidiary.update(updates);

        await addAuditLog(req.models, {
            action: 'companySubsidiary.update',
            message: `Company Subsidiary ${subsidiary.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subsidiaryId: subsidiary.id }
        });

        return res.success({ subsidiary }, 'Company subsidiary updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteSubsidiary(req, res, next) {
    try {
        const { CompanySubsidiary } = req.models;
        const { id } = req.params;

        const subsidiary = await CompanySubsidiary.findByPk(id);
        if (!subsidiary) return res.fail('Company subsidiary not found', 404);

        await subsidiary.destroy();

        await addAuditLog(req.models, {
            action: 'companySubsidiary.delete',
            message: `Company Subsidiary ${subsidiary.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subsidiaryId: id }
        });

        return res.success(null, 'Company subsidiary deleted');
    } catch (err) {
        return next(err);
    }
}

async function listSubsidiaries(req, res, next) {
    try {
        const { CompanySubsidiary, Company } = req.models;
        const { limit = 10, page = 1, q, companyId, isActive, subsidiaryType } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } },
                { phoneNumber: { [Op.iLike || Op.like]: `%${q}%` } },
                { city: { [Op.iLike || Op.like]: `%${q}%` } },
                { state: { [Op.iLike || Op.like]: `%${q}%` } },
                { contactPersonName: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (companyId) where.companyId = companyId;
        if (isActive !== undefined) {
            where.isActive = isActive === 'true' || isActive === true;
        }
        if (subsidiaryType) where.subsidiaryType = subsidiaryType;

        const total = await CompanySubsidiary.count({ where });

        const findOptions = {
            where,
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const subsidiaries = await CompanySubsidiary.findAll(findOptions);
        const data = subsidiaries.map(s => s.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + subsidiaries.length < total);
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

async function getSubsidiary(req, res, next) {
    try {
        const { CompanySubsidiary, Company } = req.models;
        const { id } = req.params;

        const subsidiary = await CompanySubsidiary.findByPk(id, {
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name', 'email', 'phoneNumber']
                }
            ]
        });

        if (!subsidiary) return res.fail('Company subsidiary not found', 404);

        return res.success(subsidiary.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function deleteAllSubsidiariesByCompany(req, res, next) {
    try {
        const { CompanySubsidiary, Company } = req.models;
        const { companyId } = req.params;

        // Verify company exists
        const company = await Company.findByPk(companyId);
        if (!company) return res.fail('Company not found', 404);

        // Get all subsidiaries for this company
        const subsidiaries = await CompanySubsidiary.findAll({ where: { companyId } });

        if (subsidiaries.length === 0) {
            return res.success({ count: 0 }, 'No subsidiaries found for this company');
        }

        // Delete all subsidiaries for this company
        await CompanySubsidiary.destroy({ where: { companyId } });

        await addAuditLog(req.models, {
            action: 'companySubsidiary.deleteAll',
            message: `All subsidiaries deleted for Company ${company.name} (${subsidiaries.length} subsidiaries)`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyId, deletedCount: subsidiaries.length }
        });

        return res.success({ count: subsidiaries.length }, `${subsidiaries.length} subsidiary/subsidiaries deleted for company`);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createSubsidiary,
    updateSubsidiary,
    deleteSubsidiary,
    listSubsidiaries,
    getSubsidiary,
    deleteAllSubsidiariesByCompany
};
