'use strict';

module.exports = (sequelize, DataTypes) => {
    const AuthorizationCode = sequelize.define('AuthorizationCode', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        authorizationCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'authorization_code'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'enrollee_id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'providers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'provider_id'
        },
        diagnosisId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'diagnoses',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'diagnosis_id'
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'reason'
        },
        authorizationType: {
            type: DataTypes.ENUM('inpatient', 'outpatient', 'procedure', 'medication', 'diagnostic'),
            allowNull: false,
            field: 'authorization_type'
        },
        validFrom: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'valid_from'
        },
        validTo: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'valid_to'
        },
        amountAuthorized: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'amount_authorized'
        },
        isUsed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_used'
        },
        usedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'used_at'
        },
        usedAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'used_amount'
        },
        status: {
            type: DataTypes.ENUM('active', 'used', 'expired', 'cancelled', 'pending'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'authorization_codes',
        timestamps: true,
        underscored: true
    });

    return AuthorizationCode;
};
