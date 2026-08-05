'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('PharmacyRequestItem', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        pharmacyRequestId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'pharmacy_request_id'
        },
        drugName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'drug_name'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unitPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'unit_price'
        },
        lineTotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'line_total'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'pharmacy_request_items',
        timestamps: true,
        underscored: true
    });
};
