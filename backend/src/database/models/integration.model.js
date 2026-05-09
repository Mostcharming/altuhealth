'use strict';

module.exports = (sequelize, DataTypes) => {
    const Integration = sequelize.define('Integration', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        base_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        secret_key: {
            type: DataTypes.STRING,
            allowNull: true
        },
        public_key: {
            type: DataTypes.STRING,
            allowNull: true
        },
        api_key: {
            type: DataTypes.STRING,
            allowNull: true
        },
        api_secret: {
            type: DataTypes.STRING,
            allowNull: true
        },
        webhook_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        webhook_secret: {
            type: DataTypes.STRING,
            allowNull: true
        },
        additional_config: {
            type: DataTypes.JSON,
            allowNull: true
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        tableName: 'integrations',
        timestamps: false
    });

    return Integration;
};