'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProviderSpecialization = sequelize.define('ProviderSpecialization', {
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
        }
    }, {
        tableName: 'provider_specializations',
        timestamps: true,
        underscored: true
    });

    return ProviderSpecialization;
};
