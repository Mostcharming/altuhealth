'use strict';

module.exports = (sequelize, DataTypes) => {
    const Subscription = sequelize.define('Subscription', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'code',
            comment: 'Auto-generated format: AHL-SUB-XXXX'
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            field: 'company_id'
        },
        mode: {
            type: DataTypes.ENUM('parent_only', 'parent_and_subsidiaries'),
            allowNull: false,
            defaultValue: 'parent_only',
            field: 'mode',
            comment: 'Determines if subscription applies to parent company only or includes subsidiaries'
        },
        subsidiaryId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'company_subsidiaries',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'subsidiary_id',
            comment: 'Optional: specific subsidiary if mode is parent_only but targeted at a subsidiary'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'start_date'
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'end_date'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        },
        status: {
            type: DataTypes.ENUM('active', 'suspended', 'inactive', 'expired'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status',
            comment: 'Subscription status: active, suspended, inactive, expired'
        }
    }, {
        tableName: 'subscriptions',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['company_id']
            },
            {
                fields: ['code']
            },
            {
                fields: ['subsidiary_id']
            },
            {
                fields: ['start_date', 'end_date']
            }
        ]
    });

    return Subscription;
};
