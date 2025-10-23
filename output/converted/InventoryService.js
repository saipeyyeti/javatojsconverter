```javascript
/**
 * @typedef {object} Inventory
 * @property {number} inventoryId - The unique identifier for the inventory item.
 * @property {number} filmId - The ID of the film associated with this inventory item.
 * @property {number} storeId - The ID of the store where this inventory item is located.
 * @property {Date} lastUpdate - The timestamp of the last update to this inventory item.
 */

/**
 * @interface InventoryRepository
 * @description Defines the contract for the data access layer for Inventory entities.
 * In a real Node.js application, this would typically be an ORM model (e.g., a Sequelize model,
 * a Mongoose model) or a custom Data Access Object (DAO) that interacts directly with the database.
 * The methods are expected to be asynchronous and return Promises.
 */
class InventoryRepository {
    /**
     * Retrieves all inventory items from the data store.
     * @returns {Promise<Inventory[]>} A promise that resolves to an array of Inventory objects.
     */
    async findAll() {
        throw new Error('InventoryRepository.findAll() must be implemented by a concrete repository.');
    }

    /**
     * Retrieves a single inventory item by its unique identifier.
     * @param {number} id - The unique identifier of the inventory item.
     * @returns {Promise<Inventory|null>} A promise that resolves to an Inventory object or null if not found.
     */
    async findById(id) {
        throw new Error('InventoryRepository.findById() must be implemented by a concrete repository.');
    }

    /**
     * Deletes an inventory item from the data store by its unique identifier.
     * @param {number} id - The unique identifier of the inventory item to delete.
     * @returns {Promise<number>} A promise that resolves to the number of deleted items (e.g., 1 for success, 0 for not found).
     */
    async deleteById(id) {
        throw new Error('InventoryRepository.deleteById() must be implemented by a concrete repository.');
    }

    /**
     * Retrieves the total count of inventory items in the data store.
     * @returns {Promise<number>} A promise that resolves to the total count of Inventory objects.
     */
    async count() {
        throw new Error('InventoryRepository.count() must be implemented by a concrete repository.');
    }
}

/**
 * @class InventoryService
 * @description A service layer component designed to encapsulate business logic
 * and orchestrate data access operations related to `Inventory` entities.
 * It acts as an intermediary between the presentation/controller layer and the data access layer.
 *
 * This service provides methods for retrieving, deleting, and counting inventory items,
 * ensuring proper error handling and asynchronous execution using `async/await`.
 */
class InventoryService {
    /**
     * Creates an instance of InventoryService.
     * This constructor uses Dependency Injection to receive an `InventoryRepository` instance,
     * promoting loose coupling and testability.
     *
     * @param {InventoryRepository} inventoryRepository - The repository for Inventory data access.
     *   This dependency is expected to be a concrete implementation of the `InventoryRepository` interface.
     * @throws {Error} If `inventoryRepository` is not provided, indicating a misconfiguration.
     */
    constructor(inventoryRepository) {
        if (!inventoryRepository) {
            throw new Error('InventoryService: inventoryRepository must be provided.');
        }
        /**
         * @private
         * @type {InventoryRepository}
         */
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Retrieves a list of all inventory items from the database.
     * Delegates the data retrieval operation to the `inventoryRepository`.
     *
     * @returns {Promise<Inventory[]>} A promise that resolves to an array of all Inventory entities.
     * @throws {Error} If there is an underlying issue with data retrieval (e.g., database error).
     */
    async getAllInventory() {
        try {
            const inventories = await this.inventoryRepository.findAll();
            return inventories;
        } catch (error) {
            console.error(`[InventoryService] Error in getAllInventory: ${error.message}`);
            // Re-throw a more generic error to avoid exposing internal database details
            throw new Error('Failed to retrieve all inventory items due to a server error.');
        }
    }

    /**
     * Retrieves a single inventory item based on its unique `inventoryId`.
     * Delegates the data retrieval operation to the `inventoryRepository`.
     *
     * @param {number} id - The unique identifier of the inventory item.
     * @returns {Promise<Inventory|null>} A promise that resolves to the Inventory entity
     *   or `null` if no item is found with the given ID.
     * @throws {Error} If the provided `id` is invalid or if there's an issue retrieving the item.
     */
    async getInventoriesById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid inventory ID provided. ID must be a positive integer.');
        }
        try {
            const inventory = await this.inventoryRepository.findById(id);
            return inventory;
        } catch (error) {
            console.error(`[InventoryService] Error in getInventoriesById (ID: ${id}): ${error.message}`);
            throw new Error(`Failed to retrieve inventory item with ID ${id} due to a server error.`);
        }
    }

    /**
     * Deletes an inventory item from the database identified by its `inventoryId`.
     * This operation is typically handled transactionally by the underlying ORM or database
     * to ensure data consistency.
     *
     * @param {number} id - The unique identifier of the inventory item to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the item was successfully deleted.
     * @throws {Error} If the provided `id` is invalid, the item is not found, or a database error occurs.
     */
    async deleteInventoryItemById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid inventory ID provided. ID must be a positive integer.');
        }
        try {
            // In a real application using an ORM (e.g., Sequelize), explicit transaction management
            // might be implemented here if multiple operations needed to be atomic:
            // await this.inventoryRepository.sequelize.transaction(async (t) => {
            //     const deletedCount = await this.inventoryRepository.destroy({ where: { inventoryId: id }, transaction: t });
            //     if (deletedCount === 0) {
            //         throw new Error(`Inventory item with ID ${id} not found for deletion.`);
            //     }
            // });
            // For a generic repository, we assume `deleteById` handles atomicity or is part of a larger transaction context.
            const deletedCount = await this.inventoryRepository.deleteById(id);
            if (deletedCount === 0) {
                // It's good practice to throw a specific error if the item wasn't found for deletion.
                throw new Error(`Inventory item with ID ${id} not found for deletion.`);
            }
            return true; // Indicate successful deletion
        } catch (error) {
            console.error(`[InventoryService] Error in deleteInventoryItemById (ID: ${id}): ${error.message}`);
            // Re-throw the specific "not found" error if it originated from the repository,
            // otherwise throw a generic server error.
            if (error.message.includes('not found for deletion')) {
                throw error;
            }
            throw new Error(`Failed to delete inventory item with ID ${id} due to a server error.`);
        }
    }

    /**
     * Retrieves the total number of inventory records currently stored in the database.
     * Delegates the counting operation to the `inventoryRepository`.
     *
     * @returns {Promise<number>} A promise that resolves to the total count of Inventory entities.
     * @throws {Error} If there is an underlying issue with data retrieval (e.g., database error).
     */
    async getInventoryCount() {
        try {
            const count = await this.inventoryRepository.count();
            return count;
        } catch (error) {
            console.error(`[InventoryService] Error in getInventoryCount: ${error.message}`);
            throw new Error('Failed to retrieve inventory count due to a server error.');
        }
    }
}

module.exports = InventoryService;
```