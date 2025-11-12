const { Op } = require('sequelize');

async function createRole(req, res, next) {
    try {
        const { Role, RolePrivilege, Privilege } = req.models;
        const { name, description, privilegeIds } = req.body || {};

        if (!name) return res.fail('`name` is required', 400);

        const sequelize = Role.sequelize;

        // normalize incoming privilege ids
        const ids = Array.isArray(privilegeIds) ? privilegeIds.filter(Boolean) : [];

        // optional: validate privileges exist
        if (ids.length) {
            const found = await Privilege.findAll({ where: { id: { [Op.in]: ids } } });
            if (found.length !== ids.length) return res.fail('One or more privileges are invalid', 400);
        }

        let role;
        await sequelize.transaction(async (t) => {
            role = await Role.create({ name, description }, { transaction: t });

            if (ids.length) {
                const bulk = ids.map(pid => ({ roleId: role.id, privilegeId: pid }));
                await RolePrivilege.bulkCreate(bulk, { transaction: t });
            }
        });

        // fetch privileges to return
        const privileges = ids.length ? await Privilege.findAll({ where: { id: { [Op.in]: ids } } }) : [];

        return res.success({ role: role.toJSON(), privileges }, 'Role created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateRole(req, res, next) {
    try {
        const { Role } = req.models;
        const { id } = req.params;

        const role = await Role.findByPk(id);
        if (!role) return res.fail('Role not found', 404);

        await role.update(req.body || {});

        return res.success(role, 'Role updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteRole(req, res, next) {
    try {
        const { Role, UserRole, RolePrivilege } = req.models;
        const { id } = req.params;

        const role = await Role.findByPk(id);
        if (!role) return res.fail('Role not found', 404);

        const assignedCount = await UserRole.count({ where: { roleId: id } });
        if (assignedCount > 0) {
            return res.fail('Role is assigned to a user and cannot be deleted', 400);
        }

        // remove role privileges and delete role
        await RolePrivilege.destroy({ where: { roleId: id } });
        await role.destroy();

        return res.success(null, 'Role deleted');
    } catch (err) {
        return next(err);
    }
}

async function listRoles(req, res, next) {
    try {
        const { Role, RolePrivilege, Privilege } = req.models;
        const { limit = 50, page = 1, q } = req.query;
        const limitNum = Number(limit);
        const pageNum = Number(page) || 1;
        const offset = (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            // postgres iLike for case-insensitive search; fallback to like if not supported
            where.name = { [Op.iLike || Op.like]: `%${q}%` };
        }

        // total count for pagination
        const total = await Role.count({ where });

        const roles = await Role.findAll({
            where,
            order: [['created_at', 'DESC']],
            limit: limitNum,
            offset: Number(offset)
        });

        // attach privileges for each role
        const roleIds = roles.map(r => r.id);
        let roleMap = {};
        if (roleIds.length) {
            const rps = await RolePrivilege.findAll({ where: { roleId: { [Op.in]: roleIds } } });
            const privilegeIds = rps.map(rp => rp.privilegeId);
            const privileges = await Privilege.findAll({ where: { id: { [Op.in]: privilegeIds } } });
            const privMap = (privileges || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

            roleMap = rps.reduce((acc, rp) => {
                acc[rp.roleId] = acc[rp.roleId] || [];
                if (privMap[rp.privilegeId]) acc[rp.roleId].push(privMap[rp.privilegeId]);
                return acc;
            }, {});
        }

        const data = roles.map(r => ({ ...r.toJSON(), privileges: roleMap[r.id] || [] }));

        const hasPrevPage = pageNum > 1;
        const hasNextPage = offset + roles.length < total;

        return res.success({ list: data, count: total, page: pageNum, limit: limitNum, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getRole(req, res, next) {
    try {
        const { Role, RolePrivilege, Privilege } = req.models;
        const { id } = req.params;

        const role = await Role.findByPk(id);
        if (!role) return res.fail('Role not found', 404);

        const rps = await RolePrivilege.findAll({ where: { roleId: id } });
        const privilegeIds = rps.map(rp => rp.privilegeId);
        const privileges = privilegeIds.length ? await Privilege.findAll({ where: { id: { [Op.in]: privilegeIds } } }) : [];

        return res.success({ ...role.toJSON(), privileges });
    } catch (err) {
        return next(err);
    }
}

async function assignPrivileges(req, res, next) {
    try {
        const { Role, RolePrivilege, Privilege } = req.models;
        const { id } = req.params;
        const { privilegeIds } = req.body || {};

        const role = await Role.findByPk(id);
        if (!role) return res.fail('Role not found', 404);

        const sequelize = Role.sequelize;

        // normalize
        const ids = Array.isArray(privilegeIds) ? privilegeIds.filter(Boolean) : [];

        // optional: validate privileges exist
        if (ids.length) {
            const found = await Privilege.findAll({ where: { id: { [Op.in]: ids } } });
            if (found.length !== ids.length) return res.fail('One or more privileges are invalid', 400);
        }

        await sequelize.transaction(async (t) => {
            // remove existing mappings then add new ones
            await RolePrivilege.destroy({ where: { roleId: id }, transaction: t });

            if (ids.length) {
                const bulk = ids.map(pid => ({ roleId: id, privilegeId: pid }));
                await RolePrivilege.bulkCreate(bulk, { transaction: t });
            }
        });

        const newRps = await RolePrivilege.findAll({ where: { roleId: id } });
        const newPrivilegeIds = newRps.map(rp => rp.privilegeId);
        const privileges = newPrivilegeIds.length ? await Privilege.findAll({ where: { id: { [Op.in]: newPrivilegeIds } } }) : [];

        return res.success({ role: role.toJSON(), privileges }, 'Privileges assigned to role');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createRole,
    updateRole,
    deleteRole,
    listRoles,
    getRole,
    assignPrivileges
};
