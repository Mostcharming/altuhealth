const { Op, sequelize } = require('sequelize');

async function searchEnrolleeOrDependent(req, res, next) {
    try {
        const { Enrollee, EnrolleeDependent, Provider, SearchHistory, Staff, Company, CompanyPlan } = req.models;
        const { searchTerm, provider_id } = req.body;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required',
                errors: ['searchTerm field is required']
            });
        }

        if (!provider_id) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
                errors: ['provider_id field is required']
            });
        }

        const provider = await Provider.findByPk(provider_id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const isEmail = lowerSearchTerm.includes('@');
        const searchType = isEmail ? 'email' : 'policyNumber';

        let enrollee = null;

        if (isEmail) {
            enrollee = await Enrollee.findOne({
                where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), Op.eq, lowerSearchTerm),
                include: [
                    { model: Staff, attributes: ['id', 'firstName', 'lastName', 'staffId', 'email', 'phoneNumber'] },
                    { model: Company, attributes: ['id', 'name'] },
                    { model: CompanyPlan, attributes: ['id', 'name'] }
                ]
            });
        } else {
            enrollee = await Enrollee.findOne({
                where: sequelize.where(sequelize.fn('LOWER', sequelize.col('policyNumber')), Op.eq, lowerSearchTerm),
                include: [
                    { model: Staff, attributes: ['id', 'firstName', 'lastName', 'staffId', 'email', 'phoneNumber'] },
                    { model: Company, attributes: ['id', 'name'] },
                    { model: CompanyPlan, attributes: ['id', 'name'] }
                ]
            });
        }

        if (enrollee) {
            await SearchHistory.create({
                providerId: provider_id,
                searchTerm,
            });

            return res.success(
                { enrollee, resultType: 'enrollee' },
                'Enrollee found successfully'
            );
        }

        let dependent = null;

        if (isEmail) {
            dependent = await EnrolleeDependent.findOne({
                where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), Op.eq, lowerSearchTerm),
                include: [
                    { model: Enrollee, attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber'] }
                ]
            });
        } else {
            dependent = await EnrolleeDependent.findOne({
                where: sequelize.where(sequelize.fn('LOWER', sequelize.col('policyNumber')), Op.eq, lowerSearchTerm),
                include: [
                    { model: Enrollee, attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber'] }
                ]
            });
        }

        if (dependent) {
            await SearchHistory.create({
                providerId: provider_id,
                searchTerm,
            });

            return res.success(
                { dependent, resultType: 'dependent' },
                'Dependent found successfully'
            );
        }

        return res.status(404).json({
            success: false,
            message: 'No enrollee or dependent found with the provided search term'
        });

    } catch (error) {
        console.error('Error searching enrollee or dependent:', error);
        next(error);
    }
}

async function getSearchHistory(req, res, next) {
    try {
        const { SearchHistory, Provider } = req.models;
        const { provider_id } = req.query;

        if (!provider_id) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
                errors: ['provider_id query parameter is required']
            });
        }

        const provider = await Provider.findByPk(provider_id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        const rows = await SearchHistory.findAll({
            where: { providerId: provider_id },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const categorized = {
            today: [],
            yesterday: [],
            earlier: []
        };

        rows.forEach(record => {
            const recordDate = new Date(record.createdAt);
            recordDate.setHours(0, 0, 0, 0);

            if (recordDate.getTime() === today.getTime()) {
                categorized.today.push(record);
            } else if (recordDate.getTime() === yesterday.getTime()) {
                categorized.yesterday.push(record);
            } else {
                categorized.earlier.push(record);
            }
        });

        return res.success(
            categorized,
            'Search history retrieved successfully'
        );

    } catch (error) {
        console.error('Error fetching search history:', error);
        next(error);
    }
}

module.exports = {
    searchEnrolleeOrDependent,
    getSearchHistory
};
