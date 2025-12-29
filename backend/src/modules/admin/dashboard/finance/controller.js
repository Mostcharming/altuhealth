const { Sequelize } = require('sequelize');

// Get finance metrics
const getMetrics = async (req, res, next) => {
    try {
        const { Claim, Invoice, Payment, Drug, Service } = req.models;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;

        // Get total claims paid (current month)
        const currentMonthClaimsPaid = await Claim.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount_processed')), 'total_amount']
            ],
            where: Sequelize.and(
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "date_paid"')),
                    Sequelize.Op.eq,
                    currentMonth
                ),
                Sequelize.where(
                    Sequelize.col('status'),
                    Sequelize.Op.eq,
                    'paid'
                )
            ),
            raw: true
        });

        const totalClaimsPaid = parseInt(currentMonthClaimsPaid?.totalAmount) || 0;

        // Get last month claims paid for comparison
        const lastMonthClaimsPaid = await Claim.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount_processed')), 'total_amount']
            ],
            where: Sequelize.and(
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "date_paid"')),
                    Sequelize.Op.eq,
                    lastMonth
                ),
                Sequelize.where(
                    Sequelize.col('status'),
                    Sequelize.Op.eq,
                    'paid'
                )
            ),
            raw: true
        });

        const lastMonthClaimsPaidAmount = parseInt(lastMonthClaimsPaid?.totalAmount) || 0;

        const claimsPaidPercentage = lastMonthClaimsPaidAmount === 0
            ? 0
            : ((totalClaimsPaid - lastMonthClaimsPaidAmount) / lastMonthClaimsPaidAmount * 100).toFixed(1);

        const claimsPaidTrend = totalClaimsPaid >= lastMonthClaimsPaidAmount ? 'up' : 'down';

        // Get pending claims count
        const totalPendingClaims = await Claim.count({
            where: {
                status: 'pending_vetting'
            }
        });

        // Get last month pending claims for comparison
        const lastMonthPendingClaims = await Claim.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                lastMonth
            ),
            raw: true
        });

        const pendingClaimsPercentage = lastMonthPendingClaims === 0
            ? 0
            : ((totalPendingClaims - lastMonthPendingClaims) / lastMonthPendingClaims * 100).toFixed(1);

        const pendingClaimsTrend = totalPendingClaims >= lastMonthPendingClaims ? 'up' : 'down';

        // Get total invoices generated (current month)
        const currentMonthInvoices = await Invoice.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                currentMonth
            ),
            raw: true
        });

        // Get last month invoices for comparison
        const lastMonthInvoices = await Invoice.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                lastMonth
            ),
            raw: true
        });

        const invoicesPercentage = lastMonthInvoices === 0
            ? 0
            : ((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices * 100).toFixed(1);

        const invoicesTrend = currentMonthInvoices >= lastMonthInvoices ? 'up' : 'down';

        // Get total revenue collected (current month)
        const currentMonthRevenue = await Payment.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('payment_amount')), 'total_revenue']
            ],
            where: Sequelize.and(
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "payment_date"')),
                    Sequelize.Op.eq,
                    currentMonth
                ),
                Sequelize.where(
                    Sequelize.col('status'),
                    Sequelize.Op.eq,
                    'completed'
                )
            ),
            raw: true
        });

        const totalRevenueCollected = parseInt(currentMonthRevenue?.totalRevenue) || 0;

        // Get last month revenue for comparison
        const lastMonthRevenue = await Payment.findOne({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('payment_amount')), 'total_revenue']
            ],
            where: Sequelize.and(
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "payment_date"')),
                    Sequelize.Op.eq,
                    lastMonth
                ),
                Sequelize.where(
                    Sequelize.col('status'),
                    Sequelize.Op.eq,
                    'completed'
                )
            ),
            raw: true
        });

        const lastMonthRevenueAmount = parseInt(lastMonthRevenue?.totalRevenue) || 0;

        const revenuePercentage = lastMonthRevenueAmount === 0
            ? 0
            : ((totalRevenueCollected - lastMonthRevenueAmount) / lastMonthRevenueAmount * 100).toFixed(1);

        const revenueTrend = totalRevenueCollected >= lastMonthRevenueAmount ? 'up' : 'down';

        // Get monthly churn rate data (last 7 days - enrollee claims percentage)
        const churnRateData = await Claim.sequelize.query(
            `SELECT DATE(claims.created_at) as date,
                    COUNT(DISTINCT claims.id) as count, 
                    COUNT(DISTINCT enrollees.id) as total
             FROM claims
             LEFT JOIN enrollees ON EXTRACT(DAY FROM enrollees.created_at) = EXTRACT(DAY FROM claims.created_at)
             WHERE claims.created_at >= NOW() - INTERVAL '7 days'
             GROUP BY DATE(claims.created_at)
             ORDER BY DATE(claims.created_at)`,
            {
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        const churnRateArray = churnRateData.length > 0
            ? churnRateData.map(item => Math.round((parseInt(item.count) / (parseInt(item.total) || 1)) * 100))
            : [];

        // Get monthly growth rate data (last 7 days - claims with issues)
        const growthRateData = await Claim.sequelize.query(
            `SELECT COUNT(*) as count
             FROM claims
             WHERE status = 'rejected' AND created_at >= NOW() - INTERVAL '7 days'
             GROUP BY DATE(created_at)
             ORDER BY DATE(created_at)`,
            {
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        const growthRateArray = growthRateData.length > 0
            ? growthRateData.map(item => parseInt(item.count))
            : [];

        // Get funnel chart data (payment amounts at different stages - last 8 records)
        const funnelData = await Payment.findAll({
            attributes: ['paymentAmount'],
            order: [['createdAt', 'DESC']],
            limit: 8,
            raw: true
        });

        const funnelArray = funnelData.length > 0
            ? funnelData.reverse().map(item => parseInt(item.paymentAmount) / 1000000) // Convert to millions
            : [];

        // Get recent invoices
        const recentInvoices = await Invoice.findAll({
            attributes: ['id', 'invoiceNumber', 'createdAt', 'totalAmount', 'status'],
            include: [
                {
                    association: 'provider',
                    attributes: ['name'],
                    required: false
                },
                {
                    association: 'enrollee',
                    attributes: ['firstName', 'lastName'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5,
            raw: false
        });

        // Format invoices
        const invoicesData = recentInvoices.map((invoice) => {
            let customerName = 'N/A';
            if (invoice.provider?.name) {
                customerName = invoice.provider.name;
            } else if (invoice.enrollee) {
                customerName = `${invoice.enrollee.firstName} ${invoice.enrollee.lastName}`;
            }

            return {
                id: invoice.id,
                serialNo: invoice.invoiceNumber || '#INV000',
                closeDate: new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                user: customerName,
                amount: `₦${parseInt(invoice.totalAmount).toLocaleString('en-NG')}`,
                status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
            };
        });

        // Get product performance data (last 7 days)
        const drugPerformance = await Drug.sequelize.query(
            `SELECT COUNT(*) as count
             FROM drugs
             WHERE created_at >= NOW() - INTERVAL '7 days'
             GROUP BY DATE(created_at)
             ORDER BY DATE(created_at)`,
            {
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        const drugsArray = drugPerformance.length > 0
            ? drugPerformance.map(item => parseInt(item.count))
            : [];

        const servicePerformance = await Service.sequelize.query(
            `SELECT COUNT(*) as count
             FROM services
             WHERE created_at >= NOW() - INTERVAL '7 days'
             GROUP BY DATE(created_at)
             ORDER BY DATE(created_at)`,
            {
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        const servicesArray = servicePerformance.length > 0
            ? servicePerformance.map(item => parseInt(item.count))
            : [];

        // Get recent activities from actual payment records
        const recentActivities = await Payment.findAll({
            attributes: ['id', 'paymentDate', 'status'],
            order: [['paymentDate', 'DESC']],
            limit: 5,
            raw: true
        });

        const activities = recentActivities.map((payment) => ({
            id: payment.id,
            description: `Payment processed`,
            timestamp: new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            type: 'payment'
        }));

        const data = {
            metrics: {
                totalClaimsPaid: {
                    amount: totalClaimsPaid,
                    percentage: parseFloat(claimsPaidPercentage),
                    trend: claimsPaidTrend,
                },
                totalPendingClaims: {
                    count: totalPendingClaims,
                    percentage: parseFloat(pendingClaimsPercentage),
                    trend: pendingClaimsTrend,
                },
                totalInvoiceGenerated: {
                    count: currentMonthInvoices,
                    percentage: parseFloat(invoicesPercentage),
                    trend: invoicesTrend,
                },
                totalRevenueCollected: {
                    amount: totalRevenueCollected,
                    percentage: parseFloat(revenuePercentage),
                    trend: revenueTrend,
                }
            },
            churnRate: {
                data: churnRateArray.slice(0, 7)
            },
            growthRate: {
                data: growthRateArray.slice(0, 7)
            },
            funnelChart: {
                data: funnelArray
            },
            invoices: invoicesData,
            productPerformance: {
                drugs: drugsArray,
                services: servicesArray
            },
            activities
        };

        return res.status(200).json({
            success: true,
            message: 'Finance metrics retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMetrics,
};
