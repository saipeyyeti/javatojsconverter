/**
 * @module InventoryModel
 * @description This module defines the Inventory class, a JavaScript model
 *              that mirrors the structure and responsibilities of a JPA entity.
 *              It includes methods for data encapsulation, object identity,
 *              and placeholder asynchronous operations for persistence.
 */

// --- Mock Database / Persistence Layer (for demonstration of async operations) ---
// In a real Node.js application, this would be replaced by an ORM like Sequelize, TypeORM,
// or a direct database client (e.g., pg for PostgreSQL, mysql2 for MySQL).
// This mock simulates asynchronous database interactions.
const mockDatabase = {
    /** @private */
    _data: new Map(),
    /** @private */
    _nextId: 1,

    /**
     * Simulates fetching an inventory item by ID.
     * @param {number} id - The ID of the inventory item.
     * @returns {Promise<object|null>} A promise that resolves to a plain object representing the inventory item, or null if not found.
     */
    async findById(id) {
        return new Promise(resolve => {
            setTimeout(() => {
                const item = this._data.get(id);
                resolve(item ? { ...item } : null); // Return a copy to prevent direct modification of stored data
            }, 100); // Simulate network latency
        });
    },

    /**
     * Simulates saving an inventory item.
     * If the item has no ID, it's treated as a new record and assigned one.
     * @param {object} inventoryData - A plain object representing the inventory item to save.
     * @returns {Promise<object>} A promise that resolves to the saved inventory item data (with ID if new).
     */
    async save(inventoryData) {
        return new Promise(resolve => {
            setTimeout(() => {
                let id = inventoryData.inventoryId;
                if (!id) {
                    id = this._nextId++;
                    inventoryData.inventoryId = id;
                }
                // Ensure lastUpdate is a string for consistent storage in mock
                inventoryData.lastUpdate = new Date().toISOString();
                this._data.set(id, { ...inventoryData }); // Store a copy
                resolve({ ...inventoryData }); // Return a copy of the stored data
            }, 100);
        });
    },

    /**
     * Simulates deleting an inventory item by ID.
     * @param {number} id - The ID of the inventory item to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if deleted, false otherwise.
     */
    async delete(id) {
        return new Promise(resolve => {
            setTimeout(() => {
                const deleted = this._data.delete(id);
                resolve(deleted);
            }, 100);
        });
    },

    /**
     * Simulates fetching all inventory items.
     * @returns {Promise<object[]>} A promise that resolves to an array of plain objects representing inventory items.
     */
    async findAll() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(Array.from(this._data.values()).map(item => ({ ...item }))); // Return copies
            }, 100);
        });
    }
};
// --- End Mock Database ---


/**
 * @class Inventory
 * @description Represents an inventory item, designed as a Plain Old JavaScript Object (POJO)
 *              that can be mapped to a database table. It encapsulates data for a single
 *              inventory record, provides object identity, and includes placeholder
 *              asynchronous methods for persistence operations.
 *
 *              This class serves as a Data Transfer Object (DTO) or Value Object (VO)
 *              for transferring inventory data between application layers.
 *              It embodies the concept of an Object-Relational Mapping (ORM) entity
 *              in a JavaScript context, abstracting database interactions.
 */
class Inventory {
    /**
     * @private
     * @type {number|null}
     * @description The unique identifier for the inventory item. Corresponds to `inventory_id` in the database.
     */
    _inventoryId = null;

    /**
     * @private
     * @type {number|null}
     * @description The ID of the film associated with this inventory item. Corresponds to `film_id` in the database.
     */
    _filmId = null;

    /**
     * @private
     * @type {Date|null}
     * @description The timestamp indicating when the inventory record was last modified. Corresponds to `last_update` in the database.
     */
    _lastUpdate = null;

