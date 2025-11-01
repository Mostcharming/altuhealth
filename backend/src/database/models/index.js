const { DataTypes } = require('sequelize');


function defineModels(sequelize) {
  const License = require("./license.model")(sequelize, DataTypes);
  const Admin = require("./admin.model")(sequelize, DataTypes);
  const Role = require("./role.model")(sequelize, DataTypes);
  const Unit = require("./unit.model")(sequelize, DataTypes);
  const UserRole = require("./userRole.model")(sequelize, DataTypes);
  const UserUnit = require("./userUnit.model")(sequelize, DataTypes);


  Admin.hasMany(UserRole, { foreignKey: "userId", constraints: false, scope: { userType: "Admin" } });
  UserRole.belongsTo(Admin, { foreignKey: "userId", constraints: false });

  Admin.hasMany(UserUnit, { foreignKey: "userId", constraints: false, scope: { userType: "Admin" } });
  UserUnit.belongsTo(Admin, { foreignKey: "userId", constraints: false });

  Role.hasMany(UserRole, { foreignKey: "roleId" });
  UserRole.belongsTo(Role, { foreignKey: "roleId" });

  Unit.hasMany(UserUnit, { foreignKey: "unitId" });
  UserUnit.belongsTo(Unit, { foreignKey: "unitId" });



  return { License, Admin, Role, Unit, UserRole, UserUnit };
}

module.exports = defineModels;
