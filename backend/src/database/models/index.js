const { DataTypes } = require('sequelize');


function defineModels(sequelize) {
  const License = require("./license.model")(sequelize, DataTypes);
  const Admin = require("./admin.model")(sequelize, DataTypes);
  const Role = require("./role.model")(sequelize, DataTypes);
  const Privilege = require("./privilege.model")(sequelize, DataTypes);
  const RolePrivilege = require("./rolePrivilege.model")(sequelize, DataTypes);
  const Unit = require("./unit.model")(sequelize, DataTypes);
  const UserRole = require("./userRole.model")(sequelize, DataTypes);
  const UserUnit = require("./userUnit.model")(sequelize, DataTypes);
  const PolicyNumber = require("./policy.model")(sequelize, DataTypes);
  const GeneralSetting = require("./generalSetting.model")(sequelize, DataTypes);
  const AdminNotification = require("./adminNotification.model")(sequelize, DataTypes);
  const NotificationLog = require("./notification.model")(sequelize, DataTypes);
  const NotificationTemplate = require("./notificationTemplate.model")(sequelize, DataTypes);
  const PasswordReset = require("./passwordReset.model")(sequelize, DataTypes);
  const AuditLog = require("./auditLog.model")(sequelize, DataTypes);
  const Plan = require("./plan.model")(sequelize, DataTypes);


  Admin.hasMany(UserRole, { foreignKey: "userId", constraints: false, scope: { userType: "Admin" } });
  UserRole.belongsTo(Admin, { foreignKey: "userId", constraints: false });

  Admin.hasMany(UserUnit, { foreignKey: "userId", constraints: false, scope: { userType: "Admin" } });
  UserUnit.belongsTo(Admin, { foreignKey: "userId", constraints: false });

  Role.hasMany(UserRole, { foreignKey: "roleId" });
  UserRole.belongsTo(Role, { foreignKey: "roleId" });

  // Role <-> Privilege many-to-many through RolePrivilege
  Role.belongsToMany(Privilege, { through: RolePrivilege, foreignKey: 'roleId', otherKey: 'privilegeId' });
  Privilege.belongsToMany(Role, { through: RolePrivilege, foreignKey: 'privilegeId', otherKey: 'roleId' });

  Unit.hasMany(UserUnit, { foreignKey: "unitId" });
  UserUnit.belongsTo(Unit, { foreignKey: "unitId" });

  Admin.hasMany(AdminNotification, { foreignKey: "userId", constraints: false, scope: { userType: "Admin" } });
  AdminNotification.belongsTo(Admin, { foreignKey: "userId", constraints: false });

  return { License, Admin, Role, Privilege, RolePrivilege, Unit, UserRole, UserUnit, PolicyNumber, Plan, GeneralSetting, AdminNotification, NotificationLog, NotificationTemplate, PasswordReset, AuditLog };
}

module.exports = defineModels;
