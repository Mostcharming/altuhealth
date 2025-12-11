'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

/**
 * Create a new claim
 */
async function createClaim(req, res, next) {
    try {
        const { Claim, Provider, PaymentBatch, Admin, Enrollee, Staff } = req.models;
        const {
            providerId,
            numberOfEncounters,
            amountSubmitted,
            year,
            month,
            bankUsedForPayment,
            bankAccountNumber,
            accountName,
            description,
            attachmentUrl
        } = req.body || {};

        // Validate required fields
        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!numberOfEncounters) return res.fail('`numberOfEncounters` is required', 400);
        if (!amountSubmitted) return res.fail('`amountSubmitted` is required', 400);
        if (!year) return res.fail('`year` is required', 400);
        if (!month || month < 1 || month > 12) return res.fail('`month` must be between 1 and 12', 400);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Generate unique claim reference
        const claimReference = generateClaimReference();

        const claim = await Claim.create({
            providerId,
            numberOfEncounters,
            amountSubmitted,
            amountProcessed: 0,
            difference: 0,
            year,
            month,
            dateSubmitted: new Date(),
            bankUsedForPayment: bankUsedForPayment || null,
            bankAccountNumber: bankAccountNumber || null,
            accountName: accountName || null,
            paymentBatchId: null,
            submittedByType: req.user?.type || 'Admin',
            submittedById: req.user?.id || null,
            status: 'draft',
            claimReference,
            description: description || null,
            attachmentUrl: attachmentUrl || null
        });

        await addAuditLog(req.models, {
            action: 'claim.create',
            message: `Claim ${claimReference} created for provider ${provider.name}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id, providerId, claimReference }
        });

        return res.success(claim, 'Claim created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

/**
 * List all claims with pagination and filtering
 */
async function listClaims(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const { page = 1, limit = 20, status, providerId, year, month } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (providerId) where.providerId = providerId;
        if (year) where.year = parseInt(year);
        if (month) where.month = parseInt(month);

        const { count, rows } = await Claim.findAndCountAll({
            where,
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
                }
            ],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.success(
            {
                claims: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Claims retrieved successfully',
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get a single claim by ID
 */
async function getClaimById(req, res, next) {
    try {
        const { Claim, Provider, PaymentBatch, ClaimDetail, Enrollee, RetailEnrollee, Diagnosis, Company } = req.models;
        const { id } = req.params;

        const claim = await Claim.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber', 'category', 'address']
                },
                {
                    model: PaymentBatch,
                    attributes: ['id', 'title', 'status', 'paymentDate', 'dueDate'],
                    required: false
                },
                {
                    model: ClaimDetail,
                    as: 'claimDetails',
                    // attributes: ['id', 'claimId', 'enrolleeId', 'retailEnrolleeId', 'providerId', 'serviceDate', 'description', 'unitPrice', 'quantity', 'amountSubmitted', 'amountApproved', 'diagnosisId', 'companyId'],
                    include: [
                        {
                            model: Enrollee,
                            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                            required: false
                        },
                        {
                            model: RetailEnrollee,
                            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                            required: false
                        },
                        {
                            model: Provider,
                            attributes: ['id', 'name', 'code', 'email', 'category'],
                            required: false
                        },
                        {
                            model: Diagnosis,
                            attributes: ['id', 'name', 'description'],
                            required: false
                        },
                        {
                            model: Company,
                            attributes: ['id', 'name',],
                            required: false
                        }
                    ],
                    required: false
                }
            ]
        });

        if (!claim) return res.fail('Claim not found', 404);

        return res.success(claim, 'Claim retrieved successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Update claim details
 */
async function updateClaim(req, res, next) {
    try {
        const { Claim } = req.models;
        const { id } = req.params;
        const updates = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        // Prevent status changes via update endpoint
        delete updates.status;
        delete updates.submittedByType;
        delete updates.submittedById;

        await claim.update(updates);

        await addAuditLog(req.models, {
            action: 'claim.update',
            message: `Claim ${claim.claimReference} updated`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id }
        });

        return res.success(claim, 'Claim updated successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Delete a claim
 */
async function deleteClaim(req, res, next) {
    try {
        const { Claim } = req.models;
        const { id } = req.params;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (claim.status !== 'draft') {
            return res.fail('Only draft claims can be deleted', 400);
        }

        const claimReference = claim.claimReference;
        await claim.destroy();

        await addAuditLog(req.models, {
            action: 'claim.delete',
            message: `Claim ${claimReference} deleted`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: id }
        });

        return res.success(null, 'Claim deleted successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Submit a claim (change status from draft to submitted)
 */
async function submitClaim(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const { id } = req.params;
        const { notes } = req.body;

        const claim = await Claim.findByPk(id, { include: [Provider] });
        if (!claim) return res.fail('Claim not found', 404);

        if (claim.status !== 'draft') {
            return res.fail('Only draft claims can be submitted', 400);
        }

        await claim.update({
            status: 'submitted',
            vetterNotes: notes || null
        });

        // Create approval request
        try {
            await createAdminApproval(req.models, {
                model: 'Claim',
                modelId: claim.id,
                action: 'submit',
                details: {
                    claimReference: claim.claimReference,
                    providerId: claim.providerId,
                    providerName: claim.Provider?.name,
                    amountSubmitted: claim.amountSubmitted,
                    numberOfEncounters: claim.numberOfEncounters,
                    period: `${claim.month}/${claim.year}`
                },
                requestedBy: req.user?.id || null,
                requestedByType: req.user?.type || 'Admin',
                comments: `Claim ${claim.claimReference} submitted for review`
            });
        } catch (approvalErr) {
            console.warn('Failed to create approval for claim submission:', approvalErr.message);
        }

        await addAuditLog(req.models, {
            action: 'claim.submit',
            message: `Claim ${claim.claimReference} submitted for review`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id, providerId: claim.providerId }
        });

        return res.success(claim, 'Claim submitted successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Vet a claim (move to pending_vetting status)
 */
async function vetClaim(req, res, next) {
    try {
        const { Claim } = req.models;
        const { id } = req.params;
        const { vetterNotes } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (claim.status !== 'submitted') {
            return res.fail('Only submitted claims can be vetted', 400);
        }

        await claim.update({
            status: 'pending_vetting',
            vetterNotes: vetterNotes || claim.vetterNotes
        });

        await addAuditLog(req.models, {
            action: 'claim.vet',
            message: `Claim ${claim.claimReference} marked as pending vetting`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id }
        });

        return res.success(claim, 'Claim moved to pending vetting', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Approve a claim
 */
async function approveClaim(req, res, next) {
    try {
        const { Claim } = req.models;
        const { id } = req.params;
        const { amountProcessed, vetterNotes } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (!['pending_vetting', 'under_review', 'queried'].includes(claim.status)) {
            return res.fail('Claim cannot be approved from current status', 400);
        }

        const processedAmount = amountProcessed || claim.amountSubmitted;
        const difference = claim.amountSubmitted - processedAmount;

        await claim.update({
            status: 'awaiting_payment',
            amountProcessed: processedAmount,
            difference,
            vetterNotes: vetterNotes || claim.vetterNotes
        });

        await addAuditLog(req.models, {
            action: 'claim.approve',
            message: `Claim ${claim.claimReference} approved - Amount: ${processedAmount}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id, amountProcessed: processedAmount }
        });

        return res.success(claim, 'Claim approved successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Reject a claim
 */
async function rejectClaim(req, res, next) {
    try {
        const { Claim } = req.models;
        const { id } = req.params;
        const { rejectionReason, vetterNotes } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (!['submitted', 'pending_vetting', 'under_review'].includes(claim.status)) {
            return res.fail('Claim cannot be rejected from current status', 400);
        }

        if (!rejectionReason) return res.fail('`rejectionReason` is required', 400);

        await claim.update({
            status: 'rejected',
            rejectionReason,
            vetterNotes: vetterNotes || claim.vetterNotes
        });

        await addAuditLog(req.models, {
            action: 'claim.reject',
            message: `Claim ${claim.claimReference} rejected - Reason: ${rejectionReason}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id, reason: rejectionReason }
        });

        return res.success(claim, 'Claim rejected successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Query a claim (raise concerns/questions)
 */
async function queryClaim(req, res, next) {
    try {
        const { Claim } = req.models;
        const { id } = req.params;
        const { vetterNotes } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (!['submitted', 'pending_vetting', 'under_review'].includes(claim.status)) {
            return res.fail('Claim cannot be queried from current status', 400);
        }

        if (!vetterNotes) return res.fail('`vetterNotes` with query details is required', 400);

        await claim.update({
            status: 'queried',
            vetterNotes
        });

        await addAuditLog(req.models, {
            action: 'claim.query',
            message: `Claim ${claim.claimReference} queried - Notes: ${vetterNotes}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id }
        });

        return res.success(claim, 'Claim queried successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Mark a claim as paid
 */
async function markClaimAsPaid(req, res, next) {
    try {
        const { Claim, PaymentBatch } = req.models;
        const { id } = req.params;
        const { paymentBatchId, datePaid, bankUsedForPayment, bankAccountNumber } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (claim.status !== 'awaiting_payment') {
            return res.fail('Only claims awaiting payment can be marked as paid', 400);
        }

        // Verify payment batch exists if provided
        if (paymentBatchId) {
            const batch = await PaymentBatch.findByPk(paymentBatchId);
            if (!batch) return res.fail('Payment Batch not found', 404);
        }

        await claim.update({
            status: 'paid',
            paymentBatchId: paymentBatchId || null,
            datePaid: datePaid || new Date(),
            bankUsedForPayment: bankUsedForPayment || claim.bankUsedForPayment,
            bankAccountNumber: bankAccountNumber || claim.bankAccountNumber
        });

        await addAuditLog(req.models, {
            action: 'claim.mark_paid',
            message: `Claim ${claim.claimReference} marked as paid`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id, paymentBatchId, datePaid }
        });

        return res.success(claim, 'Claim marked as paid successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Mark a claim as partially paid
 */
async function markClaimAsPartiallyPaid(req, res, next) {
    try {
        const { Claim, PaymentBatch } = req.models;
        const { id } = req.params;
        const { partialAmount, paymentBatchId, datePaid, bankUsedForPayment } = req.body;

        const claim = await Claim.findByPk(id);
        if (!claim) return res.fail('Claim not found', 404);

        if (!['awaiting_payment', 'partially_paid'].includes(claim.status)) {
            return res.fail('Claim cannot be partially paid from current status', 400);
        }

        if (!partialAmount || partialAmount <= 0) {
            return res.fail('`partialAmount` must be a positive number', 400);
        }

        if (partialAmount > claim.amountProcessed) {
            return res.fail('Partial amount cannot exceed processed amount', 400);
        }

        // Verify payment batch exists if provided
        if (paymentBatchId) {
            const batch = await PaymentBatch.findByPk(paymentBatchId);
            if (!batch) return res.fail('Payment Batch not found', 404);
        }

        await claim.update({
            status: 'partially_paid',
            paymentBatchId: paymentBatchId || null,
            datePaid: datePaid || new Date(),
            bankUsedForPayment: bankUsedForPayment || claim.bankUsedForPayment
        });

        await addAuditLog(req.models, {
            action: 'claim.mark_partially_paid',
            message: `Claim ${claim.claimReference} marked as partially paid - Amount: ${partialAmount}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId: claim.id, partialAmount }
        });

        return res.success(claim, 'Claim marked as partially paid successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims by provider
 */
async function getClaimsByProvider(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const { providerId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        const offset = (page - 1) * limit;
        const { count, rows } = await Claim.findAndCountAll({
            where: { providerId },
            include: [Provider],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.success(
            {
                claims: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Provider claims retrieved successfully',
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims by status
 */
async function getClaimsByStatus(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const { status } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const validStatuses = ['draft', 'submitted', 'pending_vetting', 'under_review', 'awaiting_payment', 'paid', 'rejected', 'partially_paid', 'queried'];
        if (!validStatuses.includes(status)) {
            return res.fail('Invalid status', 400);
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await Claim.findAndCountAll({
            where: { status },
            include: [Provider],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.success(
            {
                claims: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            `Claims with status '${status}' retrieved successfully`,
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims by period (year and month)
 */
async function getClaimsByPeriod(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const { year, month } = req.query;
        const { page = 1, limit = 20 } = req.query;

        if (!year || !month) {
            return res.fail('`year` and `month` are required', 400);
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await Claim.findAndCountAll({
            where: {
                year: parseInt(year),
                month: parseInt(month)
            },
            include: [Provider],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.success(
            {
                claims: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            `Claims for ${month}/${year} retrieved successfully`,
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims by submitter
 */
async function getClaimsBySubmitter(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const { submittedById } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;
        const { count, rows } = await Claim.findAndCountAll({
            where: { submittedById },
            include: [Provider],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.success(
            {
                claims: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Claims by submitter retrieved successfully',
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims summary/statistics
 */
async function getClaimsSummary(req, res, next) {
    try {
        const { Claim } = req.models;

        const totalClaims = await Claim.count();
        const totalAmountSubmitted = await Claim.sum('amountSubmitted');
        const totalAmountProcessed = await Claim.sum('amountProcessed');
        const totalDifference = await Claim.sum('difference');

        const statusBreakdown = await Claim.findAll({
            attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
            group: ['status'],
            raw: true
        });

        return res.success(
            {
                totalClaims,
                totalAmountSubmitted: totalAmountSubmitted || 0,
                totalAmountProcessed: totalAmountProcessed || 0,
                totalDifference: totalDifference || 0,
                statusBreakdown
            },
            'Claims summary retrieved successfully',
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims count by status
 */
async function getClaimsByStatusCount(req, res, next) {
    try {
        const { Claim } = req.models;

        const statusCounts = await Claim.findAll({
            attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
            group: ['status'],
            raw: true
        });

        return res.success(statusCounts, 'Claims count by status retrieved successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Get claims count by provider
 */
async function getClaimsByProviderCount(req, res, next) {
    try {
        const { Claim, Provider } = req.models;

        const providerCounts = await Claim.findAll({
            attributes: [
                'providerId',
                [require('sequelize').fn('COUNT', require('sequelize').col('Claim.id')), 'claimCount'],
                [require('sequelize').fn('SUM', require('sequelize').col('amountSubmitted')), 'totalSubmitted'],
                [require('sequelize').fn('SUM', require('sequelize').col('amountProcessed')), 'totalProcessed']
            ],
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code'],
                    required: true
                }
            ],
            group: ['Claim.providerId', 'Provider.id'],
            raw: true,
            subQuery: false
        });

        return res.success(providerCounts, 'Claims count by provider retrieved successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Get payment statistics
 */
async function getPaymentStatistics(req, res, next) {
    try {
        const { Claim } = req.models;

        const paidClaims = await Claim.count({ where: { status: 'paid' } });
        const partiallyPaidClaims = await Claim.count({ where: { status: 'partially_paid' } });
        const awaitingPayment = await Claim.count({ where: { status: 'awaiting_payment' } });
        const totalPaidAmount = await Claim.sum('amountProcessed', { where: { status: 'paid' } });
        const totalPartiallyPaidAmount = await Claim.sum('amountProcessed', { where: { status: 'partially_paid' } });
        const totalAwaitingAmount = await Claim.sum('amountProcessed', { where: { status: 'awaiting_payment' } });

        return res.success(
            {
                paidClaims: paidClaims || 0,
                partiallyPaidClaims: partiallyPaidClaims || 0,
                awaitingPayment: awaitingPayment || 0,
                totalPaidAmount: totalPaidAmount || 0,
                totalPartiallyPaidAmount: totalPartiallyPaidAmount || 0,
                totalAwaitingAmount: totalAwaitingAmount || 0,
                totalPendingPayment: (awaitingPayment || 0) + (partiallyPaidClaims || 0)
            },
            'Payment statistics retrieved successfully',
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * List all claim details for a specific claim
 */
async function listClaimDetails(req, res, next) {
    try {
        const { ClaimDetail, Claim, Enrollee, RetailEnrollee, Provider, Diagnosis, Company } = req.models;
        const { claimId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Verify claim exists
        const claim = await Claim.findByPk(claimId);
        if (!claim) return res.fail('Claim not found', 404);

        const offset = (page - 1) * limit;
        const { count, rows } = await ClaimDetail.findAndCountAll({
            where: { claimId },
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                    required: false
                },
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                    required: false
                },
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'category'],
                    required: false
                },
                {
                    model: Diagnosis,
                    attributes: ['id', 'name', 'code', 'description'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'code'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset,
            order: [['serviceDate', 'DESC']]
        });

        return res.success(
            {
                claimDetails: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Claim details retrieved successfully',
            200
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get a single claim detail by ID
 */
async function getClaimDetailById(req, res, next) {
    try {
        const { ClaimDetail, Claim, Enrollee, RetailEnrollee, Provider, Diagnosis, Company } = req.models;
        const { claimId, detailId } = req.params;

        // Verify claim exists
        const claim = await Claim.findByPk(claimId);
        if (!claim) return res.fail('Claim not found', 404);

        const claimDetail = await ClaimDetail.findByPk(detailId, {
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber', 'dateOfBirth'],
                    required: false
                },
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber', 'dateOfBirth'],
                    required: false
                },
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'category', 'address', 'phoneNumber'],
                    required: false
                },
                {
                    model: Diagnosis,
                    attributes: ['id', 'name', 'code', 'description'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'code', 'email'],
                    required: false
                }
            ]
        });

        if (!claimDetail) return res.fail('Claim detail not found', 404);

        // Verify the detail belongs to this claim
        if (claimDetail.claimId !== claimId) {
            return res.fail('Claim detail does not belong to this claim', 400);
        }

        return res.success(claimDetail, 'Claim detail retrieved successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Create a new claim detail (encounter)
 */
async function createClaimDetail(req, res, next) {
    try {
        const { ClaimDetail, Claim, Enrollee, RetailEnrollee, Provider, Diagnosis, Company } = req.models;
        const { claimId } = req.params;
        const {
            enrolleeId,
            retailEnrolleeId,
            companyId,
            diagnosisId,
            serviceDate,
            dischargeDate,
            amountClaimed,
            amountApproved,
            serviceType,
            description,
            notes,
            referralNumber,
            authorizationCode
        } = req.body || {};

        // Verify claim exists
        const claim = await Claim.findByPk(claimId);
        if (!claim) return res.fail('Claim not found', 404);

        // Validate that either enrolleeId or retailEnrolleeId is provided
        if (!enrolleeId && !retailEnrolleeId) {
            return res.fail('Either `enrolleeId` or `retailEnrolleeId` is required', 400);
        }

        // Validate required fields
        if (!claim.providerId) return res.fail('Claim provider ID is missing', 400);
        if (!serviceDate) return res.fail('`serviceDate` is required', 400);
        if (!amountClaimed) return res.fail('`amountClaimed` is required', 400);

        // Verify enrollee exists if provided
        if (enrolleeId) {
            const enrollee = await Enrollee.findByPk(enrolleeId);
            if (!enrollee) return res.fail('Enrollee not found', 404);
        }

        // Verify retail enrollee exists if provided
        if (retailEnrolleeId) {
            const retailEnrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
            if (!retailEnrollee) return res.fail('Retail enrollee not found', 404);
        }

        // Verify provider exists
        const provider = await Provider.findByPk(claim.providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Verify diagnosis exists if provided
        if (diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Verify company exists if provided
        if (companyId) {
            const company = await Company.findByPk(companyId);
            if (!company) return res.fail('Company not found', 404);
        }

        const claimDetail = await ClaimDetail.create({
            claimId,
            enrolleeId: enrolleeId || null,
            retailEnrolleeId: retailEnrolleeId || null,
            companyId: companyId || null,
            providerId: claim.providerId,
            diagnosisId: diagnosisId || null,
            serviceDate,
            dischargeDate: dischargeDate || null,
            amountClaimed,
            amountApproved: amountApproved || 0,
            serviceType: serviceType || null,
            description: description || null,
            notes: notes || null,
            referralNumber: referralNumber || null,
            authorizationCode: authorizationCode || null
        });

        // Update claim's numberOfEncounters and amountSubmitted
        const detailCount = await ClaimDetail.count({ where: { claimId } });
        const totalAmountClaimed = await ClaimDetail.sum('amountClaimed', { where: { claimId } });

        await claim.update({
            numberOfEncounters: detailCount,
            amountSubmitted: totalAmountClaimed || 0
        });

        await addAuditLog(req.models, {
            action: 'claim_detail.create',
            message: `Claim detail created for claim ${claim.claimReference}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId, claimDetailId: claimDetail.id, amountClaimed }
        });

        return res.success(claimDetail, 'Claim detail created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

/**
 * Update claim detail
 */
async function updateClaimDetail(req, res, next) {
    try {
        const { ClaimDetail, Claim } = req.models;
        const { claimId, detailId } = req.params;
        const updates = req.body;

        // Verify claim exists
        const claim = await Claim.findByPk(claimId);
        if (!claim) return res.fail('Claim not found', 404);

        const claimDetail = await ClaimDetail.findByPk(detailId);
        if (!claimDetail) return res.fail('Claim detail not found', 404);

        // Verify the detail belongs to this claim
        if (claimDetail.claimId !== claimId) {
            return res.fail('Claim detail does not belong to this claim', 400);
        }

        // Prevent certain fields from being updated
        delete updates.claimId;
        delete updates.providerId;

        await claimDetail.update(updates);

        // Recalculate claim totals
        const detailCount = await ClaimDetail.count({ where: { claimId } });
        const totalAmountClaimed = await ClaimDetail.sum('amountClaimed', { where: { claimId } });
        const totalAmountApproved = await ClaimDetail.sum('amountApproved', { where: { claimId } });

        await claim.update({
            numberOfEncounters: detailCount,
            amountSubmitted: totalAmountClaimed || 0,
            amountProcessed: totalAmountApproved || 0,
            difference: (totalAmountClaimed || 0) - (totalAmountApproved || 0)
        });

        await addAuditLog(req.models, {
            action: 'claim_detail.update',
            message: `Claim detail updated for claim ${claim.claimReference}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId, claimDetailId: claimDetail.id }
        });

        return res.success(claimDetail, 'Claim detail updated successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Delete claim detail
 */
async function deleteClaimDetail(req, res, next) {
    try {
        const { ClaimDetail, Claim } = req.models;
        const { claimId, detailId } = req.params;

        // Verify claim exists
        const claim = await Claim.findByPk(claimId);
        if (!claim) return res.fail('Claim not found', 404);

        const claimDetail = await ClaimDetail.findByPk(detailId);
        if (!claimDetail) return res.fail('Claim detail not found', 404);

        // Verify the detail belongs to this claim
        if (claimDetail.claimId !== claimId) {
            return res.fail('Claim detail does not belong to this claim', 400);
        }

        // Only allow deletion if claim is in draft status
        if (claim.status !== 'draft') {
            return res.fail('Can only delete details from draft claims', 400);
        }

        const amountClaimed = claimDetail.amountClaimed;
        await claimDetail.destroy();

        // Recalculate claim totals
        const detailCount = await ClaimDetail.count({ where: { claimId } });
        const totalAmountClaimed = await ClaimDetail.sum('amountClaimed', { where: { claimId } });
        const totalAmountApproved = await ClaimDetail.sum('amountApproved', { where: { claimId } });

        await claim.update({
            numberOfEncounters: detailCount || 0,
            amountSubmitted: totalAmountClaimed || 0,
            amountProcessed: totalAmountApproved || 0,
            difference: (totalAmountClaimed || 0) - (totalAmountApproved || 0)
        });

        await addAuditLog(req.models, {
            action: 'claim_detail.delete',
            message: `Claim detail deleted from claim ${claim.claimReference}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { claimId, claimDetailId: detailId, amountClaimed }
        });

        return res.success(null, 'Claim detail deleted successfully', 200);
    } catch (err) {
        return next(err);
    }
}

/**
 * Helper function to generate unique claim reference
 */
function generateClaimReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CLM-${timestamp}-${random}`;
}

module.exports = {
    createClaim,
    listClaims,
    getClaimById,
    updateClaim,
    deleteClaim,
    submitClaim,
    vetClaim,
    approveClaim,
    rejectClaim,
    queryClaim,
    markClaimAsPaid,
    markClaimAsPartiallyPaid,
    getClaimsByProvider,
    getClaimsByStatus,
    getClaimsByPeriod,
    getClaimsBySubmitter,
    getClaimsSummary,
    getClaimsByStatusCount,
    getClaimsByProviderCount,
    getPaymentStatistics,
    listClaimDetails,
    getClaimDetailById,
    createClaimDetail,
    updateClaimDetail,
    deleteClaimDetail
};
