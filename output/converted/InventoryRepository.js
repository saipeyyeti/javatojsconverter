// inventoryRepository.js

/**
 * @file This module provides an abstraction layer for data access operations
 *       related to the Inventory entity using Sequelize ORM, mirroring the
 *       functionality of the Java Spring Data JPA InventoryRepository.
 */

const { Sequelize, DataTypes, Op } = require('sequelize');

// --- Sequelize Setup (In a real application, this would typically be in a separate config/db file) ---
// This section sets up a mock Sequelize instance and defines the models
// required by the InventoryRepository. You would replace this with your actual
// database connection and model definitions.

/**
 * Initializes and returns a Sequelize instance.
 * Replace with your actual database connection details.
 * @returns {Sequelize} The Sequelize instance.
 */
const initializeSequelize = () => {
    // Example: Connecting to a MySQL database
    return new Sequelize('sakila_db', 'user', 'password', {
        host: 'localhost',
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
};

const sequelize = initializeSequelize();

/**
 * Defines the Inventory model for Sequelize.
 * @param {Sequelize} sequelize The Sequelize instance.
 * @returns {import('sequelize').ModelCtor<import('sequelize').Model>} The Inventory model.
 */
const defineInventoryModel = (sequelize) => {
    const Inventory = sequelize.define('Inventory', {
        inventory_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'inventory_id' // Explicitly map to snake_case column in DB
        },
        film_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'film_id'
        },
        store_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'store_id'
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'last_update'
        }
    }, {
        tableName: 'inventory', // Explicitly set table name
        timestamps: false // Sakila tables typically don't use createdAt/updatedAt
    });
    return Inventory;
};

/**
 * Defines the Rental model for Sequelize.
 * @param {Sequelize} sequelize The Sequelize instance.
 * @returns {import('sequelize').ModelCtor<import('sequelize').Model>} The Rental model.
 */
const defineRentalModel = (sequelize) => {
    const Rental = sequelize.define('Rental', {
        rental_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'rental_id'
        },
        rental_date: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'rental_date'
        },
        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'inventory_id'
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'customer_id'
        },
        return_date: {
            type: DataTypes.DATE,
            field: 'return_date'
        },
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'staff_id'
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'last_update'
        }
    }, {
        tableName: 'rental',
        timestamps: false
    });
    return Rental;
};

// Initialize models
const Inventory = defineInventoryModel(sequelize);
const Rental = defineRentalModel(sequelize);

// Define associations: Inventory has many Rentals, Rental belongs to Inventory
// This is crucial for the `getInventoriesByInventoryId` method's join.
Inventory.hasMany(Rental, { foreignKey: 'inventory_id', as: 'rentals' });
Rental.belongsTo(Inventory, { foreignKey: 'inventory_id' });

// --- End Sequelize Setup ---


/**
 * @typedef {object} InventoryEntity
 * @property {number} inventory_id - The unique identifier for the inventory item.
 * @property {number} film_id - The ID of the film associated with this inventory item.
 * @property {number} store_id - The ID of the store where this inventory item is located.
 * @property {Date} last_update - The timestamp of the last update to this record.
 * @property {Array<object>} [rentals] - Optional: An array of associated rental objects, if included in the query.
 */

/**
 * `InventoryRepository` is a data access object (DAO) that provides an abstraction layer
 * for interacting with the `inventory` table in the database. It leverages Sequelize ORM
 * to perform CRUD and custom query operations for `Inventory` entities.
 *
 * This class mirrors the functionality of the Java Spring Data JPA `InventoryRepository`
 * interface, providing asynchronous methods with proper error handling and JSDoc comments.
 */
class InventoryRepository {
    /**
     * Creates an instance of InventoryRepository.
     * @param {import('sequelize').ModelCtor<import('sequelize').Model>} inventoryModel The Sequelize Inventory model.
     * @param {import('sequelize').ModelCtor<import('sequelize').Model>} rentalModel The Sequelize Rental model.
     */
    constructor(inventoryModel, rentalModel) {
        this.Inventory = inventoryModel;
        this.Rental = rentalModel;
        this.sequelize = sequelize; // Expose sequelize instance if needed for raw queries or transactions
    }

    /**
     * Retrieves a single `Inventory` record based on its `inventory_id`.
     * This method performs an `INNER JOIN` with the `rental` table.
     * The join ensures that the inventory item exists and has at least one associated rental.
     * It primarily fetches the inventory details.
     *
     * @param {number} inventoryId The ID of the inventory item to retrieve.
     * @returns {Promise<InventoryEntity | null>} A promise that resolves to an `InventoryEntity` object
     *                                            (including associated rentals if found) if the inventory
     *                                            item exists and has rentals, otherwise `null`.
     * @throws {Error} If a database error occurs during the retrieval process.
     */
    async getInventoriesByInventoryId(inventoryId) {
        try {
            // The original Java query uses a native INNER JOIN to rental.
            // Sequelize's `findOne` with `include` and `required: true` achieves this
            // in an ORM-idiomatic way, returning a model instance.
            const inventory = await this.Inventory.findOne({
                where: { inventory_id: inventoryId },
                include: [{
                    model: this.Rental,
                    as: 'rentals', // Must match the alias defined in the association
                    required: true // This translates to an INNER JOIN
                }]
            });

            // Convert the Sequelize model instance to a plain JavaScript object
            // for consistency and easier data manipulation in service layers.
            return inventory ? inventory.toJSON() : null;
        } catch (error) {
            console.error(`[InventoryRepository] Error fetching inventory by ID ${inventoryId}:`, error);
            throw new Error(`Failed to retrieve inventory with ID ${inventoryId}: ${error.message}`);
        }
    }

