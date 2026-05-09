'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            const tableDescription = await queryInterface.describeTable('enrollees', { transaction });

            const columnsToMakeNullable = [
                'middle_name',
                'last_name',
                'state',
                'lga',
                'address',
                'occupation',
                'marital_status',
                'max_dependents',
                'preexisting_medical_records',
                'expiration_date'
            ];

            for (const column of columnsToMakeNullable) {
                if (!tableDescription[column]) continue;

                // Handle ENUM manually
                if (column === 'marital_status') {
                    await queryInterface.changeColumn('enrollees', 'marital_status', {
                        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
                        allowNull: true
                    }, { transaction });
                    continue;
                }

                await queryInterface.changeColumn('enrollees', column, {
                    type: tableDescription[column].type,
                    allowNull: true
                }, { transaction });
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            const tableDescription = await queryInterface.describeTable('enrollees', { transaction });

            const columnsToRevertToNotNull = [
                { name: 'middle_name', type: Sequelize.STRING },
                { name: 'last_name', type: Sequelize.STRING },
                { name: 'state', type: Sequelize.STRING },
                { name: 'lga', type: Sequelize.STRING },
                { name: 'address', type: Sequelize.TEXT },
                { name: 'occupation', type: Sequelize.STRING },
                { name: 'marital_status', type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed', 'separated') },
                { name: 'max_dependents', type: Sequelize.INTEGER },
                { name: 'preexisting_medical_records', type: Sequelize.TEXT },
                { name: 'expiration_date', type: Sequelize.DATE }
            ];

            for (const col of columnsToRevertToNotNull) {
                if (!tableDescription[col.name]) continue;

                await queryInterface.changeColumn('enrollees', col.name, {
                    type: col.type,
                    allowNull: false
                }, { transaction });
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
