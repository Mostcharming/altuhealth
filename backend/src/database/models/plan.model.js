'use strict';

module.exports = (sequelize, DataTypes) => {
    const Plan = sequelize.define('Plan', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'code'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_active'
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_approved'
        }
    }, {
        tableName: 'plans',
        timestamps: true,
        underscored: true
    });

    return Plan;
};
