'use strict';

module.exports = (sequelize, DataTypes) => {
    const PeriodTracker = sequelize.define('PeriodTracker', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            field: 'enrollee_id'
        },
        lastPeriodDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'last_period_date'
        },
        cycleLength: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 28,
            comment: 'Average menstrual cycle length in days',
            field: 'cycle_length'
        },
        periodDuration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            comment: 'Average period duration in days',
            field: 'period_duration'
        },
        nextPeriodDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Predicted next period start date',
            field: 'next_period_date'
        },
        nextFertileWindowStart: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Predicted fertile window start date',
            field: 'next_fertile_window_start'
        },
        nextFertileWindowEnd: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Predicted fertile window end date',
            field: 'next_fertile_window_end'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'period_trackers',
        timestamps: true,
        underscored: true
    });

    PeriodTracker.associate = function (models) {
        PeriodTracker.belongsTo(models.Enrollee, {
            foreignKey: 'enrolleeId',
            as: 'enrollee'
        });
    };

    return PeriodTracker;
};
