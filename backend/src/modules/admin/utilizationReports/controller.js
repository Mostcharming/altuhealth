'use strict';

const { Op } = require('sequelize');

function toNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
}

function percent(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}

function daysUntil(date) {
    if (!date) return null;
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function monthKey(date) {
    return new Date(date).toLocaleString('en-US', { month: 'short' });
}

function emptyMonths() {
    return {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0
    };
}

function chartFromMonthMap(map) {
    const months = Object.keys(emptyMonths());
    return {
        categories: months,
        series: months.map((month) => map[month] || 0)
    };
}

function fullName(record) {
    if (!record) return '-';
    return [record.firstName, record.lastName].filter(Boolean).join(' ').trim() || record.name || '-';
}

function topRows(rows, key, limit = 8) {
    return [...rows].sort((a, b) => toNumber(b[key]) - toNumber(a[key])).slice(0, limit);
}

async function getCompanyReport(req, res, next) {
    try {
        const { Company, Staff, Enrollee, EnrolleeDependent, Subscription, AuthorizationCode, ClaimDetail } = req.models;
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [companies, staff, enrollees, dependents, subscriptions, authCodes, claimDetails] = await Promise.all([
            Company.findAll({ attributes: ['id', 'name', 'email', 'isActive'] }),
            Staff.findAll({ attributes: ['id', 'companyId', 'enrollmentStatus', 'isActive'] }),
            Enrollee.findAll({ attributes: ['id', 'companyId', 'isActive', 'createdAt'] }),
            EnrolleeDependent.findAll({ attributes: ['id', 'enrolleeId', 'isActive', 'createdAt'] }),
            Subscription.findAll({ attributes: ['id', 'code', 'companyId', 'status', 'startDate', 'endDate'] }),
            AuthorizationCode.findAll({ attributes: ['id', 'companyId', 'status', 'amountAuthorized', 'createdAt'] }),
            ClaimDetail.findAll({ attributes: ['id', 'companyId', 'amountSubmitted', 'amountApproved', 'serviceType', 'createdAt'] })
        ]);

        const enrolleeCompany = new Map(enrollees.map((item) => [item.id, item.companyId]));
        const companyRows = companies.map((company) => {
            const companyStaff = staff.filter((item) => item.companyId === company.id);
            const companyEnrollees = enrollees.filter((item) => item.companyId === company.id);
            const enrolleeIds = new Set(companyEnrollees.map((item) => item.id));
            const companyDependents = dependents.filter((item) => enrolleeIds.has(item.enrolleeId));
            const companyAuthCodes = authCodes.filter((item) => item.companyId === company.id);
            const companyClaims = claimDetails.filter((item) => item.companyId === company.id);
            const activeSubscriptions = subscriptions.filter((item) => item.companyId === company.id && item.status === 'active');
            const expiringSubscriptions = activeSubscriptions.filter((item) => item.endDate && new Date(item.endDate) <= soon);
            const submittedAmount = companyClaims.reduce((sum, item) => sum + toNumber(item.amountSubmitted), 0);
            const approvedAmount = companyClaims.reduce((sum, item) => sum + toNumber(item.amountApproved), 0);

            return {
                id: company.id,
                name: company.name,
                email: company.email,
                active: company.isActive,
                staff: companyStaff.length,
                enrolledStaff: companyStaff.filter((item) => item.enrollmentStatus === 'enrolled').length,
                enrollees: companyEnrollees.length,
                activeEnrollees: companyEnrollees.filter((item) => item.isActive).length,
                dependents: companyDependents.length,
                activeDependents: companyDependents.filter((item) => item.isActive).length,
                authorizationCodes: companyAuthCodes.length,
                activeAuthorizationCodes: companyAuthCodes.filter((item) => item.status === 'active').length,
                claims: companyClaims.length,
                submittedAmount,
                approvedAmount,
                activeSubscriptions: activeSubscriptions.length,
                expiringSubscriptions: expiringSubscriptions.length,
                utilizationScore: companyEnrollees.length + companyDependents.length
                    ? percent(companyAuthCodes.length + companyClaims.length, companyEnrollees.length + companyDependents.length)
                    : 0
            };
        });

        const monthlyMembership = emptyMonths();
        enrollees.forEach((item) => {
            if (item.createdAt) monthlyMembership[monthKey(item.createdAt)] += 1;
        });
        dependents.forEach((item) => {
            if (item.createdAt && enrolleeCompany.has(item.enrolleeId)) monthlyMembership[monthKey(item.createdAt)] += 1;
        });

        const serviceTypes = {};
        claimDetails.forEach((item) => {
            serviceTypes[item.serviceType || 'unknown'] = (serviceTypes[item.serviceType || 'unknown'] || 0) + 1;
        });

        const expiring = subscriptions
            .filter((item) => item.endDate && new Date(item.endDate) <= soon)
            .map((item) => {
                const company = companies.find((row) => row.id === item.companyId);
                return {
                    id: item.id,
                    name: company?.name || '-',
                    code: item.code,
                    status: item.status,
                    endDate: item.endDate,
                    daysUntilExpiry: daysUntil(item.endDate)
                };
            })
            .sort((a, b) => toNumber(a.daysUntilExpiry) - toNumber(b.daysUntilExpiry))
            .slice(0, 10);

        return res.success({
            metrics: [
                { label: 'Companies', value: companies.length },
                { label: 'Staff', value: staff.length },
                { label: 'Enrollees', value: enrollees.length },
                { label: 'Dependents', value: dependents.length },
                { label: 'Auth Codes', value: authCodes.length },
                { label: 'Claims', value: claimDetails.length }
            ],
            charts: {
                membershipGrowth: chartFromMonthMap(monthlyMembership),
                serviceTypes: {
                    labels: Object.keys(serviceTypes),
                    series: Object.values(serviceTypes)
                }
            },
            tables: {
                topUtilization: topRows(companyRows, 'utilizationScore'),
                subscriptionsExpiring: expiring
            }
        }, 'Company utilization report retrieved');
    } catch (error) {
        return next(error);
    }
}

async function getProviderReport(req, res, next) {
    try {
        const { Provider, Claim, ClaimDetail, ClaimDetailItem, AuthorizationCode, PaymentAdvice } = req.models;
        const [providers, claims, claimDetails, claimItems, authCodes, paymentAdvices] = await Promise.all([
            Provider.findAll({ attributes: ['id', 'name', 'code', 'category', 'email'] }),
            Claim.findAll({ attributes: ['id', 'providerId', 'status', 'amountSubmitted', 'amountProcessed', 'createdAt'] }),
            ClaimDetail.findAll({ attributes: ['id', 'providerId', 'amountSubmitted', 'amountApproved', 'serviceType', 'createdAt'] }),
            ClaimDetailItem.findAll({ attributes: ['id', 'itemType', 'itemName', 'quantity', 'totalAmount', 'createdAt'] }),
            AuthorizationCode.findAll({ attributes: ['id', 'providerId', 'status', 'amountAuthorized', 'createdAt'] }),
            PaymentAdvice.findAll({ attributes: ['id', 'providerId', 'status', 'totalAmount', 'paymentDate'] })
        ]);

        const providerRows = providers.map((provider) => {
            const providerClaims = claims.filter((item) => item.providerId === provider.id);
            const providerDetails = claimDetails.filter((item) => item.providerId === provider.id);
            const providerAuthCodes = authCodes.filter((item) => item.providerId === provider.id);
            const providerPayments = paymentAdvices.filter((item) => item.providerId === provider.id);
            const submittedAmount = providerClaims.reduce((sum, item) => sum + toNumber(item.amountSubmitted), 0);
            const processedAmount = providerClaims.reduce((sum, item) => sum + toNumber(item.amountProcessed), 0);

            return {
                id: provider.id,
                name: provider.name,
                code: provider.code,
                category: provider.category,
                claims: providerClaims.length,
                paidClaims: providerClaims.filter((item) => item.status === 'paid').length,
                renderedServices: providerDetails.length,
                authorizationCodes: providerAuthCodes.length,
                activeAuthorizationCodes: providerAuthCodes.filter((item) => item.status === 'active').length,
                submittedAmount,
                processedAmount,
                paymentAdvices: providerPayments.length,
                paidAmount: providerPayments.reduce((sum, item) => sum + toNumber(item.totalAmount), 0)
            };
        });

        const itemTypes = {};
        claimItems.forEach((item) => {
            itemTypes[item.itemType] = (itemTypes[item.itemType] || 0) + toNumber(item.quantity || 1);
        });

        const monthlyClaims = emptyMonths();
        claims.forEach((item) => {
            if (item.createdAt) monthlyClaims[monthKey(item.createdAt)] += 1;
        });

        const serviceTypes = {};
        claimDetails.forEach((item) => {
            serviceTypes[item.serviceType || 'unknown'] = (serviceTypes[item.serviceType || 'unknown'] || 0) + 1;
        });

        return res.success({
            metrics: [
                { label: 'Providers', value: providers.length },
                { label: 'Rendered Services', value: claimDetails.length },
                { label: 'Claim Items', value: claimItems.length },
                { label: 'Claims', value: claims.length },
                { label: 'Payment Advices', value: paymentAdvices.length },
                { label: 'Auth Codes', value: authCodes.length }
            ],
            charts: {
                monthlyClaims: chartFromMonthMap(monthlyClaims),
                serviceTypes: { labels: Object.keys(serviceTypes), series: Object.values(serviceTypes) },
                itemTypes: { labels: Object.keys(itemTypes), series: Object.values(itemTypes) }
            },
            tables: {
                topUtilization: topRows(providerRows, 'renderedServices'),
                topClaims: topRows(providerRows, 'submittedAmount')
            }
        }, 'Provider utilization report retrieved');
    } catch (error) {
        return next(error);
    }
}

async function getRetailReport(req, res, next) {
    try {
        const { RetailEnrollee, RetailEnrolleeDependent, RetailEnrolleeSubscription, AuthorizationCode, ClaimDetail } = req.models;
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [retailEnrollees, dependents, subscriptions, authCodes, claimDetails] = await Promise.all([
            RetailEnrollee.findAll({ attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'isActive', 'subscriptionEndDate', 'createdAt'] }),
            RetailEnrolleeDependent.findAll({ attributes: ['id', 'retailEnrolleeId', 'isActive', 'createdAt'] }),
            RetailEnrolleeSubscription.findAll({ attributes: ['id', 'referenceNumber', 'retailEnrolleeId', 'status', 'amountPaid', 'subscriptionEndDate'] }),
            AuthorizationCode.findAll({ attributes: ['id', 'retailEnrolleeId', 'retailEnrolleeDependentId', 'status', 'amountAuthorized', 'createdAt'] }),
            ClaimDetail.findAll({ attributes: ['id', 'retailEnrolleeId', 'amountSubmitted', 'amountApproved', 'serviceType', 'createdAt'] })
        ]);

        const retailRows = retailEnrollees.map((retail) => {
            const retailDependents = dependents.filter((item) => item.retailEnrolleeId === retail.id);
            const retailSubscriptions = subscriptions.filter((item) => item.retailEnrolleeId === retail.id);
            const retailAuthCodes = authCodes.filter((item) => item.retailEnrolleeId === retail.id);
            const retailClaims = claimDetails.filter((item) => item.retailEnrolleeId === retail.id);
            return {
                id: retail.id,
                name: fullName(retail),
                policyNumber: retail.policyNumber,
                active: retail.isActive,
                dependents: retailDependents.length,
                activeDependents: retailDependents.filter((item) => item.isActive).length,
                subscriptions: retailSubscriptions.length,
                activeSubscriptions: retailSubscriptions.filter((item) => item.status === 'active').length,
                authorizationCodes: retailAuthCodes.length,
                claims: retailClaims.length,
                amountPaid: retailSubscriptions.reduce((sum, item) => sum + toNumber(item.amountPaid), 0),
                claimsAmount: retailClaims.reduce((sum, item) => sum + toNumber(item.amountSubmitted), 0),
                subscriptionEndDate: retail.subscriptionEndDate,
                daysUntilExpiry: daysUntil(retail.subscriptionEndDate)
            };
        });

        const monthlyMembership = emptyMonths();
        retailEnrollees.forEach((item) => {
            if (item.createdAt) monthlyMembership[monthKey(item.createdAt)] += 1;
        });
        dependents.forEach((item) => {
            if (item.createdAt) monthlyMembership[monthKey(item.createdAt)] += 1;
        });

        const serviceTypes = {};
        claimDetails.forEach((item) => {
            serviceTypes[item.serviceType || 'unknown'] = (serviceTypes[item.serviceType || 'unknown'] || 0) + 1;
        });

        return res.success({
            metrics: [
                { label: 'Retail Enrollees', value: retailEnrollees.length },
                { label: 'Dependents', value: dependents.length },
                { label: 'Active Subscriptions', value: subscriptions.filter((item) => item.status === 'active').length },
                { label: 'Expiring Soon', value: retailRows.filter((item) => item.daysUntilExpiry !== null && item.daysUntilExpiry <= 30).length },
                { label: 'Auth Codes', value: authCodes.length },
                { label: 'Claims', value: claimDetails.length }
            ],
            charts: {
                membershipGrowth: chartFromMonthMap(monthlyMembership),
                serviceTypes: { labels: Object.keys(serviceTypes), series: Object.values(serviceTypes) }
            },
            tables: {
                topUtilization: topRows(retailRows, 'claims'),
                subscriptionsExpiring: retailRows
                    .filter((item) => item.subscriptionEndDate && new Date(item.subscriptionEndDate) <= soon)
                    .sort((a, b) => toNumber(a.daysUntilExpiry) - toNumber(b.daysUntilExpiry))
                    .slice(0, 10)
            }
        }, 'Retail utilization report retrieved');
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getCompanyReport,
    getProviderReport,
    getRetailReport
};