    /**
     * Creates an instance of Inventory.
     * @param {object} [data] - Optional initial data for the inventory item.
     * @param {number} [data.inventoryId] - The unique identifier for the inventory item.
     * @param {number} [data.filmId] - The ID of the film associated with this inventory item.
     * @param {Date|string} [data.lastUpdate] - The timestamp of the last update. Can be a Date object or a string parseable by `new Date()`.
     */
    constructor({ inventoryId, filmId, lastUpdate } = {}) {
        if (inventoryId !== undefined) this.inventoryId = inventoryId;
        if (filmId !== undefined) this.filmId = filmId;
        if (lastUpdate !== undefined) this.lastUpdate = lastUpdate;
    }

    /**
     * Get the unique identifier for the inventory item.
     * @returns {number|null} The inventory ID.
     */
    get inventoryId() {
        return this._inventoryId;
    }

    /**
     * Set the unique identifier for the inventory item.
     * @param {number|null} id - The inventory ID to set. Must be a non-negative integer or null.
     * @throws {Error} If the provided ID is not a valid non-negative integer or null.
     */
    set inventoryId(id) {
        if (id === null) {
            this._inventoryId = null;
            return;
        }
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
            throw new Error('Inventory ID must be a non-negative integer or null.');
        }
        this._inventoryId = id;
    }

    /**
     * Get the ID of the film associated with this inventory item.
     * @returns {number|null} The film ID.
     */
    get filmId() {
        return this._filmId;
    }

    /**
     * Set the ID of the film associated with this inventory item.
     * @param {number|null} id - The film ID to set. Must be a non-negative integer or null.
     * @throws {Error} If the provided ID is not a valid non-negative integer or null.
     */
    set filmId(id) {
        if (id === null) {
            this._filmId = null;
            return;
        }
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
            throw new Error('Film ID must be a non-negative integer or null.');
        }
        this._filmId = id;
    }

    /**
     * Get the timestamp of the last update.
     * @returns {Date|null} The last update timestamp.
     */
    get lastUpdate() {
        return this._lastUpdate;
    }

    /**
     * Set the timestamp of the last update.
     * @param {Date|string|null} timestamp - The timestamp to set. Can be a Date object, a string parseable by `new Date()`, or null.
     * @throws {Error} If the provided timestamp is not a valid Date object, a valid date string, or null.
     */
    set lastUpdate(timestamp) {
        if (timestamp === null) {
            this._lastUpdate = null;
            return;
        }
        let date;
        if (timestamp instanceof Date) {
            date = timestamp;
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            throw new Error('Last update must be a Date object, a valid date string, or null.');
        }

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date provided for last update.');
        }
        this._lastUpdate = date;
    }

    /**
     * Checks if this Inventory object is equal to another object.
     * Two Inventory objects are considered equal if their `inventoryId` and `lastUpdate` fields are equal.
     * This method is crucial for defining object identity, especially in collections or persistence contexts.
     * @param {object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(other) {
        if (this === other) return true;
        if (!(other instanceof Inventory)) return false;

        // Compare inventoryId
        if (this._inventoryId !== other._inventoryId) return false;

        // Compare lastUpdate (Date objects need careful comparison of their time values)
        const thisTime = this._lastUpdate ? this._lastUpdate.getTime() : null;
        const otherTime = other._lastUpdate ? other._lastUpdate.getTime() : null;

        if (thisTime !== otherTime) return false;

        return true;
    }

    /**
     * Generates a hash code for the Inventory object, consistent with the `equals()` method.
     * In JavaScript, this is typically a string representation of the identifying properties,
     * useful for debugging, logging, or custom hash-based data structures (e.g., `Map` keys).
     * @returns {string} A string representation of the object's identifying properties.
     */
    hashCode() {
        // A simple string concatenation based on the fields used in equals()
        const lastUpdateStr = this._lastUpdate ? this._lastUpdate.toISOString() : 'null';
        return `Inventory-${this._inventoryId}-${lastUpdateStr}`;
    }

    /**
     * Converts the Inventory object to a plain JavaScript object, suitable for serialization
     * (e.g., to JSON, or for storage in a database). Date objects are converted to ISO strings.
     * @returns {object} A plain object representation of the inventory item.
     */
    toPlainObject() {
        return {
            inventoryId: this._inventoryId,
            filmId: this._filmId,
            lastUpdate: this._lastUpdate ? this._lastUpdate.toISOString() : null,
        };
    }

    // --- Asynchronous Persistence Operations (Static Methods) ---
    // These methods simulate interactions with a database or persistence layer.
    // In a real application, these would typically delegate to a repository or service.

    /**
     * Fetches an inventory item by its ID from the database.
     * @static
     * @param {number} id - The ID of the inventory item to fetch.
     * @returns {Promise<Inventory|null>} A promise that resolves to an Inventory object if found, otherwise null.
     * @throws {Error} If the ID is invalid or if there's an issue fetching the data.
     */
    static async findById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
            throw new Error('Invalid ID provided for findById. Must be a non-negative integer.');
        }
        try {
            const data = await mockDatabase.findById(id);
            return data ? new Inventory(data) : null;
        } catch (error) {
            console.error(`[InventoryModel] Error fetching inventory with ID ${id}:`, error);
            throw new Error(`Failed to fetch inventory: ${error.message}`);
        }
    }

    /**
     * Saves the current inventory item to the database.
     * If `inventoryId` is not set (null), it will be treated as a new record and an ID will be assigned by the persistence layer.
     * The `lastUpdate` timestamp will be automatically updated upon saving.
     * @returns {Promise<Inventory>} A promise that resolves to the saved Inventory object (potentially with a new ID and updated timestamp).
     * @throws {Error} If essential fields are missing or if there's an issue saving the data.
     */
    async save() {
        try {
            // Basic validation before saving
            if (typeof this._filmId !== 'number' || !Number.isInteger(this._filmId) || this._filmId < 0) {
                throw new Error('Film ID is required and must be a non-negative integer to save an inventory item.');
            }

            // Prepare data for persistence layer
            const dataToSave = this.toPlainObject();
            // The mock database will set/update lastUpdate, but we can also set it here for consistency
            dataToSave.lastUpdate = new Date().toISOString();

            const savedData = await mockDatabase.save(dataToSave);

            // Update the current instance with data from the persistence layer
            this._inventoryId = savedData.inventoryId;
            this._filmId = savedData.filmId;
            this._lastUpdate = new Date(savedData.lastUpdate); // Convert back to Date object

            return this; // Return the updated instance
        } catch (error) {
            console.error(`[InventoryModel] Error saving inventory item (ID: ${this._inventoryId || 'new'}):`, error);
            throw new Error(`Failed to save inventory: ${error.message}`);
        }
    }

    /**
     * Deletes an inventory item by its ID from the database.
     * @static
     * @param {number} id - The ID of the inventory item to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the item was successfully deleted, false otherwise.
     * @throws {Error} If the ID is invalid or if there's an issue deleting the data.
     */
    static async delete(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
            throw new Error('Invalid ID provided for delete. Must be a non-negative integer.');
        }
        try {
            const deleted = await mockDatabase.delete(id);
            return deleted;
        } catch (error) {
            console.error(`[InventoryModel] Error deleting inventory with ID ${id}:`, error);
            throw new Error(`Failed to delete inventory: ${error.message}`);
        }
    }

    /**
     * Fetches all inventory items from the database.
     * @static
     * @returns {Promise<Inventory[]>} A promise that resolves to an array of Inventory objects.
     * @throws {Error} If there's an issue fetching the data.
     */
    static async findAll() {
        try {
            const dataArray = await mockDatabase.findAll();
            return dataArray.map(data => new Inventory(data));
        } catch (error) {
            console.error('[InventoryModel] Error fetching all inventory items:', error);
            throw new Error(`Failed to fetch all inventory items: ${error.message}`);
        }
    }
}

module.exports = Inventory;