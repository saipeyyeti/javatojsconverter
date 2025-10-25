/**
 * @typedef {object} Inventory
 * @property {number} inventoryId - The unique ID of the inventory item.
 * @property {number} filmId - The ID of the film associated with this inventory item.
 * @property {number} storeId - The ID of the store where this inventory item is located.
 * @property {Date} lastUpdate - The timestamp of the last update to this inventory item.
 */

/**
 * @interface InventoryRepository
 * @description
 * Represents the data access layer for Inventory entities.
 * This interface defines the contract for interacting with the underlying data store.
 * All methods are expected to return Promises, reflecting asynchronous database operations.
 */
class InventoryRepository {
    /**
     * Retrieves all inventory items.
     * @returns {Promise<Array<Inventory>>} A promise that resolves to an array of Inventory objects.
     * @throws {Error} If the method is not implemented by the concrete repository.
     */
    async findAll() {
        throw new Error('Method "findAll" must be implemented by the concrete InventoryRepository.');
    }

    /**
     * Retrieves a single inventory item by its unique ID.
     * @param {number} id - The unique ID of the inventory item.
     * @returns {Promise<Inventory|null>} A promise that resolves to an Inventory object if found, otherwise null.
     * @throws {Error} If the method is not implemented by the concrete repository.
     */
    async getInventoriesByInventoryId(id) {
        throw new Error('Method "getInventoriesByInventoryId" must be implemented by the concrete InventoryRepository.');
    }

    /**
     * Deletes an inventory item by its unique ID.
     * @param {number} id - The unique ID of the inventory item to delete.
     * @returns {Promise<number>} A promise that resolves to the number of affected rows (e.g., 1 if deleted, 0 if not found).
     * @throws {Error} If the method is not implemented by the concrete repository.
     */
    async deleteInventoryByInventoryId(id) {
        throw new Error('Method "deleteInventoryByInventoryId" must be implemented by the concrete InventoryRepository.');
    }

    /**
     * Retrieves the total count of inventory items.
     * @returns {Promise<number>} A promise that resolves to the total count of inventory items.
     * @throws {Error} If the method is not implemented by the concrete repository.
     */
    async getInventoryCount() {
        throw new Error('Method "getInventoryCount" must be implemented by the concrete InventoryRepository.');
    }
}

/**
 * @class InventoryService
 * @description
 * This class is a typical Node.js service component designed to encapsulate
 * business logic related to `Inventory` entities. It acts as an intermediary
 * between the presentation/controller layer and the data access layer
 * (represented by `InventoryRepository`).
 *
 * It adheres to the Service Layer pattern, uses Dependency Injection for
 * `InventoryRepository`, and handles asynchronous operations with `async/await`.
 * Proper error handling and JSDoc comments are included for production readiness.
 */
class InventoryService {
    /**
     * @private
     * @type {InventoryRepository}
     */
    inventoryRepository;

    /**
     * Creates an instance of InventoryService.
     * This constructor is used for Dependency Injection, where a concrete
     * implementation of `InventoryRepository` is provided.
     * @param {InventoryRepository} inventoryRepository - The data access object (DAO)
     *                                                  for interacting with `Inventory` data.
     * @throws {Error} If `inventoryRepository` is not provided.
     */
    constructor(inventoryRepository) {
        if (!inventoryRepository) {
            throw new Error('InventoryRepository must be provided to InventoryService during instantiation.');
        }
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Retrieves a list of all `Inventory` records from the database.
     * Delegates this task directly to the `inventoryRepository.findAll()` method.
     * @returns {Promise<Array<Inventory>>} A promise that resolves to a list of `Inventory` objects.
     * @throws {Error} If there is an issue retrieving inventory items from the database.
     */
    async getAllInventory() {
        try {
            // In a real application, you might use a dedicated logger instead of console.log
            console.log('InventoryService: Attempting to retrieve all inventory items.');
            const inventories = await this.inventoryRepository.findAll();
            console.log(`InventoryService: Successfully retrieved ${inventories.length} inventory items.`);
            return inventories;
        } catch (error) {
            console.error(`InventoryService: Error retrieving all inventory items: ${error.message}`);
            // Re-throw a new error to abstract the underlying data access error
            throw new Error(`Failed to retrieve all inventory items: ${error.message}`);
        }
    }

    /**
     * Retrieves a single `Inventory` record based on its unique `inventoryId`.
     * Delegates to a custom method `getInventoriesByInventoryId()` on the repository.
     * @param {number} id - The unique identifier of the inventory item.
     * @returns {Promise<Inventory|null>} A promise that resolves to an `Inventory` object if found, otherwise `null`.
     * @throws {Error} If the provided ID is invalid or if there's an issue retrieving the item.
     */
    async getInventoriesById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid inventory ID provided. ID must be a positive integer.');
        }
        try {
            console.log(`InventoryService: Attempting to retrieve inventory item with ID: ${id}`);
            const inventory = await this.inventoryRepository.getInventoriesByInventoryId(id);
            if (inventory) {
                console.log(`InventoryService: Found inventory item with ID: ${id}.`);
            } else {
                console.log(`InventoryService: No inventory item found with ID: ${id}.`);
            }
            return inventory;
        } catch (error) {
            console.error(`InventoryService: Error retrieving inventory item by ID ${id}: ${error.message}`);
            throw new Error(`Failed to retrieve inventory item with ID ${id}: ${error.message}`);
        }
    }

    /**
     * Deletes an `Inventory` record from the database identified by its `inventoryId`.
     * This operation is designed to be atomic. In Node.js, for a single database
     * operation like a delete, the underlying database driver or ORM often handles
     * the atomicity. If multiple repository operations were involved, explicit
     * transaction management (e.g., using an ORM's transaction API) would be
     * implemented here in the service layer.
     * @param {number} id - The unique identifier of the inventory item to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the item was successfully deleted,
     *                             `false` if no item with the given ID was found to delete.
     * @throws {Error} If the provided ID is invalid or if there's an issue deleting the item.
     */
    async deleteInventoryItemById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid inventory ID provided. ID must be a positive integer.');
        }
        try {
            console.log(`InventoryService: Attempting to delete inventory item with ID: ${id}`);
            const affectedRows = await this.inventoryRepository.deleteInventoryByInventoryId(id);

            if (affectedRows > 0) {
                console.log(`InventoryService: Successfully deleted inventory item with ID: ${id}. Affected rows: ${affectedRows}`);
                return true;
            } else {
                console.log(`InventoryService: No inventory item found with ID ${id} to delete.`);
                return false;
            }
        } catch (error) {
            console.error(`InventoryService: Error deleting inventory item by ID ${id}: ${error.message}`);
            throw new Error(`Failed to delete inventory item with ID ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves the total number of `Inventory` records present in the database.
     * Delegates to a custom method `getInventoryCount()` on the repository.
     * @returns {Promise<number>} A promise that resolves to the total count of `Inventory` items.
     * @throws {Error} If there is an issue retrieving the inventory count.
     */
    async getInventoryCount() {
        try {
            console.log('InventoryService: Attempting to retrieve inventory count.');
            const count = await this.inventoryRepository.getInventoryCount();
            console.log(`InventoryService: Total inventory count: ${count}.`);
            return count;
        } catch (error) {
            console.error(`InventoryService: Error retrieving inventory count: ${error.message}`);
            throw new Error(`Failed to retrieve inventory count: ${error.message}`);
        }
    }
}

// Export the service class for use in other modules (e.g., controllers)
module.exports = InventoryService;