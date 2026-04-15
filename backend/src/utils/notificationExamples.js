/**
 * Notification Integration Examples
 * 
 * This file demonstrates practical examples of how to use the notification system
 * throughout different parts of the application.
 */

const {
    addProviderNotification,
    addEnrolleeNotification,
    addEnrolleeDependentNotification,
    addRetailEnrolleeNotification,
    addRetailEnrolleeDependentNotification
} = require('./addNotifications');

// ============================================================================
// AUTHORIZATION WORKFLOW NOTIFICATIONS
// ============================================================================

/**
 * Notify provider when new authorization request is submitted
 */
async function notifyProviderAuthorizationSubmitted(models, authorizationRequest, provider) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'New Authorization Request Received',
        message: `Authorization request for patient ${authorizationRequest.patientName} has been submitted for ${authorizationRequest.serviceType}`,
        clickUrl: '/authorizations/pending',
        notificationType: 'authorization_request_submitted'
    });
}

/**
 * Notify enrollee when authorization is approved
 */
async function notifyEnrolleeAuthorizationApproved(models, authorizationCode, enrollee) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Authorization Approved',
        message: `Your authorization request has been approved. Authorization Code: ${authorizationCode.code}`,
        clickUrl: '/authorizations',
        notificationType: 'authorization_approved'
    });
}

/**
 * Notify enrollee when authorization is denied
 */
async function notifyEnrolleeAuthorizationDenied(models, authorizationRequest, enrollee, reason) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Authorization Request Denied',
        message: `Your authorization request has been denied. Reason: ${reason}`,
        clickUrl: '/authorizations',
        notificationType: 'authorization_denied'
    });
}

/**
 * Notify provider when authorization requires additional info
 */
async function notifyProviderAuthorizationQuery(models, authorizationRequest, provider, query) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Authorization Requires Additional Information',
        message: `Your authorization request requires additional information: ${query}`,
        clickUrl: '/authorizations/pending',
        notificationType: 'authorization_query'
    });
}

// ============================================================================
// CLAIM WORKFLOW NOTIFICATIONS
// ============================================================================

/**
 * Notify enrollee when claim is submitted and received
 */
async function notifyEnrolleeClaimSubmitted(models, claim, enrollee) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Claim Submitted',
        message: `Your claim for $${claim.amount} has been received and is being processed`,
        clickUrl: '/claims',
        notificationType: 'claim_submitted'
    });
}

/**
 * Notify enrollee when claim is approved
 */
async function notifyEnrolleeClaimApproved(models, claim, enrollee, approvedAmount) {
    const message = approvedAmount === claim.amount
        ? `Your claim for $${claim.amount} has been approved for full payment`
        : `Your claim for $${claim.amount} has been approved. Approved amount: $${approvedAmount}`;

    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Claim Approved',
        message,
        clickUrl: '/claims',
        notificationType: 'claim_approved'
    });
}

/**
 * Notify enrollee when claim is denied
 */
async function notifyEnrolleeClaimDenied(models, claim, enrollee, reason) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Claim Denied',
        message: `Your claim for $${claim.amount} has been denied. Reason: ${reason}`,
        clickUrl: '/claims',
        notificationType: 'claim_denied'
    });
}

/**
 * Notify provider when claim payment is processed
 */
async function notifyProviderClaimPayment(models, claim, provider, paymentAmount) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Claim Payment Processed',
        message: `Payment of $${paymentAmount} for claim ${claim.id} has been processed`,
        clickUrl: '/payments',
        notificationType: 'claim_payment_processed'
    });
}

// ============================================================================
// APPOINTMENT NOTIFICATIONS
// ============================================================================

/**
 * Notify dependent when appointment is scheduled
 */
async function notifyDependentAppointmentScheduled(models, appointment, dependent, provider) {
    await addEnrolleeDependentNotification(models, {
        enrolleeDependentId: dependent.id,
        title: 'Appointment Scheduled',
        message: `Your appointment with ${provider.name} is scheduled for ${appointment.date} at ${appointment.time}`,
        clickUrl: '/appointments',
        notificationType: 'appointment_scheduled'
    });
}

