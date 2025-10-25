// repositories/rental.repository.js

const { QueryTypes } = require('sequelize');

/**
 * @typedef {object} Rental
 * @property {number} rentalId - The unique identifier for the rental.
 * @property {Date} rentalDate - The date and time the rental was made.
 * @property {number} inventoryId - The ID of the inventory item rented.
 * @property {number} customerId - The ID of the customer who rented the item.
 * @property {Date|null} returnDate - The date and time the rental was returned (can be null).
 * @property {number} staffId - The ID of the staff member who processed the rental.
 * @property {Date} lastUpdate - The last update timestamp for the rental record.
 */

/**
 * RentalRepository class acts as a Data Access Object (DAO) for the Rental entity.
 * It provides an abstract layer for interacting with the underlying database for Rental entities,
 * handling standard CRUD operations and custom queries using Sequelize ORM.
 *
 * This class mirrors the functionality of the Java `RentalRepository` interface,
 * leveraging Sequelize's capabilities for object-relational mapping and database interactions.
 */
class RentalRepository {
    /**
     * Creates an instance of RentalRepository.
     * @param {object} models - An object containing Sequelize models.
     * @param {import('sequelize').ModelCtor<import('sequelize').Model>} models.Rental - The Sequelize Rental model.
     * @param {import('sequelize').ModelCtor<import('sequelize').Model>} models.Customer - The Sequelize Customer model (needed for joins).
     * @param {import('sequelize').Sequelize} sequelizeInstance - The Sequelize instance for executing native queries.
     */
    constructor(models, sequelizeInstance) {
        /** @private */
        this.RentalModel = models.Rental;
        /** @private */
        this.CustomerModel = models.Customer; // Retain reference for potential ORM-style joins or associations
        /** @private */
        this.sequelize = sequelizeInstance;
    }

    /**
     * Persists a Rental entity. If the entity has a `rentalId`, it updates the existing one;
     * otherwise, it creates a new one. This method mimics the behavior of `JpaRepository.save()`.
     *
     * @param {Rental} rentalData - The rental data to save.
     * @returns {Promise<Rental>} The saved or updated Rental entity instance.
     * @throws {Error} If there's a database error or if an update is attempted for a non-existent rental.
     */
    async save(rentalData) {
        try {
            if (rentalData.rentalId) {
                // Attempt to find and update an existing rental
                const [updatedRowsCount] = await this.RentalModel.update(rentalData, {
                    where: { rentalId: rentalData.rentalId }
                });

                if (updatedRowsCount > 0) {
                    // Fetch the updated record to return the full instance
                    return await this.RentalModel.findByPk(rentalData.rentalId);
                } else {
                    // If rentalId was provided but no rows were updated, it means the record wasn't found.
                    throw new Error(`Rental with ID ${rentalData.rentalId} not found for update.`);
                }
            } else {
                // Create a new rental entity
                return await this.RentalModel.create(rentalData);
            }
        } catch (error) {
            console.error(`[RentalRepository] Error saving rental: ${error.message}`, error);
            throw new Error(`Failed to save rental: ${error.message}`);
        }
    }

