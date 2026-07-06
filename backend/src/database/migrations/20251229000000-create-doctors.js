'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('doctors', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            middle_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false
            },
            specialization: {
                type: Sequelize.STRING,
                allowNull: false
            },
            license_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            license_expiry_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            registration_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            date_of_birth: {
                type: Sequelize.DATE,
                allowNull: false
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            state: {
                type: Sequelize.STRING,
                allowNull: true
            },
            country: {
                type: Sequelize.STRING,
                allowNull: true
            },
            lga: {
                type: Sequelize.STRING,
                allowNull: true
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            years_of_experience: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            profile_picture_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            consultation_fee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            is_available: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            average_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: true,
                defaultValue: 0
            },
            total_ratings: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'suspended'),
                allowNull: false,
                defaultValue: 'active'
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            verified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true
            },
            is_deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('doctors');
    }
};