/**
 * Notify dependent of appointment reminder
 */
async function notifyDependentAppointmentReminder(models, appointment, dependent, provider) {
    await addEnrolleeDependentNotification(models, {
        enrolleeDependentId: dependent.id,
        title: 'Appointment Reminder',
        message: `Reminder: You have an appointment with ${provider.name} tomorrow at ${appointment.time}`,
        clickUrl: '/appointments',
        notificationType: 'appointment_reminder'
    });
}

/**
 * Notify dependent when appointment is cancelled
 */
async function notifyDependentAppointmentCancelled(models, appointment, dependent) {
    await addEnrolleeDependentNotification(models, {
        enrolleeDependentId: dependent.id,
        title: 'Appointment Cancelled',
        message: `Your appointment scheduled for ${appointment.date} has been cancelled`,
        clickUrl: '/appointments',
        notificationType: 'appointment_cancelled'
    });
}

// ============================================================================
// PLAN & SUBSCRIPTION NOTIFICATIONS
// ============================================================================

/**
 * Notify enrollees when plan is updated
 */
async function notifyEnrolleePlanUpdate(models, plan, enrolleeIds) {
    for (const enrolleeId of enrolleeIds) {
        await addEnrolleeNotification(models, {
            enrolleeId,
            title: 'Plan Update',
            message: 'Your health plan has been updated with new benefits and coverage details',
            clickUrl: '/plan-details',
            notificationType: 'plan_updated'
        });
    }
}

/**
 * Notify retail enrollee of upcoming subscription renewal
 */
async function notifyRetailEnrolleeRenewalReminder(models, subscription, retailEnrollee, daysUntilRenewal) {
    await addRetailEnrolleeNotification(models, {
        retailEnrolleeId: retailEnrollee.id,
        title: 'Plan Renewal Reminder',
        message: `Your health plan will renew in ${daysUntilRenewal} days. Please ensure payment is current.`,
        clickUrl: '/subscription',
        notificationType: 'renewal_reminder'
    });
}

/**
 * Notify retail enrollee when subscription is renewed
 */
async function notifyRetailEnrolleeRenewed(models, subscription, retailEnrollee) {
    await addRetailEnrolleeNotification(models, {
        retailEnrolleeId: retailEnrollee.id,
        title: 'Subscription Renewed',
        message: `Your health plan subscription has been renewed. Coverage extends until ${subscription.endDate}`,
        clickUrl: '/subscription',
        notificationType: 'subscription_renewed'
    });
}

/**
 * Notify retail enrollee when subscription expires
 */
async function notifyRetailEnrolleeSubscriptionExpired(models, subscription, retailEnrollee) {
    await addRetailEnrolleeNotification(models, {
        retailEnrolleeId: retailEnrollee.id,
        title: 'Subscription Expired',
        message: 'Your health plan subscription has expired. Please renew to maintain coverage.',
        clickUrl: '/subscription',
        notificationType: 'subscription_expired'
    });
}

// ============================================================================
// PAYMENT NOTIFICATIONS
// ============================================================================

/**
 * Notify enrollee about due payment
 */
async function notifyEnrolleePaymentDue(models, invoice, enrollee, daysUntilDue) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Payment Due',
        message: `Payment of $${invoice.amount} is due in ${daysUntilDue} days. Due date: ${invoice.dueDate}`,
        clickUrl: '/payments',
        notificationType: 'payment_due'
    });
}

/**
 * Notify enrollee when payment is received
 */
async function notifyEnrolleePaymentReceived(models, payment, enrollee) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Payment Received',
        message: `Payment of $${payment.amount} has been received. Reference: ${payment.reference}`,
        clickUrl: '/payments',
        notificationType: 'payment_received'
    });
}

/**
 * Notify provider when payment batch is ready for processing
 */
