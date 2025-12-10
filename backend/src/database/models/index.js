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
  const CompanySubsidiary = require("./companySubsidiary.model")(sequelize, DataTypes);
  const UtilizationReview = require("./utilizationReview.model")(sequelize, DataTypes);
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
  const Provider = require("./provider.model")(sequelize, DataTypes);
  const ProviderPlan = require("./providerPlan.model")(sequelize, DataTypes);
  const Service = require("./service.model")(sequelize, DataTypes);
  const Drug = require("./drug.model")(sequelize, DataTypes);
  const Company = require("./company.model")(sequelize, DataTypes);
  const CompanyPlan = require("./companyPlan.model")(sequelize, DataTypes);
  const CompanyPlanBenefitCategory = require("./companyPlanBenefitCategory.model")(sequelize, DataTypes);
  const CompanyPlanExclusion = require("./companyPlanExclusion.model")(sequelize, DataTypes);
  const CompanyPlanProvider = require("./companyPlanProvider.model")(sequelize, DataTypes);
  const Subscription = require("./subscription.model")(sequelize, DataTypes);
  const SubscriptionPlan = require("./subscriptionPlan.model")(sequelize, DataTypes);
  const Staff = require("./staff.model")(sequelize, DataTypes);
  const Enrollee = require("./enrollee.model")(sequelize, DataTypes);
  const EnrolleeMedicalHistory = require("./enrolleeMedicalHistory.model")(sequelize, DataTypes);
  const EnrolleeDependent = require("./enrolleeDependent.model")(sequelize, DataTypes);
  const AuthorizationCode = require("./authorizationCode.model")(sequelize, DataTypes);
  const RetailEnrollee = require("./retailEnrollee.model")(sequelize, DataTypes);
  const RetailEnrolleeNextOfKin = require("./retailEnrolleeNextOfKin.model")(sequelize, DataTypes);
  const RetailEnrolleeDependent = require("./retailEnrolleeDependent.model")(sequelize, DataTypes);
  const RetailEnrolleeMedicalHistory = require("./retailEnrolleeMedicalHistory.model")(sequelize, DataTypes);
  const PaymentBatch = require("./paymentBatch.model")(sequelize, DataTypes);
  const PaymentBatchDetail = require("./paymentBatchDetail.model")(sequelize, DataTypes);
  const ClaimInfo = require("./claimInfo.model")(sequelize, DataTypes);
  const Conflict = require("./conflict.model")(sequelize, DataTypes);

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

  // Provider <-> Admin (manager)
  Admin.hasMany(Provider, { foreignKey: "managerId", as: 'managedProviders' });
  Provider.belongsTo(Admin, { foreignKey: "managerId", as: 'manager' });

  // Provider <-> ProviderSpecialization
  ProviderSpecialization.hasMany(Provider, { foreignKey: "providerSpecializationId" });
  Provider.belongsTo(ProviderSpecialization, { foreignKey: "providerSpecializationId" });

  // Provider <-> Plan many-to-many through ProviderPlan
  Provider.belongsToMany(Plan, { through: ProviderPlan, foreignKey: 'providerId', otherKey: 'planId' });
  Plan.belongsToMany(Provider, { through: ProviderPlan, foreignKey: 'planId', otherKey: 'providerId' });

  // Provider <-> Service one-to-many
  Provider.hasMany(Service, { foreignKey: "providerId" });
  Service.belongsTo(Provider, { foreignKey: "providerId" });

  // Provider <-> Drug one-to-many
  Provider.hasMany(Drug, { foreignKey: "providerId" });
  Drug.belongsTo(Provider, { foreignKey: "providerId" });

  // Company <-> CompanySubsidiary one-to-many
  Company.hasMany(CompanySubsidiary, { foreignKey: "companyId" });
  CompanySubsidiary.belongsTo(Company, { foreignKey: "companyId" });

  // Company <-> CompanyPlan one-to-many
  Company.hasMany(CompanyPlan, { foreignKey: "companyId" });
  CompanyPlan.belongsTo(Company, { foreignKey: "companyId" });

  // CompanyPlan <-> Plan many-to-one
  Plan.hasMany(CompanyPlan, { foreignKey: "planId" });
  CompanyPlan.belongsTo(Plan, { foreignKey: "planId" });

  // CompanyPlan <-> BenefitCategory many-to-many through CompanyPlanBenefitCategory
  CompanyPlan.belongsToMany(BenefitCategory, { through: CompanyPlanBenefitCategory, foreignKey: 'companyPlanId', otherKey: 'benefitCategoryId', as: 'benefitCategories' });
  BenefitCategory.belongsToMany(CompanyPlan, { through: CompanyPlanBenefitCategory, foreignKey: 'benefitCategoryId', otherKey: 'companyPlanId' });

  // CompanyPlanBenefitCategory direct relationships
  CompanyPlanBenefitCategory.belongsTo(CompanyPlan, { foreignKey: 'companyPlanId' });
  CompanyPlan.hasMany(CompanyPlanBenefitCategory, { foreignKey: 'companyPlanId' });

  CompanyPlanBenefitCategory.belongsTo(BenefitCategory, { foreignKey: 'benefitCategoryId' });
  BenefitCategory.hasMany(CompanyPlanBenefitCategory, { foreignKey: 'benefitCategoryId' });

  // CompanyPlan <-> Exclusion many-to-many through CompanyPlanExclusion
  CompanyPlan.belongsToMany(Exclusion, { through: CompanyPlanExclusion, foreignKey: 'companyPlanId', otherKey: 'exclusionId', as: 'exclusions' });
  Exclusion.belongsToMany(CompanyPlan, { through: CompanyPlanExclusion, foreignKey: 'exclusionId', otherKey: 'companyPlanId' });

  // CompanyPlan <-> Provider many-to-many through CompanyPlanProvider
  CompanyPlan.belongsToMany(Provider, { through: CompanyPlanProvider, foreignKey: 'companyPlanId', otherKey: 'providerId', as: 'providers' });
  Provider.belongsToMany(CompanyPlan, { through: CompanyPlanProvider, foreignKey: 'providerId', otherKey: 'companyPlanId' });

  // Subscription <-> Company one-to-many
  Company.hasMany(Subscription, { foreignKey: "companyId" });
  Subscription.belongsTo(Company, { foreignKey: "companyId" });

  // Subscription <-> CompanySubsidiary one-to-many
  CompanySubsidiary.hasMany(Subscription, { foreignKey: "subsidiaryId" });
  Subscription.belongsTo(CompanySubsidiary, { foreignKey: "subsidiaryId" });

  // Subscription <-> CompanyPlan many-to-many through SubscriptionPlan
  Subscription.belongsToMany(CompanyPlan, { through: SubscriptionPlan, foreignKey: 'subscriptionId', otherKey: 'companyPlanId', as: 'companyPlans' });
  CompanyPlan.belongsToMany(Subscription, { through: SubscriptionPlan, foreignKey: 'companyPlanId', otherKey: 'subscriptionId', as: 'subscriptions' });

  // SubscriptionPlan direct relationships for easier querying
  SubscriptionPlan.belongsTo(Subscription, { foreignKey: 'subscriptionId' });
  Subscription.hasMany(SubscriptionPlan, { foreignKey: 'subscriptionId' });

  SubscriptionPlan.belongsTo(CompanyPlan, { foreignKey: 'companyPlanId' });
  CompanyPlan.hasMany(SubscriptionPlan, { foreignKey: 'companyPlanId' });

  // Company <-> UtilizationReview one-to-many
  Company.hasMany(UtilizationReview, { foreignKey: "companyId" });
  UtilizationReview.belongsTo(Company, { foreignKey: "companyId" });

  // CompanyPlan <-> UtilizationReview one-to-many
  CompanyPlan.hasMany(UtilizationReview, { foreignKey: "companyPlanId" });
  UtilizationReview.belongsTo(CompanyPlan, { foreignKey: "companyPlanId" });

  // Staff <-> Company one-to-many
  Company.hasMany(Staff, { foreignKey: "companyId" });
  Staff.belongsTo(Company, { foreignKey: "companyId" });

  // Staff <-> CompanySubsidiary one-to-many
  CompanySubsidiary.hasMany(Staff, { foreignKey: "subsidiaryId" });
  Staff.belongsTo(CompanySubsidiary, { foreignKey: "subsidiaryId" });

  // Staff <-> CompanyPlan one-to-many
  CompanyPlan.hasMany(Staff, { foreignKey: "companyPlanId" });
  Staff.belongsTo(CompanyPlan, { foreignKey: "companyPlanId" });

  // Enrollee <-> Staff one-to-one
  Staff.hasOne(Enrollee, { foreignKey: "staffId", as: 'enrollee' });
  Enrollee.belongsTo(Staff, { foreignKey: "staffId" });

  // Enrollee <-> Company one-to-many
  Company.hasMany(Enrollee, { foreignKey: "companyId" });
  Enrollee.belongsTo(Company, { foreignKey: "companyId" });

  // Enrollee <-> CompanyPlan one-to-many
  CompanyPlan.hasMany(Enrollee, { foreignKey: "companyPlanId" });
  Enrollee.belongsTo(CompanyPlan, { foreignKey: "companyPlanId" });

  // EnrolleeMedicalHistory <-> Enrollee one-to-many
  Enrollee.hasMany(EnrolleeMedicalHistory, { foreignKey: "enrolleeId", as: 'medicalHistories' });
  EnrolleeMedicalHistory.belongsTo(Enrollee, { foreignKey: "enrolleeId" });

  // EnrolleeMedicalHistory <-> Provider one-to-many
  Provider.hasMany(EnrolleeMedicalHistory, { foreignKey: "providerId" });
  EnrolleeMedicalHistory.belongsTo(Provider, { foreignKey: "providerId" });

  // EnrolleeMedicalHistory <-> Diagnosis one-to-many
  Diagnosis.hasMany(EnrolleeMedicalHistory, { foreignKey: "diagnosisId" });
  EnrolleeMedicalHistory.belongsTo(Diagnosis, { foreignKey: "diagnosisId" });

  // AuthorizationCode <-> Enrollee one-to-many
  Enrollee.hasMany(AuthorizationCode, { foreignKey: "enrolleeId", as: 'authorizationCodes' });
  AuthorizationCode.belongsTo(Enrollee, { foreignKey: "enrolleeId" });

  // AuthorizationCode <-> Provider one-to-many
  Provider.hasMany(AuthorizationCode, { foreignKey: "providerId", as: 'authorizationCodes' });
  AuthorizationCode.belongsTo(Provider, { foreignKey: "providerId" });

  // AuthorizationCode <-> Diagnosis one-to-many
  Diagnosis.hasMany(AuthorizationCode, { foreignKey: "diagnosisId", as: 'authorizationCodes' });
  AuthorizationCode.belongsTo(Diagnosis, { foreignKey: "diagnosisId" });

  // EnrolleeDependent <-> Enrollee one-to-many
  Enrollee.hasMany(EnrolleeDependent, { foreignKey: "enrolleeId", as: 'dependents' });
  EnrolleeDependent.belongsTo(Enrollee, { foreignKey: "enrolleeId" });

  // RetailEnrollee <-> Plan one-to-many
  Plan.hasMany(RetailEnrollee, { foreignKey: "planId", as: 'retailEnrollees' });
  RetailEnrollee.belongsTo(Plan, { foreignKey: "planId", as: 'plan' });

  // RetailEnrollee <-> Admin (sold by) one-to-many
  Admin.hasMany(RetailEnrollee, { foreignKey: "soldByUserId", as: 'retailEnrolleesSoldBy' });
  RetailEnrollee.belongsTo(Admin, { foreignKey: "soldByUserId", as: 'soldByUser' });

  // RetailEnrollee <-> RetailEnrolleeNextOfKin one-to-many
  RetailEnrollee.hasMany(RetailEnrolleeNextOfKin, { foreignKey: "retailEnrolleeId", as: 'nextOfKins' });
  RetailEnrolleeNextOfKin.belongsTo(RetailEnrollee, { foreignKey: "retailEnrolleeId" });

  // RetailEnrollee <-> RetailEnrolleeDependent one-to-many
  RetailEnrollee.hasMany(RetailEnrolleeDependent, { foreignKey: "retailEnrolleeId", as: 'dependents' });
  RetailEnrolleeDependent.belongsTo(RetailEnrollee, { foreignKey: "retailEnrolleeId" });

  // RetailEnrolleeMedicalHistory <-> RetailEnrollee one-to-many
  RetailEnrollee.hasMany(RetailEnrolleeMedicalHistory, { foreignKey: "retailEnrolleeId", as: 'medicalHistories' });
  RetailEnrolleeMedicalHistory.belongsTo(RetailEnrollee, { foreignKey: "retailEnrolleeId" });

  // RetailEnrolleeMedicalHistory <-> Provider one-to-many
  Provider.hasMany(RetailEnrolleeMedicalHistory, { foreignKey: "providerId" });
  RetailEnrolleeMedicalHistory.belongsTo(Provider, { foreignKey: "providerId" });

  // RetailEnrolleeMedicalHistory <-> Diagnosis one-to-many
  Diagnosis.hasMany(RetailEnrolleeMedicalHistory, { foreignKey: "diagnosisId" });
  RetailEnrolleeMedicalHistory.belongsTo(Diagnosis, { foreignKey: "diagnosisId" });

  // PaymentBatch <-> PaymentBatchDetail one-to-many
  PaymentBatch.hasMany(PaymentBatchDetail, { foreignKey: "paymentBatchId", as: 'details' });
  PaymentBatchDetail.belongsTo(PaymentBatch, { foreignKey: "paymentBatchId" });

  // PaymentBatchDetail <-> Provider one-to-many
  Provider.hasMany(PaymentBatchDetail, { foreignKey: "providerId", as: 'paymentBatchDetails' });
  PaymentBatchDetail.belongsTo(Provider, { foreignKey: "providerId" });

  // ClaimInfo <-> PaymentBatchDetail one-to-many
  PaymentBatchDetail.hasMany(ClaimInfo, { foreignKey: "paymentBatchDetailId", as: 'claims' });
  ClaimInfo.belongsTo(PaymentBatchDetail, { foreignKey: "paymentBatchDetailId" });

  // ClaimInfo <-> Enrollee one-to-many
  Enrollee.hasMany(ClaimInfo, { foreignKey: "enrolleeId", as: 'claimInfos' });
  ClaimInfo.belongsTo(Enrollee, { foreignKey: "enrolleeId" });

  // Conflict <-> PaymentBatchDetail one-to-many
  PaymentBatchDetail.hasMany(Conflict, { foreignKey: "paymentBatchDetailId", as: 'conflicts' });
  Conflict.belongsTo(PaymentBatchDetail, { foreignKey: "paymentBatchDetailId" });

  // Conflict <-> Enrollee one-to-many
  Enrollee.hasMany(Conflict, { foreignKey: "enrolleeId", as: 'conflicts' });
  Conflict.belongsTo(Enrollee, { foreignKey: "enrolleeId" });

  // Conflict <-> Admin (assigned to) one-to-many
  Admin.hasMany(Conflict, { foreignKey: "assignedTo", as: 'assignedConflicts' });
  Conflict.belongsTo(Admin, { foreignKey: "assignedTo", as: 'assignedAdmin' });

  return { License, Admin, Role, Privilege, RolePrivilege, Unit, UserRole, UserUnit, PolicyNumber, Plan, GeneralSetting, CompanySubsidiary, UtilizationReview, AdminNotification, AdminApproval, NotificationLog, NotificationTemplate, PasswordReset, AuditLog, Exclusion, BenefitCategory, Benefit, Diagnosis, ProviderSpecialization, Provider, ProviderPlan, Service, Drug, Company, CompanyPlan, CompanyPlanBenefitCategory, CompanyPlanExclusion, CompanyPlanProvider, Subscription, SubscriptionPlan, Staff, Enrollee, EnrolleeMedicalHistory, EnrolleeDependent, AuthorizationCode, RetailEnrollee, RetailEnrolleeNextOfKin, RetailEnrolleeDependent, RetailEnrolleeMedicalHistory, PaymentBatch, PaymentBatchDetail, ClaimInfo, Conflict };
}

module.exports = defineModels;
