const { Op } = require('sequelize');

async function getEnrolleeDependents(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const { enrolleeId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        const offset = (page - 1) * limit;

        const { count, rows } = await EnrolleeDependent.findAndCountAll({
            where: { enrolleeId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            subQuery: false
        });

        return res.success(
            {
                dependents: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit),
                    hasNextPage: offset + parseInt(limit) < count,
                    hasPreviousPage: page > 1
                }
            },
            'Enrollee dependents retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching enrollee dependents:', error);
        next(error);
    }
}

async function getEnrolleeDependentById(req, res, next) {
    try {
        const { EnrolleeDependent, Enrollee } = req.models;
        const { enrolleeId, dependentId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!dependentId) return res.fail('`dependentId` is required', 400);

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Get the dependent and verify it belongs to the enrollee
        const dependent = await EnrolleeDependent.findOne({
            where: { id: dependentId, enrolleeId }
        });

        if (!dependent) return res.fail('Dependent not found', 404);

        return res.success(
            { dependent },
            'Enrollee dependent retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching enrollee dependent:', error);
        next(error);
    }
}

module.exports = {
    getEnrolleeDependents,
    getEnrolleeDependentById
};
