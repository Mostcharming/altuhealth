'use strict';

const { Op } = require('sequelize');

async function listPublicPlans(req, res, next) {
    try {
        const { Plan } = req.models;

        const plans = await Plan.findAll({
            attributes: [
                'id',
                'name',
                'code',
                'description',
                'annualPremiumPrice',
                'currency',
                'planCycle',
                'allowDependentEnrolee',
                'ageLimit',
                'dependentAgeLimit',
                'maxNumberOfDependents'
            ],
            where: {
                isActive: true,
                isApproved: true,
                status: { [Op.in]: ['approved', 'active'] }
            },
            order: [['name', 'ASC']]
        });

        return res.success({ list: plans.map(plan => plan.toJSON()) }, 'Plans fetched');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listPublicPlans
};
