```javascript
// --- config/database.js ---
/**
 * @file Database configuration and Sequelize instance initialization.
 * @module config/database
 */

const { Sequelize } = require('sequelize');

/**
 * Initializes and returns a Sequelize instance.
 * In a real application, these credentials would come from environment variables.
 * @returns {Sequelize} The initialized Sequelize instance.
 */
const sequelize = new Sequelize('sakila', 'root', 'password', { // Replace with your actual database credentials
    host: 'localhost', // Replace with your actual database host
    dialect: 'mysql',
    logging: false, // Set to true to see SQL queries in console
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

/**
 * Authenticates the connection to the database.
 * @async
 * @function authenticateDatabase
 * @returns {Promise<void>} A promise that resolves if authentication is successful,
 *   or rejects with an error if it fails.
 */
async function authenticateDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Re-throw to indicate a critical failure
    }
}

module.exports = {
    sequelize,
    authenticateDatabase
};

// --- models/inventory.js ---
/**
 * @file Sequelize model definition for the Inventory entity.
 * @module models/inventory
 */

const { DataTypes } = require('sequelize');

/**
 * Defines the Inventory model.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Inventory Sequelize model.
 */
module.exports = (sequelize) => {
    const Inventory = sequelize.define('Inventory', {
        inventory_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        film_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        store_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'inventory',
        timestamps: false, // Assuming 'last_update' is managed by the database or application, not Sequelize's default timestamps
        underscored: true // Use underscored column names (e.g., inventory_id instead of inventoryId)
    });

    return Inventory;
};

// --- models/rental.js ---
/**
 * @file Sequelize model definition for the Rental entity.
 * @module models/rental
 */

const { DataTypes } = require('sequelize');

/**
 * Defines the Rental model.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Rental Sequelize model.
 */
module.exports = (sequelize) => {
    const Rental = sequelize.define('Rental', {
        rental_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        rental_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        inventory_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        return_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'rental',
        timestamps: false, // Assuming 'last_update' is managed by the database or application, not Sequelize's default timestamps
        underscored: true // Use underscored column names (e.g., inventory_id instead of inventoryId)
    });

    return Rental;
};

// --- repositories/inventoryRepository.js ---
/**
 * @file InventoryRepository provides an abstraction layer for database operations
 *       related to the Inventory entity using Sequelize ORM.
 * @module repositories/InventoryRepository
 */

/**
 * @typedef {object} Inventory
 * @property {number} inventory_id - The unique identifier for the inventory item.
 * @property {number} film_id - The ID of the film associated with this inventory item.
 * @property {number} store_id - The ID of the store where the inventory item is located.
 * @property {Date} last_update - The timestamp of the last update.
 */

/**
 * @typedef {object} Rental
 * @property {number} rental_id - The unique identifier for the rental.
 * @property {Date} rental_date - The date the item was rented.
 * @property {number} inventory_id - The ID of the inventory item rented.
 * @property {number} customer_id - The ID of the customer who rented the item.
 * @property {Date|null} return_date - The date the item was returned, or null if not yet returned.
 * @property {number} staff_id - The ID of the staff member who processed the rental.
 * @property {Date} last_update - The timestamp of the last update.
 */

class InventoryRepository {
    /**
     * Creates an instance of InventoryRepository.
     * @param {object} models - An object containing Sequelize models.
     * @param {Model} models.Inventory - The Sequelize Inventory model.
     * @param {Model} models.Rental - The Sequelize Rental model.
     * @param {Sequelize} sequelize - The Sequelize instance for raw queries.
     */
    constructor({ Inventory, Rental, sequelize }) {
        this.Inventory = Inventory;
        this.Rental = Rental;
        this.sequelize = sequelize;

        // Define associations if not already defined globally
        if (!this.Inventory.associations.Rental) {
            this.Inventory.hasMany(this.Rental, { foreignKey: 'inventory_id', as: 'rentals' });
            this.Rental.belongsTo(this.Inventory, { foreignKey: 'inventory_id' });
        }
    }

    /**
     * Persists a new Inventory entity or updates an existing one.
     * If `inventory_id` is present, it attempts an update; otherwise, it creates a new record.
     * @async
     * @param {Inventory} inventoryData - The inventory data to save.
     * @returns {Promise<Inventory>} The saved or updated Inventory entity.
     * @throws {Error} If the save operation fails.
     */
    async save(inventoryData) {
        try {
            if (inventoryData.inventory_id) {
                const [updatedRows] = await this.Inventory.update(inventoryData, {
                    where: { inventory_id: inventoryData.inventory_id }
                });
                if (updatedRows === 0) {
                    // If no rows were updated, it might be a new record or an ID that doesn't exist.
                    // For simplicity, we'll try to create if not found, or just return the existing if no changes.
                    // A more robust solution might check if the record exists first.
                    const existing = await this.Inventory.findByPk(inventoryData.inventory_id);
                    if (existing) return existing; // No changes, return existing
                    return await this.Inventory.create(inventoryData); // If ID was provided but didn't exist
                }
                return await this.Inventory.findByPk(inventoryData.inventory_id);
            } else {
                return await this.Inventory.create(inventoryData);
            }
        } catch (error) {
            console.error(`Error saving inventory: ${error.message}`);
            throw new Error(`Failed to save inventory: ${error.message}`);
        }
    }

    /**
     * Retrieves an Inventory entity by its primary key (`inventory_id`).
     * @async
     * @param {number} id - The primary key (`inventory_id`) of the inventory item.
     * @returns {Promise<Inventory|null>} The Inventory entity if found, otherwise null.
     * @throws {Error} If the find operation fails.
     */
    async findById(id) {
        try {
            return await this.Inventory.findByPk(id);
        } catch (error) {
            console.error(`Error finding inventory by ID ${id}: ${error.message}`);
            throw new Error(`Failed to find inventory by ID: ${error.message}`);
        }
    }

    /**
     * Retrieves all Inventory entities.
     * @async
     * @returns {Promise<Inventory[]>} A list of all Inventory entities.
     * @throws {Error} If the find operation fails.
     */
    async findAll() {
        try {
            return await this.Inventory.findAll();
        } catch (error) {
            console.error(`Error finding all inventories: ${error.message}`);
            throw new Error(`Failed to find all inventories: ${error.message}`);
        }
    }

    /**
     * Deletes an Inventory entity by its primary key (`inventory_id`).
     * @async
     * @param {number} id - The primary key (`inventory_id`) of the inventory item to delete.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If the delete operation fails.
     */
    async deleteById(id) {
        try {
            return await this.Inventory.destroy({
                where: { inventory_id: id }
            });
        } catch (error) {
            console.error(`Error deleting inventory by ID ${id}: ${error.message}`);
            throw new Error(`Failed to delete inventory by ID: ${error.message}`);
        }
    }

    /**
     * Returns the total number of Inventory entities.
     * @async
     * @returns {Promise<number>} The total count of Inventory entities.
     * @throws {Error} If the count operation fails.
     */
    async count() {
        try {
            return await this.Inventory.count();
        } catch (error) {
            console.error(`Error counting inventories: ${error.message}`);
            throw new Error(`Failed to count inventories: ${error.message}`);
        }
    }

    /**
     * Retrieves a single Inventory record based on its `inventory_id`,
     * including associated rental information.
     * This method performs an INNER JOIN with the `rental` table, meaning
     * only inventory items that have at least one associated rental will be returned.
     * @async
     * @param {number} inventoryId - The `inventory_id` to search for.
     * @returns {Promise<Inventory|null>} The Inventory entity with associated rentals if found, otherwise null.
     * @throws {Error} If the query fails.
     */
    async getInventoriesByInventoryId(inventoryId) {
        try {
            // The original Java query uses INNER JOIN, so we use `required: true` for the include.
            const inventory = await this.Inventory.findOne({
                where: { inventory_id: inventoryId },
                include: [{
                    model: this.Rental,
                    as: 'rentals',
                    required: true // Equivalent to INNER JOIN
                }]
            });
            return inventory;
        } catch (error) {
            console.error(`Error retrieving inventory by inventoryId ${inventoryId}: ${error.message}`);
            throw new Error(`Failed to retrieve inventory by inventoryId: ${error.message}`);
        }
    }

    /**
     * Deletes all Inventory records associated with a specific `film_id`.
     * Note: The method name `deleteInventoryByInventoryId` is misleading as it deletes by `film_id`.
     * This behavior is maintained to match the original Java implementation.
     * @async
     * @param {number} filmId - The `film_id` for which to delete inventory items.
     * @returns {Promise<number>} The number of inventory records deleted.
     * @throws {Error} If the delete operation fails.
     */
    async deleteInventoryByInventoryId(filmId) {
        try {
            const deletedRows = await this.Inventory.destroy({
                where: { film_id: filmId }
            });
            return deletedRows;
        } catch (error) {
            console.error(`Error deleting inventory by filmId ${filmId}: ${error.message}`);
            throw new Error(`Failed to delete inventory by filmId: ${error.message}`);
        }
    }

    /**
     * Retrieves the total number of `Inventory` records present in the database.
     * This method is functionally equivalent to the inherited `count()` method,
     * but explicitly uses a direct count query as per the original Java implementation.
     * @async
     * @returns {Promise<number>} The total count of inventory items.
     * @throws {Error} If the count operation fails.
     */
    async getInventoryCount() {
        try {
            return await this.Inventory.count();
        } catch (error) {
            console.error(`Error getting inventory count: ${error.message}`);
            throw new Error(`Failed to get inventory count: ${error.message}`);
        }
    }
}

module.exports = InventoryRepository;

// --- Example Usage (for demonstration, not part of the requested output) ---
/*
(async () => {
    const { sequelize, authenticateDatabase } = require('./config/database');
    const defineInventoryModel = require('./models/inventory');
    const defineRentalModel = require('./models/rental');
    const InventoryRepository = require('./repositories/inventoryRepository');

    try {
        await authenticateDatabase();

        const Inventory = defineInventoryModel(sequelize);
        const Rental = defineRentalModel(sequelize);

        // Define associations after models are defined
        Inventory.hasMany(Rental, { foreignKey: 'inventory_id', as: 'rentals' });
        Rental.belongsTo(Inventory, { foreignKey: 'inventory_id' });

        const inventoryRepository = new InventoryRepository({ Inventory, Rental, sequelize });

        console.log('--- Testing InventoryRepository ---');

        // 1. Get total inventory count
        const totalCount = await inventoryRepository.getInventoryCount();
        console.log(`Total inventory items: ${totalCount}`);

        // 2. Find all inventories
        const allInventories = await inventoryRepository.findAll();
        console.log(`Found ${allInventories.length} inventories.`);
        // console.log('First 5 inventories:', allInventories.slice(0, 5).map(i => i.toJSON()));

        // 3. Find inventory by ID
        const inventoryIdToFind = 1; // Assuming inventory_id 1 exists
        const inventoryById = await inventoryRepository.findById(inventoryIdToFind);
        if (inventoryById) {
            console.log(`Found inventory by ID ${inventoryIdToFind}:`, inventoryById.toJSON());
        } else {
            console.log(`Inventory with ID ${inventoryIdToFind} not found.`);
        }

        // 4. Get inventory with rental info (INNER JOIN behavior)
        const inventoryWithRental = await inventoryRepository.getInventoriesByInventoryId(inventoryIdToFind);
        if (inventoryWithRental) {
            console.log(`Inventory ${inventoryIdToFind} with rental info:`, inventoryWithRental.toJSON());
            console.log(`  Number of rentals: ${inventoryWithRental.rentals.length}`);
        } else {
            console.log(`Inventory ${inventoryIdToFind} (with rentals) not found.`);
        }

        // 5. Create a new inventory item
        const newInventoryData = {
            film_id: 100,
            store_id: 1,
            last_update: new Date()
        };
        const newInventory = await inventoryRepository.save(newInventoryData);
        console.log('Created new inventory:', newInventory.toJSON());

        // 6. Update an existing inventory item
        newInventory.store_id = 2;
        const updatedInventory = await inventoryRepository.save(newInventory.toJSON()); // Pass plain object for update
        console.log('Updated inventory:', updatedInventory.toJSON());

        // 7. Delete inventory by film_id (careful with this in production!)
        //    Let's create a temporary film_id for deletion test
        const tempFilmId = 9999;
        await inventoryRepository.save({ film_id: tempFilmId, store_id: 1 });
        await inventoryRepository.save({ film_id: tempFilmId, store_id: 2 });
        console.log(`Created 2 temp inventories for film_id ${tempFilmId}`);
        const deletedCount = await inventoryRepository.deleteInventoryByInventoryId(tempFilmId);
        console.log(`Deleted ${deletedCount} inventories for film_id ${tempFilmId}.`);

        // 8. Delete by inventory_id
        const deletedByIdCount = await inventoryRepository.deleteById(newInventory.inventory_id);
        console.log(`Deleted ${deletedByIdCount} inventory by its ID ${newInventory.inventory_id}.`);

    } catch (error) {
        console.error('An error occurred during example usage:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
})();
*/
```