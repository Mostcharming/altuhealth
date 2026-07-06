'use strict';

module.exports = (sequelize, DataTypes) => {
    const Diagnosis = sequelize.define('Diagnosis', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },


        severity: {
            type: DataTypes.ENUM('mild', 'moderate', 'severe', 'critical'),
            allowNull: true,
            field: 'severity'
        },

        symptoms: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'symptoms',
            comment: 'Common symptoms associated with this diagnosis'
        },
        treatment: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'treatment',
            comment: 'General treatment guidelines'
        },
        isChronicCondition: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_chronic_condition'
        },

    }, {
        tableName: 'diagnoses',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['name']
            },


        ]
    });

    return Diagnosis;
};