async function notifyProviderPaymentBatchReady(models, paymentBatch, provider) {
    const amount = paymentBatch.details.reduce((sum, detail) => sum + detail.amount, 0);

    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Payment Batch Ready for Processing',
        message: `Payment batch containing $${amount} is ready for processing. Batch ID: ${paymentBatch.id}`,
        clickUrl: '/payments',
        notificationType: 'payment_batch_ready'
    });
}

/**
 * Notify provider when payment is processed
 */
async function notifyProviderPaymentProcessed(models, paymentBatch, provider) {
    const amount = paymentBatch.details.reduce((sum, detail) => sum + detail.amount, 0);

    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Payment Processed',
        message: `Payment batch of $${amount} has been processed and transferred to your account. Batch ID: ${paymentBatch.id}`,
        clickUrl: '/payments',
        notificationType: 'payment_processed'
    });
}

// ============================================================================
// ACCOUNT & VERIFICATION NOTIFICATIONS
// ============================================================================

/**
 * Notify enrollee when account verification is required
 */
async function notifyEnrolleeVerificationRequired(models, enrollee) {
    await addEnrolleeNotification(models, {
        enrolleeId: enrollee.id,
        title: 'Account Verification Required',
        message: 'Please verify your email address to activate your account',
        clickUrl: '/verify-account',
        notificationType: 'verification_required'
    });
}

/**
 * Notify provider when approval is pending
 */
async function notifyProviderApprovalPending(models, provider) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Account Approval Pending',
        message: 'Your provider account is under review and awaiting approval',
        clickUrl: '/account-status',
        notificationType: 'approval_pending'
    });
}

/**
 * Notify provider when approval is granted
 */
async function notifyProviderApprovalGranted(models, provider) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Account Approved',
        message: 'Your provider account has been approved and is now active',
        clickUrl: '/dashboard',
        notificationType: 'approval_granted'
    });
}

/**
 * Notify provider when account is suspended
 */
async function notifyProviderAccountSuspended(models, provider, reason) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Account Suspended',
        message: `Your provider account has been suspended. Reason: ${reason}. Please contact support.`,
        clickUrl: '/support',
        notificationType: 'account_suspended'
    });
}

// ============================================================================
// HEALTH & MEDICAL NOTIFICATIONS
// ============================================================================

/**
 * Notify dependent of health alert
 */
async function notifyDependentHealthAlert(models, dependent, alertType, message) {
    await addEnrolleeDependentNotification(models, {
        enrolleeDependentId: dependent.id,
        title: 'Health Alert',
        message,
        clickUrl: '/health-center',
        notificationType: `health_alert_${alertType}`
    });
}

/**
 * Notify dependent to schedule screening/checkup
 */
async function notifyDependentScheduleCheckup(models, dependent, screeningType) {
    await addEnrolleeDependentNotification(models, {
        enrolleeDependentId: dependent.id,
        title: `${screeningType} Screening Reminder`,
        message: `It's time to schedule your ${screeningType} screening. Contact your provider to book an appointment.`,
        clickUrl: '/appointments',
        notificationType: 'checkup_reminder'
    });
}

/**
 * Notify retail enrollee dependent of test results
 */
async function notifyRetailDependentTestResults(models, dependent, testName) {
    await addRetailEnrolleeDependentNotification(models, {
        retailEnrolleeDependentId: dependent.id,
        title: 'Test Results Available',
        message: `Your ${testName} test results are now available. Please log in to view details.`,
        clickUrl: '/medical-records',
        notificationType: 'test_results_available'
    });
}

// ============================================================================
// ADMINISTRATIVE NOTIFICATIONS
// ============================================================================

/**
 * Notify provider of policy/coverage change
 */
async function notifyProviderCoverageChange(models, provider, changeDescription) {
    await addProviderNotification(models, {
        providerId: provider.id,
        title: 'Coverage Policy Update',
        message: `There's an update to coverage policies. ${changeDescription}`,
        clickUrl: '/provider-resources',
        notificationType: 'coverage_policy_update'
    });
}

/**
 * Notify all enrollees in a company of system maintenance
 */
