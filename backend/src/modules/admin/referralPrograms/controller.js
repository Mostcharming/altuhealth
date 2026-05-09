'use strict';

const { Op } = require('sequelize');

class ReferralProgramsController {
    // Create a new referral program
    static async createReferralProgram(req, res, next) {
        const { ReferralProgram } = req.models;
        try {
            const {
                name,
                description,
                status,
                rewardType,
                fixedRate,
                percentageRate,
                capAmount,
                minimumPayout,
                startDate,
                endDate,
                maxReferralsPerReferrer,
                maxTotalPayout,
                picture
            } = req.body;

            // Validate required fields
            if (!name || !rewardType || !startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'name, rewardType, and startDate are required'
                });
            }

            // Validate reward configuration
            if (rewardType === 'fixed' && !fixedRate) {
                return res.status(400).json({
                    success: false,
                    message: 'fixedRate is required for fixed reward type'
                });
            }

            if (rewardType === 'percentage' && !percentageRate) {
                return res.status(400).json({
                    success: false,
                    message: 'percentageRate is required for percentage reward type'
                });
            }

            const program = await ReferralProgram.create({
                name,
                description,
                status: status || 'active',
                rewardType,
                fixedRate: rewardType === 'fixed' ? fixedRate : null,
                percentageRate: rewardType === 'percentage' ? percentageRate : null,
                capAmount,
                minimumPayout: minimumPayout || 0,
                startDate,
                endDate,
                maxReferralsPerReferrer,
                maxTotalPayout,
                picture
            });

            res.status(201).json({
                success: true,
                message: 'Referral program created successfully',
                data: program
            });
        } catch (error) {
            next(error);
        }
    }

    // List all referral programs with pagination
    static async listReferralPrograms(req, res, next) {
        try {
            const { ReferralProgram } = req.models;
            const { page = 1, limit = 10, q = '', status = '' } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = { isDeleted: false };

            if (q) {
                whereClause[Op.or] = [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } }
                ];
            }

            if (status) {
                whereClause.status = status;
            }

            const { count, rows } = await ReferralProgram.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                success: true,
                data: {
                    programs: rows,
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

    // Get a single referral program
    static async getReferralProgram(req, res, next) {
        try {
            const { ReferralProgram } = req.models;
            const { id } = req.params;

            const program = await ReferralProgram.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Referral program not found'
                });
            }

            res.status(200).json({
                success: true,
                data: program
            });
        } catch (error) {
            next(error);
        }
    }

    // Update a referral program
    static async updateReferralProgram(req, res, next) {
        try {
            const { ReferralProgram } = req.models;
            const { id } = req.params;
            const {
                name,
                description,
                status,
                rewardType,
                fixedRate,
                percentageRate,
                capAmount,
                minimumPayout,
                startDate,
                endDate,
                maxReferralsPerReferrer,
                maxTotalPayout,
                picture
            } = req.body;

            const program = await ReferralProgram.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Referral program not found'
                });
            }

            // Update fields if provided
            if (name) program.name = name;
            if (description) program.description = description;
            if (status) program.status = status;
            if (rewardType) program.rewardType = rewardType;
            if (fixedRate) program.fixedRate = fixedRate;
            if (percentageRate) program.percentageRate = percentageRate;
            if (capAmount) program.capAmount = capAmount;
            if (minimumPayout !== undefined) program.minimumPayout = minimumPayout;
            if (startDate) program.startDate = startDate;
            if (endDate) program.endDate = endDate;
            if (maxReferralsPerReferrer) program.maxReferralsPerReferrer = maxReferralsPerReferrer;
            if (maxTotalPayout) program.maxTotalPayout = maxTotalPayout;
            if (picture) program.picture = picture;

            await program.save();

            res.status(200).json({
                success: true,
                message: 'Referral program updated successfully',
                data: program
            });
        } catch (error) {
            next(error);
        }
    }

    // Soft delete a referral program
    static async deleteReferralProgram(req, res, next) {
        try {
            const { ReferralProgram } = req.models;
            const { id } = req.params;

            const program = await ReferralProgram.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Referral program not found'
                });
            }

            program.isDeleted = true;
            await program.save();

            res.status(200).json({
                success: true,
                message: 'Referral program deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Update program status
    static async updateProgramStatus(req, res, next) {
        try {
            const { ReferralProgram } = req.models;
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'inactive', 'paused'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be active, inactive, or paused'
                });
            }

            const program = await ReferralProgram.findByPk(id, {
                where: { isDeleted: false }
            });

            if (!program) {
                return res.status(404).json({
                    success: false,
                    message: 'Referral program not found'
                });
            }

            program.status = status;
            await program.save();

            res.status(200).json({
                success: true,
                message: 'Program status updated successfully',
                data: program
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReferralProgramsController;
