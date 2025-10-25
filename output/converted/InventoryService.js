```javascript
/**
 * @typedef {object} Inventory
 * @property {number} inventoryId - The unique ID of the inventory item.
 * @property {number} filmId - The ID of the film associated with this inventory.
 * @property {number} storeId - The ID of the store where this inventory is located.
 * @property {Date} lastUpdate - The timestamp of the last update to this inventory item.
 */

/**
 * @interface InventoryRepository
 * @description
 * This interface defines the contract for the data access layer for Inventory entities.
 * In a real application, this would be implemented by an ORM (e.g., Sequelize, TypeORM)
 * or a direct database client. All methods are expected to be asynchronous and return Promises.
 */
class InventoryRepository {
    /**
     * Retrieves all Inventory entities from the database.
     * @returns {Promise<Inventory[]>} A promise that resolves to an array of Inventory objects.
     */
    async findAll() {
        throw new Error('Method "findAll" not implemented in InventoryRepository.');
    }

    /**
     * Retrieves a single Inventory entity by its unique inventoryId.
     * @param {number} id - The unique identifier of the inventory item.
     * @returns {Promise<Inventory | null>} A promise that resolves to an Inventory object if found, otherwise null.
     */
    async getInventoriesByInventoryId(id) {
        throw new Error('Method "getInventoriesByInventoryId" not implemented in InventoryRepository.');
    }

    /**
     * Deletes an Inventory entity from the database by its unique inventoryId.
     * This method is expected to handle its own transactional context for the deletion.
     * @param {number} id - The unique identifier of the inventory item to delete.
     * @returns {Promise<number>} A promise that resolves to the number of deleted records (0 or 1).
     */
    async deleteInventoryByInventoryId(id) {
        throw new Error('Method "deleteInventoryByInventoryId" not implemented in InventoryRepository.');
    }

    /**
     * Retrieves the total count of Inventory entities in the database.
     * @returns {Promise<number>} A promise that resolves to the total count of inventory items.
     */
    async getInventoryCount() {
        throw new Error('Method "getInventoryCount" not implemented in InventoryRepository.');
    }
}

/**
 * Custom error class for when an inventory item is not found.
 * @extends Error
 */
class InventoryNotFoundError extends Error {
    /**
     * Creates an instance of InventoryNotFoundError.
     * @param {number} id - The ID of the inventory item that was not found.
     */
    constructor(id) {
        super(`Inventory item with ID ${id} not found.`);
        this.name = 'InventoryNotFoundError';
        this.statusCode = 404; // Common HTTP status for Not Found
    }
}

/**
 * @class InventoryService
 * @description
 * This service class encapsulates the business logic related to Inventory entities.
 * It acts as an intermediary layer between higher-level components (e.g., REST controllers)
 * and the data access layer (InventoryRepository), abstracting away the specifics of data persistence.
 *
 * It leverages Dependency Injection for the InventoryRepository, promoting loose coupling and testability.
 * All data operations are asynchronous, using `async/await` for cleaner code.
 * Proper error handling is implemented, including a specific error for 'not found' scenarios.
 */
class InventoryService {
    /**
     * @private
     * @type {InventoryRepository}
     */
    inventoryRepository;

    /**
     * Creates an instance of InventoryService.
     * This constructor uses Dependency Injection to receive an instance of `InventoryRepository`.
     * @param {InventoryRepository} inventoryRepository - The data access layer for Inventory entities.
     *   This dependency is crucial for the service to interact with the database.
     * @throws {Error} If `inventoryRepository` is not provided.
     */
    constructor(inventoryRepository) {
        if (!inventoryRepository) {
            throw new Error('InventoryService: InventoryRepository must be provided.');
        }
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Retrieves a list of all Inventory entities from the database.
     * @async
     * @returns {Promise<Inventory[]>} A promise that resolves to an array of Inventory objects.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getAllInventory() {
        try {
            return await this.inventoryRepository.findAll();
        } catch (error) {
            console.error('InventoryService.getAllInventory: Failed to retrieve all inventory items.', error);
            throw new Error('Failed to retrieve all inventory items due to a database error.');
        }
    }

    /**
     * Retrieves a single Inventory entity based on its unique `inventoryId`.
     * @async
     * @param {number} id - The unique identifier of the inventory item.
     * @returns {Promise<Inventory>} A promise that resolves to an Inventory object.
     * @throws {Error} If the provided ID is invalid (not a positive number).
     * @throws {InventoryNotFoundError} If no inventory item is found with the given ID.
     * @throws {Error} If an unexpected error occurs during data retrieval from the repository.
     */
    async getInventoriesById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid inventory ID provided. ID must be a positive integer.');
        }

        try {
            const inventory = await this.inventoryRepository.getInventoriesByInventoryId(id);
            if (!inventory) {
                throw new InventoryNotFoundError(id);
            }
            return inventory;
        } catch (error) {
            if (error instanceof InventoryNotFoundError) {
                throw error; // Re-throw specific not found error
            }
            console.error(`InventoryService.getInventoriesById: Failed to retrieve inventory item with ID ${id}.`, error);
            throw new Error(`Failed to retrieve inventory item with ID ${id} due to a database error.`);
        }
    }

    /**
     * Deletes an Inventory entity from the database identified by its `inventoryId`.
     * This operation is expected to be handled transactionally by the underlying repository
     * to ensure data consistency.
     * @async
     * @param {number} id - The unique identifier of the inventory item to delete.
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     * @throws {Error} If the provided ID is invalid (not a positive number).
     * @throws {InventoryNotFoundError} If no inventory item is found with the given ID to delete.
     * @throws {Error} If an error occurs during the deletion process in the repository.
     */
    async deleteInventoryItemById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid inventory ID provided. ID must be a positive integer.');
        }

        try {
            // Assuming the repository method returns the number of affected rows (0 or 1)
            const deletedCount = await this.inventoryRepository.deleteInventoryByInventoryId(id);
            if (deletedCount === 0) {
                throw new InventoryNotFoundError(id);
            }
            // No explicit return value needed for void operations
        } catch (error) {
            if (error instanceof InventoryNotFoundError) {
                throw error; // Re-throw specific not found error
            }
            console.error(`InventoryService.deleteInventoryItemById: Failed to delete inventory item with ID ${id}.`, error);
            throw new Error(`Failed to delete inventory item with ID ${id} due to a database error.`);
        }
    }

    /**
     * Retrieves the total number of Inventory entities currently stored in the database.
     * @async
     * @returns {Promise<number>} A promise that resolves to the total count of inventory items.
     * @throws {Error} If an error occurs during the count retrieval from the repository.
     */
    async getInventoryCount() {
        try {
            return await this.inventoryRepository.getInventoryCount();
        } catch (error) {
            console.error('InventoryService.getInventoryCount: Failed to retrieve inventory count.', error);
            throw new Error('Failed to retrieve inventory count due to a database error.');
        }
    }
}

// Export the service class and custom error for use in other modules
module.exports = {
    InventoryService,
    InventoryNotFoundError,
    // Optionally, export the InventoryRepository interface for type hinting/documentation
    // if you want to make it explicit for consumers of the service.
    // InventoryRepository
};
```