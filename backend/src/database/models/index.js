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
  const AdminApproval = require("./adminApproval.model")(sequelize, DataTypes);
  const Exclusion = require("./exclusion.model")(sequelize, DataTypes);
  const BenefitCategory = require("./benefitCategory.model")(sequelize, DataTypes);
  const Benefit = require("./benefit.model")(sequelize, DataTypes);
  const Diagnosis = require("./diagnosis.model")(sequelize, DataTypes);
  const ProviderSpecialization = require("./providerSpecialization.model")(sequelize, DataTypes);


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

  // AdminApproval: requests that require admin action (requested_by, actioned_by)
  Admin.hasMany(AdminApproval, { foreignKey: "requested_by", constraints: false, scope: { requested_by_type: "Admin" } });
  AdminApproval.belongsTo(Admin, { foreignKey: "requested_by", constraints: false });
  Admin.hasMany(AdminApproval, { foreignKey: "actioned_by", constraints: false, scope: { actioned_by_type: "Admin" } });
  AdminApproval.belongsTo(Admin, { foreignKey: "actioned_by", constraints: false });

  // BenefitCategory <-> Benefit one-to-many
  BenefitCategory.hasMany(Benefit, { foreignKey: "benefitCategoryId" });
  Benefit.belongsTo(BenefitCategory, { foreignKey: "benefitCategoryId" });

  return { License, Admin, Role, Privilege, RolePrivilege, Unit, UserRole, UserUnit, PolicyNumber, Plan, GeneralSetting, AdminNotification, AdminApproval, NotificationLog, NotificationTemplate, PasswordReset, AuditLog, Exclusion, BenefitCategory, Benefit, Diagnosis, ProviderSpecialization };
}

module.exports = defineModels;
