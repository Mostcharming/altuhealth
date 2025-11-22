const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { addAdminNotification, addAuditLog } = require('../../../utils/addAdminNotification');
const notify = require('../../../utils/notify');
const generateCode = require('../../../utils/verificationCode');

// Controller for managing admin users (list, get, create, update, delete, assign role/unit)

async function listAdmins(req, res, next) {
    try {
        const { Admin, UserRole, UserUnit } = req.models;
        const { limit = 10, page = 1, q, roleId, unitId, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = { isDeleted: false };
        if (status) where.status = status;

        if (q) {
            where[Op.or] = [
                { firstName: { [Op.iLike || Op.like]: `%${q}%` } },
                { lastName: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (roleId) {
            const rps = await UserRole.findAll({ where: { roleId, userType: 'admin' } });
            const uids = rps.map(r => r.userId);
            if (uids.length === 0) return res.success({ list: [], count: 0, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages: 0 }, 'Admins fetched');
            where.id = { [Op.in]: uids };
        }

        if (unitId) {
            const aus = await UserUnit.findAll({ where: { unitId, userType: 'admin' } });
            const uids = aus.map(u => u.userId);
            if (uids.length === 0) return res.success({ list: [], count: 0, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages: 0 }, 'Admins fetched');
            where.id = where.id ? { [Op.in]: where.id[Op.in].filter(id => uids.includes(id)) } : { [Op.in]: uids };
        }

        const total = await Admin.count({ where });

        const findOptions = { where, order: [['created_at', 'DESC']] };
        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = offset;
        }

        const rows = await Admin.findAll(findOptions);
        const data = rows.map(r => ({
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            picture: r.picture || null,
            phoneNumber: r.phoneNumber || null,
            status: r.status || 'active',
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
        }));

        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);
        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + rows.length < total);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getAdmin(req, res, next) {
    try {
        const { Admin, UserRole, UserUnit, Role, Unit } = req.models;
        const { id } = req.params;
        const user = await Admin.findByPk(id);
        if (!user) return res.fail('Admin not found', 404);

        const rps = await UserRole.findAll({ where: { userId: id, userType: 'admin' } });
        const roleIds = rps.map(r => r.roleId);
        const roles = roleIds.length ? await Role.findAll({ where: { id: { [Op.in]: roleIds } } }) : [];

        const aus = await UserUnit.findAll({ where: { userId: id, userType: 'admin' } });
        const unitIds = aus.map(a => a.unitId);
        const units = unitIds.length ? await Unit.findAll({ where: { id: { [Op.in]: unitIds } } }) : [];

        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            picture: user.picture || null,
            phoneNumber: user.phoneNumber || null,
            status: user.status || 'active',
            latitude: user.latitude || null,
            longitude: user.longitude || null,
            currentLocation: user.currentLocation || null,
            state: user.state || null,
            country: user.country || null,
            address: user.address || null,
            city: user.city || null,
            postalCode: user.postalCode || null,
            roles,
            units
        };

        return res.success({ user: safeUser }, 'Admin fetched');
    } catch (err) {
        return next(err);
    }
}

async function createAdmin(req, res, next) {
    try {
        const { Admin, UserRole, UserUnit, Role, Unit } = req.models;
        const { firstName, lastName, email, password, phoneNumber, status, roleId, unitId } = req.body || {};

        // password is optional; auto-generate if not provided
        if (!firstName || !lastName || !email) return res.fail('firstName, lastName and email are required', 400);

        const existing = await Admin.findOne({ where: { email } });
        if (existing) return res.fail('Email already in use', 400);

        const rawPassword = (password && typeof password === 'string' && password.trim() !== '') ? password : generateCode(10, { letters: true, numbers: true });
        const hashed = await bcrypt.hash(rawPassword, 10);

        const admin = await Admin.create({ firstName, lastName, email, passwordHash: hashed, phoneNumber: phoneNumber || null, status: status || 'active' });

        // optional role assign
        if (roleId) {
            const role = await Role.findByPk(roleId);
            if (!role) return res.fail('Role not found', 400);
            await UserRole.create({ userId: admin.id, userType: 'admin', roleId });
        }

        if (unitId) {
            const unit = await Unit.findByPk(unitId);
            if (!unit) return res.fail('Unit not found', 400);
            await UserUnit.create({ userId: admin.id, userType: 'admin', unitId });
        }

        // create audit log for admin creation (don't block main flow on failure)
        try {
            await addAuditLog(req.models, {
                action: 'admin.create',
                message: `Admin created: ${admin.email}`,
                meta: { adminId: admin.id, email: admin.email }
            });
        } catch (e) {
            // non-fatal: log and continue
            console.error('Failed to create audit log for admin creation', e);
        }

        // create admin notification (don't block main flow on failure)
        try {
            await addAdminNotification(req.models, {
                title: `New admin: ${admin.firstName} ${admin.lastName}`,
                clickUrl: `admins`
            });
        } catch (e) {
            console.error('Failed to create admin notification for admin creation', e);
        }

        // send credentials to admin email (don't block main flow on failure)
        try {
            await notify(admin, 'Admin', 'ADMIN_CREATE', { firstName: admin.firstName, password: rawPassword, email: admin.email }, ['email'], true);
        } catch (e) {
            console.error('Failed to notify new admin via email', e);
        }

        return res.success({ id: admin.id }, 'Admin created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateAdmin(req, res, next) {
    try {
        const { Admin } = req.models;
        const { id } = req.params;
        const body = req.body || {};

        const user = await Admin.findByPk(id);
        if (!user) return res.fail('Admin not found', 404);

        const allowed = ['firstName', 'lastName', 'phoneNumber', 'picture', 'state', 'country', 'currentLocation', 'latitude', 'longitude', 'address', 'city', 'postalCode', 'status', 'email', 'password'];
        const updates = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        if (updates.email && updates.email !== user.email) {
            const exists = await Admin.findOne({ where: { email: updates.email } });
            if (exists) return res.fail('Email already in use', 400);
        }

        if (updates.password) {
            updates.passwordHash = await bcrypt.hash(updates.password, 10);
            delete updates.password;
        }

        if (Object.keys(updates).length === 0) return res.fail('No updatable fields provided', 400);

        await user.update(updates);
        if (typeof user.reload === 'function') await user.reload();

        return res.success({ id: user.id }, 'Admin updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteAdmin(req, res, next) {
    try {
        const { Admin, UserRole, UserUnit } = req.models;
        const { id } = req.params;

        const user = await Admin.findByPk(id);
        if (!user) return res.fail('Admin not found', 404);

        // soft delete
        await user.update({ isDeleted: true, status: 'inactive' });

        // remove roles/units
        await UserRole.destroy({ where: { userId: id, userType: 'admin' } });
        await UserUnit.destroy({ where: { userId: id, userType: 'admin' } });

        // audit log for deletion (non-blocking)
        try {
            await addAuditLog(req.models, {
                action: 'admin.delete',
                message: `Admin deleted: ${user.email || id}`,
                meta: { adminId: user.id, email: user.email }
            });
        } catch (e) {
            console.error('Failed to create audit log for admin deletion', e);
        }

        return res.success(null, 'Admin deleted');
    } catch (err) {
        return next(err);
    }
}

async function assignRole(req, res, next) {
    try {
        const { Role, UserRole, Admin } = req.models;
        const { id } = req.params;
        const { roleId } = req.body || {};

        if (!roleId) return res.fail('roleId is required', 400);

        const user = await Admin.findByPk(id);
        if (!user) return res.fail('Admin not found', 404);

        const role = await Role.findByPk(roleId);
        if (!role) return res.fail('Role not found', 404);

        // remove existing mappings for this user and create new one (single role semantics)
        await UserRole.destroy({ where: { userId: id, userType: 'admin' } });
        await UserRole.create({ userId: id, userType: 'admin', roleId });

        return res.success(null, 'Role assigned');
    } catch (err) {
        return next(err);
    }
}

async function assignUnit(req, res, next) {
    try {
        const { Unit, UserUnit, Admin } = req.models;
        const { id } = req.params;
        const { unitId } = req.body || {};

        if (!unitId) return res.fail('unitId is required', 400);

        const user = await Admin.findByPk(id);
        if (!user) return res.fail('Admin not found', 404);

        const unit = await Unit.findByPk(unitId);
        if (!unit) return res.fail('Unit not found', 404);

        // remove existing and add new (single unit semantics)
        await UserUnit.destroy({ where: { userId: id, userType: 'admin' } });
        await UserUnit.create({ userId: id, userType: 'admin', unitId });

        return res.success(null, 'Unit assigned');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listAdmins,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    assignRole,
    assignUnit
};
