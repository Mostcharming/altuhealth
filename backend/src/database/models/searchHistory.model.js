'use strict';

module.exports = (sequelize, DataTypes) => {
    const SearchHistory = sequelize.define('SearchHistory', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'providers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'provider_id',
            comment: 'Provider who performed the search'
        },
        searchTerm: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'search_term',
            comment: 'The search term (email or policy number)'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'search_histories',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['provider_id']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['search_term']
            }
        ]
    });

    return SearchHistory;
};
