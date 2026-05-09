'use strict';

module.exports = (sequelize, DataTypes) => {
    const License = sequelize.define('License', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'expires_at'
        },
        isLifetime: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_lifetime'
        }
    }, {
        tableName: 'license',
        timestamps: true,
        underscored: true
    });

    return License;
};
