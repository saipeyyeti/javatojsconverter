```javascript
/**
 * @file Represents the Rental entity, mapping to the 'rental' table in a relational database.
 * This class serves as a data model (POJO/DTO) for transferring rental information
 * and defining its structure. It includes conceptual asynchronous persistence methods
 * to demonstrate Node.js best practices with async/await.
 */

/**
 * Represents a Rental entity, mirroring the structure and data of a single row
 * in a 'rental' table within a relational database.
 *
 * This class is designed as a Plain Old JavaScript Object (POJO) for data modeling,
 * similar to a JPA Entity in Java, but adapted for Node.js with ES6 features.
 * It encapsulates rental data, provides controlled access via getters/setters,
 * defines object equality, and includes conceptual asynchronous methods for
 * database interaction.
 *
 * @class
 * @property {number} rentalId - The unique identifier for the rental.
 * @property {Date} rentalDate - The date and time when the rental occurred.
 * @property {number} inventoryId - The identifier of the inventory item rented.
 * @property {number} customerId - The identifier of the customer who rented the item.
 * @property {Date | null} returnDate - The date and time when the rental item was returned, or null if not yet returned.
 * @property {Date} lastUpdate - The last update timestamp for this rental record.
 * @property {number} staffId - The identifier of the staff member who processed the rental.
 */
class Rental {
    /**
     * The unique identifier for the rental. Corresponds to 'rental_id' in the database.
     * @private
     * @type {number | undefined}
     */
    #rentalId;

    /**
     * The date and time when the rental occurred. Corresponds to 'rental_date'.
     * @private
     * @type {Date | undefined}
     */
    #rentalDate;

    /**
     * The identifier of the inventory item rented. Corresponds to 'inventory_id'.
     * @private
     * @type {number | undefined}
     */
    #inventoryId;

    /**
     * The identifier of the customer who rented the item. Corresponds to 'customer_id'.
     * @private
     * @type {number | undefined}
     */
    #customerId;

    /**
     * The date and time when the rental item was returned. Corresponds to 'return_date'.
     * Can be null if the item has not yet been returned.
     * @private
     * @type {Date | null | undefined}
     */
    #returnDate;

    /**
     * The last update timestamp for this rental record. Corresponds to 'last_update'.
     * @private
     * @type {Date | undefined}
     */
    #lastUpdate;

    /**
     * The identifier of the staff member who processed the rental. Corresponds to 'staff_id'.
     * @private
     * @type {number | undefined}
     */
    #staffId;

    /**
     * Creates an instance of Rental.
     * Initializes the rental object with provided data.
     *
     * @param {object} [data={}] - An object containing initial data for the rental.
     * @param {number} [data.rentalId] - The rental's unique ID.
     * @param {Date|string} [data.rentalDate] - The date and time of the rental. Can be a Date object or a string parseable by Date.
     * @param {number} [data.inventoryId] - The ID of the rented inventory item.
     * @param {number} [data.customerId] - The ID of the customer.
     * @param {Date|string|null} [data.returnDate] - The date and time of return. Can be null.
     * @param {Date|string} [data.lastUpdate] - The last update timestamp.
     * @param {number} [data.staffId] - The ID of the staff member.
     */
    constructor({ rentalId, rentalDate, inventoryId, customerId, returnDate, lastUpdate, staffId } = {}) {
        // Use setters for initial assignment to leverage validation logic
        this.rentalId = rentalId;
        this.rentalDate = rentalDate;
        this.inventoryId = inventoryId;
        this.customerId = customerId;
        this.returnDate = returnDate;
        this.lastUpdate = lastUpdate;
        this.staffId = staffId;
    }

    /**
     * Gets the rental ID.
     * @returns {number | undefined} The unique identifier for the rental.
     */
    get rentalId() {
        return this.#rentalId;
    }

    /**
     * Sets the rental ID.
     * @param {number | undefined | null} value - The new rental ID.
     * @throws {Error} If the value is not a valid non-negative integer.
     */
    set rentalId(value) {
        if (value === undefined || value === null) {
            this.#rentalId = undefined; // Allow unsetting or initial undefined
            return;
        }
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('Rental ID must be a non-negative integer.');
        }
        this.#rentalId = value;
    }

    /**
     * Gets the rental date.
     * @returns {Date | undefined} The date and time when the rental occurred.
     */
    get rentalDate() {
        return this.#rentalDate;
    }

    /**
     * Sets the rental date.
     * @param {Date|string|undefined|null} value - The new rental date. Can be a Date object or a string parseable by Date.
     * @throws {Error} If the value is not a valid Date object or a parseable date string.
     */
    set rentalDate(value) {
        if (value === undefined || value === null) {
            this.#rentalDate = undefined;
            return;
        }
        const dateValue = value instanceof Date ? value : new Date(value);
        if (isNaN(dateValue.getTime())) {
            throw new Error('Rental Date must be a valid Date object or a parseable date string.');
        }
        this.#rentalDate = dateValue;
    }

    /**
     * Gets the inventory ID.
     * @returns {number | undefined} The identifier of the inventory item rented.
     */
    get inventoryId() {
        return this.#inventoryId;
    }

    /**
     * Sets the inventory ID.
     * @param {number | undefined | null} value - The new inventory ID.
     * @throws {Error} If the value is not a valid non-negative integer.
     */
    set inventoryId(value) {
        if (value === undefined || value === null) {
            this.#inventoryId = undefined;
            return;
        }
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('Inventory ID must be a non-negative integer.');
        }
        this.#inventoryId = value;
    }

    /**
     * Gets the customer ID.
     * @returns {number | undefined} The identifier of the customer who rented the item.
     */
    get customerId() {
        return this.#customerId;
    }

    /**
     * Sets the customer ID.
     * @param {number | undefined | null} value - The new customer ID.
     * @throws {Error} If the value is not a valid non-negative integer.
     */
    set customerId(value) {
        if (value === undefined || value === null) {
            this.#customerId = undefined;
            return;
        }
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('Customer ID must be a non-negative integer.');
        }
        this.#customerId = value;
    }

    /**
     * Gets the return date.
     * @returns {Date | null | undefined} The date and time when the rental item was returned, or null if not returned.
     */
    get returnDate() {
        return this.#returnDate;
    }

    /**
     * Sets the return date.
     * @param {Date|string|null|undefined} value - The new return date. Can be a Date object, a string parseable by Date, or null.
     * @throws {Error} If the value is not a valid Date object, a parseable date string, or null.
     */
    set returnDate(value) {
        if (value === undefined) { // Explicitly allow undefined to clear the value
            this.#returnDate = undefined;
            return;
        }
        if (value === null) { // Explicitly allow null
            this.#returnDate = null;
            return;
        }
        const dateValue = value instanceof Date ? value : new Date(value);
        if (isNaN(dateValue.getTime())) {
            throw new Error('Return Date must be a valid Date object, a parseable date string, or null.');
        }
        this.#returnDate = dateValue;
    }

    /**
     * Gets the last update timestamp.
     * @returns {Date | undefined} The last update timestamp for this rental record.
     */
    get lastUpdate() {
        return this.#lastUpdate;
    }

    /**
     * Sets the last update timestamp.
     * @param {Date|string|undefined|null} value - The new last update timestamp. Can be a Date object or a string parseable by Date.
     * @throws {Error} If the value is not a valid Date object or a parseable date string.
     */
    set lastUpdate(value) {
        if (value === undefined || value === null) {
            this.#lastUpdate =