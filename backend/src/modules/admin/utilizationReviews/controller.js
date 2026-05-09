'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createUtilizationReview(req, res, next) {
    try {
        const { UtilizationReview, Company, CompanyPlan } = req.models;
        const {
            companyId,
            companyPlanId,
            policyPeriodStartDate,
            policyPeriodEndDate,
            quarter,
            totalEnrollees,
            totalDependents,
            totalClaimAmount,
            utilizationRate,
            topUtilizedServices,
            topProviders,
            excludedServiceAttempts,
        } = req.body || {};

        // Validation
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!companyPlanId) return res.fail('`companyPlanId` is required', 400);
        if (!policyPeriodStartDate) return res.fail('`policyPeriodStartDate` is required', 400);
        if (!policyPeriodEndDate) return res.fail('`policyPeriodEndDate` is required', 400);
        if (!quarter) return res.fail('`quarter` is required', 400);

        // Verify company exists
        const company = await Company.findByPk(companyId);
        if (!company) return res.fail('Company not found', 404);

        // Verify company plan exists
        const companyPlan = await CompanyPlan.findByPk(companyPlanId);
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        const review = await UtilizationReview.create({
            companyId,
            companyPlanId,
            policyPeriodStartDate,
            policyPeriodEndDate,
            quarter,
            totalEnrollees: totalEnrollees || 0,
            totalDependents: totalDependents || 0,
            totalClaimAmount: totalClaimAmount || 0,
            utilizationRate: utilizationRate || 0,
            topUtilizedServices: topUtilizedServices || [],
            topProviders: topProviders || [],
            excludedServiceAttempts: excludedServiceAttempts || 0,
            status: 'draft',
        });

        await addAuditLog(req.models, {
            action: 'utilization_review.create',
            message: `Utilization Review created for ${company.name} - ${quarter}`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { reviewId: review.id, companyId },
        });

        return res.success({ review: review.toJSON() }, 'Utilization Review created', 201);
    } catch (err) {
        return next(err);
    }
}

async function listUtilizationReviews(req, res, next) {
    try {
        const { UtilizationReview, Company, CompanyPlan } = req.models;
        const { page = 1, limit = 10, companyId, status, quarter } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (companyId) where.companyId = companyId;
        if (status) where.status = status;
        if (quarter) where.quarter = quarter;

        const { count, rows } = await UtilizationReview.findAndCountAll({
            where,
            include: [
                { model: Company, attributes: ['id', 'name', 'email'] },
                { model: CompanyPlan, attributes: ['id', 'name'] },
            ],
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']],
        });

        return res.success(
            {
                reviews: rows.map((r) => r.toJSON()),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit),
                },
            },
            'Utilization Reviews fetched'
        );
    } catch (err) {
        return next(err);
    }
}

async function getUtilizationReview(req, res, next) {
    try {
        const { UtilizationReview, Company, CompanyPlan } = req.models;
        const { id } = req.params;

        const review = await UtilizationReview.findByPk(id, {
            include: [
                { model: Company, attributes: ['id', 'name', 'email', 'phoneNumber'] },
                { model: CompanyPlan, attributes: ['id', 'name'] },
            ],
        });

        if (!review) return res.fail('Utilization Review not found', 404);

        return res.success({ review: review.toJSON() }, 'Utilization Review fetched');
    } catch (err) {
        return next(err);
    }
}

async function updateUtilizationReview(req, res, next) {
    try {
        const { UtilizationReview } = req.models;
        const { id } = req.params;
        const {
            policyPeriodStartDate,
            policyPeriodEndDate,
            quarter,
            totalEnrollees,
            totalDependents,
            totalClaimAmount,
            utilizationRate,
            topUtilizedServices,
            topProviders,
            excludedServiceAttempts,
        } = req.body || {};

        const review = await UtilizationReview.findByPk(id);
        if (!review) return res.fail('Utilization Review not found', 404);

        // Only allow updates if status is draft
        if (review.status !== 'draft') {
            return res.fail('Can only update reviews with draft status', 400);
        }

        const updates = {};
        if (policyPeriodStartDate !== undefined) updates.policyPeriodStartDate = policyPeriodStartDate;
        if (policyPeriodEndDate !== undefined) updates.policyPeriodEndDate = policyPeriodEndDate;
        if (quarter !== undefined) updates.quarter = quarter;
        if (totalEnrollees !== undefined) updates.totalEnrollees = totalEnrollees;
        if (totalDependents !== undefined) updates.totalDependents = totalDependents;
        if (totalClaimAmount !== undefined) updates.totalClaimAmount = totalClaimAmount;
        if (utilizationRate !== undefined) updates.utilizationRate = utilizationRate;
        if (topUtilizedServices !== undefined) updates.topUtilizedServices = topUtilizedServices;
        if (topProviders !== undefined) updates.topProviders = topProviders;
        if (excludedServiceAttempts !== undefined) updates.excludedServiceAttempts = excludedServiceAttempts;

        await review.update(updates);

        await addAuditLog(req.models, {
            action: 'utilization_review.update',
            message: `Utilization Review ${id} updated`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { reviewId: id },
        });

        return res.success({ review: review.toJSON() }, 'Utilization Review updated');
    } catch (err) {
        return next(err);
    }
}

async function submitUtilizationReview(req, res, next) {
    try {
        const { UtilizationReview } = req.models;
        const { id } = req.params;

        const review = await UtilizationReview.findByPk(id);
        if (!review) return res.fail('Utilization Review not found', 404);

        if (review.status !== 'draft') {
            return res.fail('Review is not in draft status', 400);
        }

        await review.update({ status: 'completed' });

        await addAuditLog(req.models, {
            action: 'utilization_review.submit',
            message: `Utilization Review ${id} submitted`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { reviewId: id },
        });

        return res.success({ review: review.toJSON() }, 'Utilization Review submitted');
    } catch (err) {
        return next(err);
    }
}

async function approveUtilizationReview(req, res, next) {
    try {
        const { UtilizationReview } = req.models;
        const { id } = req.params;

        const review = await UtilizationReview.findByPk(id);
        if (!review) return res.fail('Utilization Review not found', 404);

        if (review.status !== 'completed') {
            return res.fail('Review must be completed before approval', 400);
        }

        await review.update({ status: 'approved' });

        await addAuditLog(req.models, {
            action: 'utilization_review.approve',
            message: `Utilization Review ${id} approved`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { reviewId: id },
        });

        return res.success({ review: review.toJSON() }, 'Utilization Review approved');
    } catch (err) {
        return next(err);
    }
}

async function deleteUtilizationReview(req, res, next) {
    try {
        const { UtilizationReview } = req.models;
        const { id } = req.params;

        const review = await UtilizationReview.findByPk(id);
        if (!review) return res.fail('Utilization Review not found', 404);

        if (review.status !== 'draft') {
            return res.fail('Can only delete reviews with draft status', 400);
        }

        await review.destroy();

        await addAuditLog(req.models, {
            action: 'utilization_review.delete',
            message: `Utilization Review ${id} deleted`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { reviewId: id },
        });

        return res.success({}, 'Utilization Review deleted');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createUtilizationReview,
    listUtilizationReviews,
    getUtilizationReview,
    updateUtilizationReview,
    submitUtilizationReview,
    approveUtilizationReview,
    deleteUtilizationReview,
};