async function notifyEnrolleesSystemMaintenance(models, enrolleeIds, maintenanceWindow) {
    for (const enrolleeId of enrolleeIds) {
        await addEnrolleeNotification(models, {
            enrolleeId,
            title: 'System Maintenance Scheduled',
            message: `The platform will be under maintenance on ${maintenanceWindow}. Services may be temporarily unavailable.`,
            clickUrl: '/announcements',
            notificationType: 'system_maintenance'
        });
    }
}

// ============================================================================
// BULK OPERATIONS EXAMPLE
// ============================================================================

/**
 * Example: Notify all dependents in an enrollee's family of plan update
 */
async function notifyFamilyOfPlanUpdate(models, enrolleeId, updateMessage) {
    // Get all dependents for this enrollee
    const dependents = await models.EnrolleeDependent.findAll({
        where: { enrolleeId }
    });

    // Notify each dependent
    const notifications = dependents.map(dependent =>
        addEnrolleeDependentNotification(models, {
            enrolleeDependentId: dependent.id,
            title: 'Family Plan Updated',
            message: updateMessage,
            clickUrl: '/plan-details',
            notificationType: 'family_plan_update'
        })
    );

    await Promise.all(notifications);
}

/**
 * Example: Notify multiple providers of network change
 */
async function notifyProvidersOfNetworkChange(models, providerIds, changeDescription) {
    const notifications = providerIds.map(providerId =>
        addProviderNotification(models, {
            providerId,
            title: 'Network Configuration Updated',
            message: changeDescription,
            clickUrl: '/network-status',
            notificationType: 'network_update'
        })
    );

    await Promise.all(notifications);
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get unread notification count for an enrollee
 */
async function getUnreadNotificationCount(models, enrolleeId) {
    return await models.EnrolleeNotification.count({
        where: { enrolleeId, isRead: false }
    });
}

/**
 * Get unread notifications for a provider
 */
async function getUnreadNotifications(models, providerId, limit = 10) {
    return await models.ProviderNotification.findAll({
        where: { providerId, isRead: false },
        order: [['createdAt', 'DESC']],
        limit
    });
}

/**
 * Mark all notifications as read for an enrollee
 */
async function markAllNotificationsAsRead(models, enrolleeId) {
    return await models.EnrolleeNotification.update(
        { isRead: true },
        { where: { enrolleeId } }
    );
}

module.exports = {
    // Authorization
    notifyProviderAuthorizationSubmitted,
    notifyEnrolleeAuthorizationApproved,
    notifyEnrolleeAuthorizationDenied,
    notifyProviderAuthorizationQuery,
    // Claims
    notifyEnrolleeClaimSubmitted,
    notifyEnrolleeClaimApproved,
    notifyEnrolleeClaimDenied,
    notifyProviderClaimPayment,
    // Appointments
    notifyDependentAppointmentScheduled,
    notifyDependentAppointmentReminder,
    notifyDependentAppointmentCancelled,
    // Plans & Subscriptions
    notifyEnrolleePlanUpdate,
    notifyRetailEnrolleeRenewalReminder,
    notifyRetailEnrolleeRenewed,
    notifyRetailEnrolleeSubscriptionExpired,
    // Payments
    notifyEnrolleePaymentDue,
    notifyEnrolleePaymentReceived,
    notifyProviderPaymentBatchReady,
    notifyProviderPaymentProcessed,
    // Account
    notifyEnrolleeVerificationRequired,
    notifyProviderApprovalPending,
    notifyProviderApprovalGranted,
    notifyProviderAccountSuspended,
    // Health
    notifyDependentHealthAlert,
    notifyDependentScheduleCheckup,
    notifyRetailDependentTestResults,
    // Administrative
    notifyProviderCoverageChange,
    notifyEnrolleesSystemMaintenance,
    // Bulk
    notifyFamilyOfPlanUpdate,
    notifyProvidersOfNetworkChange,
    // Helpers
    getUnreadNotificationCount,
    getUnreadNotifications,
    markAllNotificationsAsRead
};