    /**
     * Retrieves a Rental entity by its primary key (`rentalId`).
     * This method mimics the behavior of `JpaRepository.findById()`.
     *
     * @param {number} id - The primary key (`rentalId`) of the rental to retrieve.
     * @returns {Promise<Rental|null>} The Rental entity instance if found, otherwise `null`.
     * @throws {Error} If there's a database error.
     */
    async findById(id) {
        try {
            return await this.RentalModel.findByPk(id);
        } catch (error) {
            console.error(`[RentalRepository] Error finding rental by ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to find rental by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves all Rental entities from the database.
     * This method mimics the behavior of `JpaRepository.findAll()`.
     *
     * @returns {Promise<Rental[]>} A list of all Rental entity instances.
     * @throws {Error} If there's a database error.
     */
    async findAll() {
        try {
            return await this.RentalModel.findAll();
        } catch (error) {
            console.error(`[RentalRepository] Error finding all rentals: ${error.message}`, error);
            throw new Error(`Failed to find all rentals: ${error.message}`);
        }
    }

    /**
     * Deletes a Rental entity from the database.
     * This method mimics the behavior of `JpaRepository.delete()`.
     *
     * @param {Rental} rental - The Rental entity instance to delete. It must contain a `rentalId`.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If an invalid rental object is provided or if there's a database error.
     */
    async delete(rental) {
        try {
            if (!rental || !rental.rentalId) {
                throw new Error("Invalid rental object provided for deletion. Missing 'rentalId'.");
            }
            return await this.RentalModel.destroy({
                where: { rentalId: rental.rentalId }
            });
        } catch (error) {
            console.error(`[RentalRepository] Error deleting rental with ID ${rental?.rentalId}: ${error.message}`, error);
            throw new Error(`Failed to delete rental: ${error.message}`);
        }
    }

    /**
     * Returns the total number of Rental entities in the database.
     * This method mimics the behavior of `JpaRepository.count()`.
     *
     * @returns {Promise<number>} The total number of Rental entities.
     * @throws {Error} If there's a database error.
     */
    async count() {
        try {
            return await this.RentalModel.count();
        } catch (error) {
            console.error(`[RentalRepository] Error counting rentals: ${error.message}`, error);
            throw new Error(`Failed to count rentals: ${error.message}`);
        }
    }

    /**
     * Retrieves a single Rental entity based on its unique `rentalId`.
     * This is a custom method, functionally equivalent to `findById` but named specifically
     * to match the Java interface's derived query method `getRentalByRentalId`.
     *
     * @param {number} id - The unique `rentalId` of the rental.
     * @returns {Promise<Rental|null>} The Rental entity instance if found, otherwise `null`.
     * @throws {Error} If there's a database error.
     */
    async getRentalByRentalId(id) {
        try {
            return await this.RentalModel.findByPk(id);
        } catch (error) {
            console.error(`[RentalRepository] Error retrieving rental by rentalId ${id}: ${error.message}`, error);
            throw new Error(`Failed to retrieve rental by rentalId ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of Rental entities that are associated with a specific `customerId`.
     * This method uses a native SQL query, directly mirroring the Java `@Query(nativeQuery = true)` approach
     * to ensure exact translation of the join logic.
     *
     * @param {number} customerId - The ID of the customer.
     * @returns {Promise<Rental[]>} A list of Rental entity instances for the given customer.
     * @throws {Error} If there's a database error.
     */
    async getRentalByCustomerId(customerId) {
        try {
            const sqlQuery = `
                SELECT r.*
                FROM rental r
                INNER JOIN customer c ON r.customer_id = c.customer_id
                WHERE c.customer_id = :customerId
            `;
            // Execute the native SQL query using the Sequelize instance
            const rentals = await this.sequelize.query(sqlQuery, {
                replacements: { customerId: customerId }, // Parameter binding for security
                type: QueryTypes.SELECT, // Specify that this is a SELECT query
                model: this.RentalModel, // Instruct Sequelize to map results to Rental model instances
                mapToModel: true // Ensure the mapping happens
            });
            return rentals;
        } catch (error) {
            console.error(`[RentalRepository] Error retrieving rentals by customerId ${customerId}: ${error.message}`, error);
            throw new Error(`Failed to retrieve rentals by customerId ${customerId}: ${error.message}`);
        }
    }
}

module.exports = RentalRepository;

// --- Supporting Model Definitions (Required for RentalRepository) ---
// These files would typically be in a 'models' directory.

// models/customer.model.js
// This file defines the Customer model. It's needed for the join in getRentalByCustomerId.
// You would typically initialize Sequelize and load models in an 'init' or 'config' file.
/*
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Customer = sequelize.define('Customer', {
        customerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'customer_id' // Maps to the actual column name in the database
        },
        firstName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        // Add other customer fields as necessary based on your 'customer' table schema
    }, {
        tableName: 'customer', // Explicitly specify the table name
        timestamps: false // Assuming no createdAt/updatedAt columns in 'customer' table
    });

    // Define associations here if needed for other parts of your application
    // Customer.associate = (models) => {
    //     Customer.hasMany(models.Rental, { foreignKey: 'customerId', as: 'rentals' });
    // };

    return Customer;
};
*/

// models/rental.model.js
// This file defines the Rental model.
/*
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Rental = sequelize.define('Rental', {
        rentalId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'rental_id' // Maps to the actual column name in the database
        },
        rentalDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'rental_date'
        },
        inventoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'inventory_id'
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'customer_id'
        },
        returnDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'return_date'
        },
        staffId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'staff_id'
        },
        lastUpdate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Set default to current timestamp if not provided
            field: 'last_update'
        }
    }, {
        tableName: 'rental', // Explicitly specify the table name
        timestamps: false // Assuming no createdAt/updatedAt columns in 'rental' table
    });

    // Define associations (e.g., Rental belongs to Customer)
    // This is good practice even if the specific query uses native SQL.
    Rental.associate = (models) => {
        Rental.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
        // Add other associations if needed, e.g., to Inventory, Staff
    };

    return Rental;
};
*/

// --- Example of how to initialize and use (not part of the required output) ---
/*
// config/database.js
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('sakila', 'user', 'password', {
    host: 'localhost',
    dialect: 'mysql', // or 'postgres', 'sqlite', 'mssql'
    logging: false, // Set to true to see SQL queries in console
});
module.exports = sequelize;

// app.js or index.js
const sequelize = require('./config/database');
const CustomerModel = require('./models/customer.model')(sequelize);
const RentalModel = require('./models/rental.model')(sequelize);

// Define associations after all models are loaded
Object.values(sequelize.models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(sequelize.models));

const RentalRepository = require('./repositories/rental.repository');
const rentalRepository = new RentalRepository(sequelize.models, sequelize);

async function runExample() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Example Usage:
        // 1. Find all rentals
        const allRentals = await rentalRepository.findAll();
        console.log(`Found ${allRentals.length} rentals.`);

        // 2. Find rental by ID
        const rentalIdToFind = 1; // Replace with an actual rental ID
        const rentalById = await rentalRepository.findById(rentalIdToFind);
        if (rentalById) {
            console.log(`Rental by ID ${rentalIdToFind}:`, rentalById.toJSON());
        } else {
            console.log(`Rental with ID ${rentalIdToFind} not found.`);
        }

        // 3. Get rental by specific rental ID (custom method)
        const specificRental = await rentalRepository.getRentalByRentalId(rentalIdToFind);
        if (specificRental) {
            console.log(`Specific Rental by ID ${rentalIdToFind}:`, specificRental.toJSON());
        }

        // 4. Get rentals by customer ID (native query)
        const customerIdToFind = 1; // Replace with an actual customer ID
        const rentalsByCustomer = await rentalRepository.getRentalByCustomerId(customerIdToFind);
        console.log(`Rentals for Customer ID ${customerIdToFind}:`, rentalsByCustomer.map(r => r.toJSON()));

        // 5. Count rentals
        const rentalCount = await rentalRepository.count();
        console.log(`Total number of rentals: ${rentalCount}`);

        // 6. Create a new rental
        const newRentalData = {
            rentalDate: new Date(),
            inventoryId: 100, // Ensure this exists in your inventory table
            customerId: 1,    // Ensure this exists in your customer table
            staffId: 1,       // Ensure this exists in your staff table
            // returnDate can be null initially
        };
        const createdRental = await rentalRepository.save(newRentalData);
        console.log('Created new rental:', createdRental.toJSON());

        // 7. Update an existing rental
        if (createdRental) {
            const updatedRentalData = {
                rentalId: createdRental.rentalId,
                returnDate: new Date(),
                lastUpdate: new Date(), // Manually update lastUpdate if not handled by DB trigger
            };
            const updatedRental = await rentalRepository.save(updatedRentalData);
            console.log('Updated rental:', updatedRental.toJSON());

            // 8. Delete a rental
            const deletedRows = await rentalRepository.delete(updatedRental);
            console.log(`Deleted ${deletedRows} rental(s) with ID ${updatedRental.rentalId}.`);
        }

    } catch (error) {
        console.error('Unable to connect to the database or perform operations:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

runExample();
*/