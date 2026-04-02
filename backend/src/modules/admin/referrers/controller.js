'use strict';

const { Op } = require('sequelize');

class ReferrersController {
    // Create a new referrer
    static async createReferrer(req, res, next) {
        try {
            const { Referrer } = req.models
            const { firstName, lastName, phoneNumber, email, referralCode, status, bankName, accountName, accountNumber } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !phoneNumber || !referralCode) {
                return res.status(400).json({
                    success: false,
                    message: 'firstName, lastName, phoneNumber, and referralCode are required'
                });
            }

            const referrer = await Referrer.create({
                firstName,
                lastName,
                phoneNumber,
                email,
                referralCode,
                status: status || 'active',
                bankName,
                accountName,
                accountNumber
            });

            res.status(201).json({
                success: true,
                message: 'Referrer created successfully',
                data: referrer
            });
        } catch (error) {
            next(error);
        }
    }

    // List all referrers with pagination
    static async listReferrers(req, res, next) {
        try {
            const { Referrer } = req.models;
            const { page = 1, limit = 10, q = '', status = '' } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = { isDeleted: false };

            if (q) {
                whereClause[Op.or] = [
                    { firstName: { [Op.iLike]: `%${q}%` } },
                    { lastName: { [Op.iLike]: `%${q}%` } },
                    { email: { [Op.iLike]: `%${q}%` } },
                    { phoneNumber: { [Op.iLike]: `%${q}%` } },
                    { referralCode: { [Op.iLike]: `%${q}%` } }
                ];
            }

            if (status) {
                whereClause.status = status;
            }

            const { count, rows } = await Referrer.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                success: true,
                data: {
                    referrers: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get a single referrer
    static async getReferrer(req, res, next) {
        try {
            const { id } = req.params;
            const { Referrer } = req.models

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            res.status(200).json({
                success: true,
                data: referrer
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single referrer details with earnings
    static async getSingleReferrerDetails(req, res, next) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10, status = '' } = req.query;
            const offset = (page - 1) * limit;

            const { Referrer, ReferrerEarning, RetailEnrollee, RetailEnrolleeSubscription, Plan } = req.models;

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            // Build where clause for earnings filter
            const earningsWhere = { referrerId: id };
            if (status) {
                earningsWhere.status = status;
            }

            // Get paginated earnings with related data
            const { count, rows: earnings } = await ReferrerEarning.findAndCountAll({
                where: earningsWhere,
                include: [
                    {
                        model: RetailEnrollee,
                        as: 'retailEnrollee',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
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
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(count / limit);

            // Calculate summary statistics
            const summary = await ReferrerEarning.findAll({
                where: { referrerId: id },
                raw: true,
                attributes: [
                    [require('sequelize').fn('SUM', require('sequelize').col('earned_amount')), 'totalEarned'],
                    [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN status = \'confirmed\' THEN earned_amount ELSE 0 END')), 'confirmedEarnings'],
                    [require('sequelize').fn('COUNT', require('sequelize').fn('CASE WHEN is_withdrawn = false THEN 1 END')), 'pendingWithdrawals']
                ]
            });

            res.status(200).json({
                success: true,
                data: {
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
                        totalEarning: parseFloat(referrer.totalEarning),
                        availableBalance: parseFloat(referrer.availableBalance),
                        totalWithdrawn: parseFloat(referrer.totalWithdrawn),
                        picture: referrer.picture,
                        createdAt: referrer.createdAt
                    },
                    summary: {
                        totalEarned: parseFloat(summary[0]?.totalEarned || 0),
                        confirmedEarnings: parseFloat(summary[0]?.confirmedEarnings || 0),
                        pendingWithdrawals: summary[0]?.pendingWithdrawals || 0
                    },
                    earnings: earnings.map(earning => ({
                        id: earning.id,
                        retailEnrollee: {
                            id: earning.retailEnrollee.id,
                            name: `${earning.retailEnrollee.firstName} ${earning.retailEnrollee.lastName}`,
                            email: earning.retailEnrollee.email,
                            phoneNumber: earning.retailEnrollee.phoneNumber
                        },
                        subscriptionAmount: parseFloat(earning.subscriptionAmount),
                        rewardType: earning.rewardType,
                        rewardRate: parseFloat(earning.rewardRate),
                        earnedAmount: parseFloat(earning.earnedAmount),
                        currency: earning.currency,
                        status: earning.status,
                        isWithdrawn: earning.isWithdrawn,
                        withdrawnAt: earning.withdrawnAt,
                        plan: earning.subscription.plan,
                        subscriptionPeriod: {
                            start: earning.subscription.subscriptionStartDate,
                            end: earning.subscription.subscriptionEndDate
                        },
                        createdAt: earning.createdAt
                    })),
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Update a referrer
    static async updateReferrer(req, res, next) {
        try {
            const { Referrer } = req.models

            const { id } = req.params;
            const { firstName, lastName, phoneNumber, email, referralCode, status, bankName, accountName, accountNumber, picture } = req.body;

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            // Update fields if provided
            if (firstName) referrer.firstName = firstName;
            if (lastName) referrer.lastName = lastName;
            if (phoneNumber) referrer.phoneNumber = phoneNumber;
            if (email) referrer.email = email;
            if (referralCode) referrer.referralCode = referralCode;
            if (status) referrer.status = status;
            if (bankName) referrer.bankName = bankName;
            if (accountName) referrer.accountName = accountName;
            if (accountNumber) referrer.accountNumber = accountNumber;
            if (picture) referrer.picture = picture;

            await referrer.save();

            res.status(200).json({
                success: true,
                message: 'Referrer updated successfully',
                data: referrer
            });
        } catch (error) {
            next(error);
        }
    }

    // Soft delete a referrer
    static async deleteReferrer(req, res, next) {
        try {
            const { Referrer } = req.models

            const { id } = req.params;

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            referrer.isDeleted = true;
            await referrer.save();

            res.status(200).json({
                success: true,
                message: 'Referrer deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get referrer earnings
    static async getReferrerEarnings(req, res, next) {
        try {
            const { id } = req.params;
            const { Referrer } = req.models

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false },
                attributes: ['id', 'firstName', 'lastName', 'totalEarning', 'availableBalance', 'totalWithdrawn']
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    referrerId: referrer.id,
                    name: `${referrer.firstName} ${referrer.lastName}`,
                    totalEarning: referrer.totalEarning,
                    availableBalance: referrer.availableBalance,
                    totalWithdrawn: referrer.totalWithdrawn
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get referrer's referrals
    static async getReferrerReferrals(req, res, next) {
        try {
            const { Referrer, ReferrerEarning, RetailEnrollee, RetailEnrolleeSubscription, Plan } = req.models;

            const { id } = req.params;
            const { page = 1, limit = 10, status = '' } = req.query;
            const offset = (page - 1) * limit;

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            // Build where clause
            const where = { referrerId: id };
            if (status) {
                where.status = status;
            }

            const { count, rows } = await ReferrerEarning.findAndCountAll({
                where,
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
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                success: true,
                data: {
                    referrerId: id,
                    referrals: rows.map(earning => ({
                        id: earning.id,
                        retailEnrollee: {
                            id: earning.retailEnrollee.id,
                            name: `${earning.retailEnrollee.firstName} ${earning.retailEnrollee.lastName}`,
                            email: earning.retailEnrollee.email,
                            phoneNumber: earning.retailEnrollee.phoneNumber,
                            policyNumber: earning.retailEnrollee.policyNumber
                        },
                        subscriptionAmount: parseFloat(earning.subscriptionAmount),
                        earnedAmount: parseFloat(earning.earnedAmount),
                        rewardType: earning.rewardType,
                        rewardRate: parseFloat(earning.rewardRate),
                        currency: earning.currency,
                        status: earning.status,
                        isWithdrawn: earning.isWithdrawn,
                        plan: {
                            id: earning.subscription.plan.id,
                            name: earning.subscription.plan.name
                        },
                        subscriptionPeriod: {
                            start: earning.subscription.subscriptionStartDate,
                            end: earning.subscription.subscriptionEndDate
                        },
                        createdAt: earning.createdAt
                    })),
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Create withdraw request
    static async createWithdrawRequest(req, res, next) {
        try {
            const { Referrer } = req.models

            const { id } = req.params;
            const { amount } = req.body;

            const referrer = await Referrer.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!referrer) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid withdrawal amount'
                });
            }

            if (referrer.availableBalance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance for withdrawal'
                });
            }

            // TODO: Create WithdrawRequest model and implement withdrawal logic
            res.status(201).json({
                success: true,
                message: 'Withdrawal request created successfully',
                data: {
                    referrerId: id,
                    amount,
                    status: 'pending'
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReferrersController;