    /**
     * Deletes one or more `Inventory` records from the database.
     * This method deletes inventory items based on `film_id`, implying that
     * it's designed to remove all copies of a specific film from inventory.
     *
     * @param {number} filmId The ID of the film whose inventory items are to be deleted.
     * @returns {Promise<number>} A promise that resolves to the number of deleted records.
     * @throws {Error} If a database error occurs during the deletion process.
     */
    async deleteInventoryByInventoryId(filmId) {
        try {
            // Sequelize's `destroy` method directly handles DELETE operations
            // based on a `where` clause.
            const deletedCount = await this.Inventory.destroy({
                where: { film_id: filmId }
            });
            return deletedCount;
        } catch (error) {
            console.error(`[InventoryRepository] Error deleting inventory for film ID ${filmId}:`, error);
            throw new Error(`Failed to delete inventory items for film ID ${filmId}: ${error.message}`);
        }
    }

    /**
     * Returns the total number of `Inventory` records present in the `inventory` table.
     *
     * @returns {Promise<number>} A promise that resolves to the total count of inventory items.
     * @throws {Error} If a database error occurs during the counting process.
     */
    async getInventoryCount() {
        try {
            // Sequelize's `count` method directly translates to a `SELECT COUNT(*)` query.
            const count = await this.Inventory.count();
            return count;
        } catch (error) {
            console.error("[InventoryRepository] Error getting inventory count:", error);
            throw new Error(`Failed to get inventory count: ${error.message}`);
        }
    }

    // --- Optional: Basic CRUD operations equivalent to JpaRepository's inherited methods ---
    // These methods are not explicitly defined in the original Java interface but are
    // part of the inherited functionality of JpaRepository. They are included here
    // to demonstrate how common CRUD operations would be handled in this repository.

    /**
     * Finds an Inventory item by its primary key (`inventory_id`).
     * Equivalent to `JpaRepository.findById()`.
     * @param {number} inventoryId The primary key of the inventory item.
     * @returns {Promise<InventoryEntity | null>} A promise that resolves to the Inventory object if found, otherwise null.
     * @throws {Error} If a database error occurs.
     */
    async findById(inventoryId) {
        try {
            const inventory = await this.Inventory.findByPk(inventoryId);
            return inventory ? inventory.toJSON() : null;
        } catch (error) {
            console.error(`[InventoryRepository] Error finding inventory by ID ${inventoryId}:`, error);
            throw new Error(`Failed to find inventory by ID ${inventoryId}: ${error.message}`);
        }
    }

    /**
     * Saves a new Inventory item or updates an existing one.
     * If `inventory_id` is provided and exists, it updates the record.
     * Otherwise, it creates a new record.
     * Equivalent to `JpaRepository.save()`.
     * @param {object} inventoryData The data for the inventory item.
     * @returns {Promise<InventoryEntity>} A promise that resolves to the saved/updated Inventory object.
     * @throws {Error} If a database error occurs.
     */
    async save(inventoryData) {
        try {
            if (inventoryData.inventory_id) {
                const [updatedRows] = await this.Inventory.update(inventoryData, {
                    where: { inventory_id: inventoryData.inventory_id }
                });
                if (updatedRows > 0) {
                    const updatedInventory = await this.Inventory.findByPk(inventoryData.inventory_id);
                    return updatedInventory.toJSON();
                }
                // If no rows were updated, it means the ID didn't exist.
                // In Spring Data JPA's save, if an ID is present but not found, it typically throws an error
                // or creates a new entity depending on configuration/context.
                // For simplicity here, if ID is present but no update, we'll try to create.
                // A more robust solution might explicitly check for existence first.
            }
            // If no inventory_id or update failed, create a new record.
            const newInventory = await this.Inventory.create(inventoryData);
            return newInventory.toJSON();
        } catch (error) {
            console.error("[InventoryRepository] Error saving inventory:", error);
            throw new Error(`Failed to save inventory: ${error.message}`);
        }
    }

    /**
     * Retrieves all Inventory records.
     * Equivalent to `JpaRepository.findAll()`.
     * @returns {Promise<InventoryEntity[]>} A promise that resolves to an array of Inventory objects.
     * @throws {Error} If a database error occurs.
     */
    async findAll() {
        try {
            const inventories = await this.Inventory.findAll();
            return inventories.map(inv => inv.toJSON());
        } catch (error) {
            console.error("[InventoryRepository] Error fetching all inventories:", error);
            throw new Error(`Failed to retrieve all inventories: ${error.message}`);
        }
    }

    /**
     * Deletes an Inventory item by its primary key (`inventory_id`).
     * Equivalent to `JpaRepository.deleteById()`.
     * @param {number} inventoryId The primary key of the inventory item to delete.
     * @returns {Promise<number>} A promise that resolves to the number of deleted records (0 or 1).
     * @throws {Error} If a database error occurs.
     */
    async deleteById(inventoryId) {
        try {
            const deletedCount = await this.Inventory.destroy({
                where: { inventory_id: inventoryId }
            });
            return deletedCount;
        } catch (error) {
            console.error(`[InventoryRepository] Error deleting inventory by ID ${inventoryId}:`, error);
            throw new Error(`Failed to delete inventory by ID ${inventoryId}: ${error.message}`);
        }
    }
}

// Export an instance of the repository.
// This allows for easy import and use throughout the application,
// promoting a singleton-like pattern for the data access layer.
module.exports = new InventoryRepository(Inventory, Rental);

// You might also want to export the sequelize instance and models
// if they are needed elsewhere (e.g., for migrations or other repositories).
module.exports.sequelize = sequelize;
module.exports.InventoryModel = Inventory;
module.exports.RentalModel = Rental;