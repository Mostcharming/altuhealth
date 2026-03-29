'use strict';

const { addAuditLog } = require('../../../utils/addAdminNotification');

/**
 * Get general settings
 */
async function getGeneralSettings(req, res, next) {
    try {
        const { GeneralSetting } = req.models;

        let setting = await GeneralSetting.findOne();
        if (!setting) {
            // Create default if doesn't exist
            setting = await GeneralSetting.create({
                emailFrom: '',
                smsFrom: '',
                emailTemplate: '',
                smsBody: '',
                emailNotification: false,
                smsNotification: false,
                mailConfig: {},
                smsConfig: {},
            });
        }

        const data = {
            id: setting.id,
            emailFrom: setting.emailFrom,
            smsFrom: setting.smsFrom,
            emailTemplate: setting.emailTemplate,
            smsBody: setting.smsBody,
            emailNotification: setting.emailNotification,
            smsNotification: setting.smsNotification,
            mailConfig: setting.mailConfig,
            smsConfig: setting.smsConfig,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt,
        };

        return res.success(data, 'General settings retrieved');
    } catch (err) {
        return next(err);
    }
}

/**
 * Update general settings
 */
async function updateGeneralSettings(req, res, next) {
    try {
        const { GeneralSetting } = req.models;
        const updates = req.body || {};

        let setting = await GeneralSetting.findOne();
        if (!setting) {
            // Create default if doesn't exist
            setting = await GeneralSetting.create({
                emailFrom: '',
                smsFrom: '',
                emailTemplate: '',
                smsBody: '',
                emailNotification: false,
                smsNotification: false,
                mailConfig: {},
                smsConfig: {},
            });
        }

        await setting.update(updates);

        await addAuditLog(req.models, {
            action: 'generalSettings.update',
            message: 'General settings updated',
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { settingId: setting.id },
        });

        const data = {
            id: setting.id,
            emailFrom: setting.emailFrom,
            smsFrom: setting.smsFrom,
            emailTemplate: setting.emailTemplate,
            smsBody: setting.smsBody,
            emailNotification: setting.emailNotification,
            smsNotification: setting.smsNotification,
            mailConfig: setting.mailConfig,
            smsConfig: setting.smsConfig,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt,
        };

        return res.success(data, 'General settings updated');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getGeneralSettings,
    updateGeneralSettings,
};
