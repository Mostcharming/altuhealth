'use strict';

const { fn, col, literal } = require('sequelize');

const ensureReferrer = async (req, res) => {
    const referrerId = req.user && req.user.id;
    if (!referrerId || req.user.type !== 'Referrer') {
        res.fail('Referrer authentication required', 403);
        return null;
    }

    const referrer = await req.models.Referrer.findOne({
        where: {
            id: referrerId,
            isDeleted: false
        }
    });

    if (!referrer) {
        res.fail('Referrer not found', 404);
        return null;
    }

    return referrer;
};

const getDashboard = async (req, res, next) => {
    try {
        const referrer = await ensureReferrer(req, res);
        if (!referrer) return;

        const { ReferrerEarning, RetailEnrollee, RetailEnrolleeSubscription, Plan } = req.models;
        const { page = 1, limit = 10, status = '' } = req.query;
        const numericPage = parseInt(page, 10) || 1;
        const numericLimit = parseInt(limit, 10) || 10;
        const offset = (numericPage - 1) * numericLimit;

        const earningWhere = { referrerId: referrer.id };
        if (status) earningWhere.status = status;

        const [summaryRows, earningsResult] = await Promise.all([
            ReferrerEarning.findAll({
                where: { referrerId: referrer.id },
                raw: true,
                attributes: [
                    [fn('COUNT', col('id')), 'totalReferrals'],
                    [fn('SUM', col('earned_amount')), 'totalEarned'],
                    [fn('SUM', literal("CASE WHEN status = 'confirmed' THEN earned_amount ELSE 0 END")), 'confirmedEarnings'],
                    [fn('SUM', literal("CASE WHEN status = 'pending' THEN earned_amount ELSE 0 END")), 'pendingEarnings']
                ]
            }),
            ReferrerEarning.findAndCountAll({
                where: earningWhere,
                include: [
                    {
                        model: RetailEnrollee,
                        as: 'retailEnrollee',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber']
                    },
                    {
                        model: RetailEnrolleeSubscription,
                        as: 'subscription',
                        attributes: ['id', 'subscriptionStartDate', 'subscriptionEndDate', 'status'],
                        include: [
                            {
                                model: Plan,
                                as: 'plan',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                limit: numericLimit,
                offset,
                order: [['createdAt', 'DESC']]
            })
        ]);

        const summary = summaryRows[0] || {};
        const totalPages = Math.ceil(earningsResult.count / numericLimit);

        return res.success({
            referrer: {
                id: referrer.id,
                firstName: referrer.firstName,
                lastName: referrer.lastName,
                email: referrer.email,
                phoneNumber: referrer.phoneNumber,
                referralCode: referrer.referralCode,
                status: referrer.status,
                bankName: referrer.bankName,
                accountName: referrer.accountName,
                accountNumber: referrer.accountNumber,
                totalEarning: parseFloat(referrer.totalEarning || 0),
                availableBalance: parseFloat(referrer.availableBalance || 0),
                totalWithdrawn: parseFloat(referrer.totalWithdrawn || 0),
                picture: referrer.picture || null
            },
            summary: {
                totalReferrals: parseInt(summary.totalReferrals || 0, 10),
                totalEarned: parseFloat(summary.totalEarned || 0),
                confirmedEarnings: parseFloat(summary.confirmedEarnings || 0),
                pendingEarnings: parseFloat(summary.pendingEarnings || 0)
            },
            earnings: earningsResult.rows.map((earning) => ({
                id: earning.id,
                referredUser: earning.retailEnrollee ? {
                    id: earning.retailEnrollee.id,
                    name: `${earning.retailEnrollee.firstName} ${earning.retailEnrollee.lastName}`,
                    email: earning.retailEnrollee.email,
                    phoneNumber: earning.retailEnrollee.phoneNumber,
                    policyNumber: earning.retailEnrollee.policyNumber
                } : null,
                subscriptionAmount: parseFloat(earning.subscriptionAmount || 0),
                earnedAmount: parseFloat(earning.earnedAmount || 0),
                rewardType: earning.rewardType,
                rewardRate: parseFloat(earning.rewardRate || 0),
                currency: earning.currency,
                status: earning.status,
                isWithdrawn: earning.isWithdrawn,
                plan: earning.subscription && earning.subscription.plan ? earning.subscription.plan : null,
                subscriptionPeriod: earning.subscription ? {
                    start: earning.subscription.subscriptionStartDate,
                    end: earning.subscription.subscriptionEndDate
                } : null,
                createdAt: earning.createdAt
            })),
            pagination: {
                total: earningsResult.count,
                page: numericPage,
                limit: numericLimit,
                totalPages,
                hasNextPage: numericPage < totalPages,
                hasPreviousPage: numericPage > 1
            }
        }, 'Referrer dashboard fetched successfully');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getDashboard
};
