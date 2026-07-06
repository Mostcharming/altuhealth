'use strict';

const { sequelize } = require('../../database');
const { Op } = require('sequelize');

/**
 * Service for managing referrer earnings from retail enrollee subscriptions
 */
class ReferrerEarningsService {
    /**
     * Calculate and create referrer earnings when a subscription is made
     * @param {Object} subscriptionData - The subscription data
     * @param {Object} models - Sequelize models
     * @returns {Promise<Object>} The created earning record
     */
    static async createEarningFromSubscription(subscriptionData, models) {
        const {
            ReferrerEarning,
            RetailEnrollee,
            ReferralProgram,
            Referrer
        } = models;

        const {
            retailEnrolleeId,
            subscriptionId,
            subscriptionAmount,
            currency = 'NGN'
        } = subscriptionData;

        try {
            // Get the retail enrollee to find the referral code
            const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
            if (!enrollee || !enrollee.referralCode) {
                return null; // No referral code, no earnings
            }

            // Find the referrer with this referral code
            const referrer = await Referrer.findOne({
                where: {
                    referralCode: enrollee.referralCode,
                    isDeleted: false
                }
            });

            if (!referrer) {
                console.warn(`Referrer not found for referral code: ${enrollee.referralCode}`);
                return null;
            }

            // Get the active referral program
            const referralProgram = await ReferralProgram.findOne({
                where: {
                    status: 'active',
                    isDeleted: false,
                    startDate: { [Op.lte]: new Date() },
                    [Op.or]: [
                        { endDate: null },
                        { endDate: { [Op.gte]: new Date() } }
                    ]
                }
            });

            if (!referralProgram) {
                console.warn('No active referral program found');
                return null;
            }

            // Calculate earned amount
            let earnedAmount = 0;
            let rewardRate = 0;

            if (referralProgram.rewardType === 'fixed') {
                earnedAmount = parseFloat(referralProgram.fixedRate) || 0;
                rewardRate = parseFloat(referralProgram.fixedRate) || 0;
            } else if (referralProgram.rewardType === 'percentage') {
                rewardRate = parseFloat(referralProgram.percentageRate) || 0;
                earnedAmount = (parseFloat(subscriptionAmount) * rewardRate) / 100;
            }

            // Apply cap if exists
            if (referralProgram.capAmount && earnedAmount > referralProgram.capAmount) {
                earnedAmount = parseFloat(referralProgram.capAmount);
            }

            // Create earning record
            const earning = await ReferrerEarning.create({
                referrerId: referrer.id,
                retailEnrolleeId,
                retailEnrolleeSubscriptionId: subscriptionId,
                referralProgramId: referralProgram.id,
                subscriptionAmount: parseFloat(subscriptionAmount),
                rewardType: referralProgram.rewardType,
                rewardRate,
                earnedAmount,
                currency,
                status: 'pending', // Will be confirmed after subscription is active
                isWithdrawn: false
            });

            // Update referrer's total earning and available balance
            await referrer.update({
                totalEarning: sequelize.where(
                    sequelize.fn('CAST', sequelize.col('total_earning'), 'DECIMAL'),
                    Op.plus,
                    earnedAmount
                ),
                availableBalance: sequelize.where(
                    sequelize.fn('CAST', sequelize.col('available_balance'), 'DECIMAL'),
                    Op.plus,
                    earnedAmount
                )
            });

            // Reload to get updated values
            await referrer.reload();

            return {
                earning: earning.toJSON(),
                referrer: referrer.toJSON()
            };
        } catch (error) {
            console.error('Error creating referrer earning:', error);
            throw error;
        }
    }

    /**
     * Confirm pending earnings (called when subscription is confirmed)
     * @param {string} subscriptionId - The subscription ID
     * @param {Object} models - Sequelize models
     * @returns {Promise<Object>} Updated earning record
     */
    static async confirmEarning(subscriptionId, models) {
        const { ReferrerEarning } = models;

        const earning = await ReferrerEarning.findOne({
            where: {
                retailEnrolleeSubscriptionId: subscriptionId,
                status: 'pending'
            }
        });

        if (earning) {
            await earning.update({ status: 'confirmed' });
        }

        return earning;
    }

    /**
     * Mark earnings as withdrawn
     * @param {string[]} earningIds - Array of earning IDs to mark as withdrawn
     * @param {Object} models - Sequelize models
     * @returns {Promise<void>}
     */
    static async markAsWithdrawn(earningIds, models) {
        const { ReferrerEarning, Referrer } = models;

        const earnings = await ReferrerEarning.findAll({
            where: {
                id: { [Op.in]: earningIds }
            }
        });

        for (const earning of earnings) {
            await earning.update({
                status: 'withdrawn',
                isWithdrawn: true,
                withdrawnAt: new Date()
            });

            // Update referrer's available balance
            const referrer = await Referrer.findByPk(earning.referrerId);
            if (referrer) {
                const newBalance = parseFloat(referrer.availableBalance) - parseFloat(earning.earnedAmount);
                const totalWithdrawn = parseFloat(referrer.totalWithdrawn) + parseFloat(earning.earnedAmount);

                await referrer.update({
                    availableBalance: Math.max(0, newBalance),
                    totalWithdrawn
                });
            }
        }
    }

    /**
     * Get referrer summary statistics
     * @param {string} referrerId - The referrer ID
     * @param {Object} models - Sequelize models
     * @returns {Promise<Object>} Summary statistics
     */
    static async getReferrerSummary(referrerId, models) {
        const { ReferrerEarning, sequelize } = models;

        const summary = await ReferrerEarning.findAll({
            where: { referrerId },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('earned_amount')), 'totalEarned'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'confirmed' THEN earned_amount ELSE 0 END")), 'confirmedEarnings'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'pending' THEN earned_amount ELSE 0 END")), 'pendingEarnings'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_withdrawn = false THEN 1 END")), 'pendingWithdrawals'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_withdrawn = true THEN 1 END")), 'totalWithdrawn']
            ],
            raw: true
        });

        return summary[0] || {
            totalEarned: 0,
            confirmedEarnings: 0,
            pendingEarnings: 0,
            pendingWithdrawals: 0,
            totalWithdrawn: 0
        };
    }
}

module.exports = ReferrerEarningsService;
