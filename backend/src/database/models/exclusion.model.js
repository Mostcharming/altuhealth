'use strict';

module.exports = (sequelize, DataTypes) => {
    const Exclusion = sequelize.define('Exclusion', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'description'
        }
    }, {
        tableName: 'exclusions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Exclusion;
};
