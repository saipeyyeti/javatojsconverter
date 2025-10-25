/**
 * @file Rental.js
 * @description Represents a rental entity, mapping to a 'rental' table in a relational database.
 *              This class serves as a data holder and provides methods for object identity.
 *              It's designed to be used with an ORM or database access layer in a Node.js application.
 */

/**
 * @typedef {object} RentalData
 * @property {number} rentalId - The unique identifier for the rental.
 * @property {Date} rentalDate - The date and time when the rental occurred.
 * @property {number} inventoryId - The ID of the inventory item rented.
 * @property {number} customerId - The ID of the customer who rented the item.
 * @property {Date | null} returnDate - The date and time when the rental item was returned (can be null if not yet returned).
 * @property {Date} lastUpdate - The timestamp of the last update to this rental record.
 * @property {number} staffId - The ID of the staff member who processed the rental.
 */

/**
 * Represents a single rental record from the database.
 * This class acts as a data model (similar to a JPA entity or POJO) for rental information.
 * It encapsulates rental data and provides methods for accessing and manipulating it,
 * along with object identity comparison.
 */
class Rental {
    /**
     * Creates an instance of Rental.
     * @param {RentalData} data - An object containing the rental properties.
     * @throws {Error} If required data properties are missing or invalid.
     */
    constructor({ rentalId, rentalDate, inventoryId, customerId, returnDate, lastUpdate, staffId }) {
        if (rentalId === undefined || typeof rentalId !== 'number' || rentalId <= 0) {
            throw new Error('Rental ID is required and must be a positive number.');
        }
        if (!rentalDate || !(rentalDate instanceof Date)) {
            throw new Error('Rental Date is required and must be a Date object.');
        }
        if (inventoryId === undefined || typeof inventoryId !== 'number' || inventoryId <= 0) {
            throw new Error('Inventory ID is required and must be a positive number.');
        }
        if (customerId === undefined || typeof customerId !== 'number' || customerId <= 0) {
            throw new Error('Customer ID is required and must be a positive number.');
        }
        if (!lastUpdate || !(lastUpdate instanceof Date)) {
            throw new Error('Last Update date is required and must be a Date object.');
        }
        if (staffId === undefined || typeof staffId !== 'number' || staffId <= 0) {
            throw new Error('Staff ID is required and must be a positive number.');
        }
        if (returnDate !== null && returnDate !== undefined && !(returnDate instanceof Date)) {
            throw new Error('Return Date must be a Date object or null/undefined.');
        }

        /**
         * @private
         * @type {number}
         */
        this._rentalId = rentalId;
        /**
         * @private
         * @type {Date}
         */
        this._rentalDate = rentalDate;
        /**
         * @private
         * @type {number}
         */
        this._inventoryId = inventoryId;
        /**
         * @private
         * @type {number}
         */
        this._customerId = customerId;
        /**
         * @private
         * @type {Date | null}
         */
        this._returnDate = returnDate || null;
        /**
         * @private
         * @type {Date}
         */
        this._lastUpdate = lastUpdate;
        /**
         * @private
         * @type {number}
         */
        this._staffId = staffId;
    }

    /**
     * Gets the unique identifier for the rental.
     * @returns {number} The rental ID.
     */
    get rentalId() {
        return this._rentalId;
    }

    /**
     * Sets the unique identifier for the rental.
     * @param {number} value - The new rental ID.
     * @throws {Error} If the value is not a positive number.
     */
    set rentalId(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Rental ID must be a positive number.');
        }
        this._rentalId = value;
    }

    /**
     * Gets the date and time when the rental occurred.
     * @returns {Date} The rental date.
     */
    get rentalDate() {
        return this._rentalDate;
    }

    /**
     * Sets the date and time when the rental occurred.
     * @param {Date} value - The new rental date.
     * @throws {Error} If the value is not a Date object.
     */
    set rentalDate(value) {
        if (!(value instanceof Date)) {
            throw new Error('Rental Date must be a Date object.');
        }
        this._rentalDate = value;
    }

    /**
     * Gets the ID of the inventory item rented.
     * @returns {number} The inventory ID.
     */
    get inventoryId() {
        return this._inventoryId;
    }

    /**
     * Sets the ID of the inventory item rented.
     * @param {number} value - The new inventory ID.
     * @throws {Error} If the value is not a positive number.
     */
    set inventoryId(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Inventory ID must be a positive number.');
        }
        this._inventoryId = value;
    }

    /**
     * Gets the ID of the customer who rented the item.
     * @returns {number} The customer ID.
     */
    get customerId() {
        return this._customerId;
    }

    /**
     * Sets the ID of the customer who rented the item.
     * @param {number} value - The new customer ID.
     * @throws {Error} If the value is not a positive number.
     */
    set customerId(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Customer ID must be a positive number.');
        }
        this._customerId = value;
    }

    /**
     * Gets the date and time when the rental item was returned.
     * @returns {Date | null} The return date, or null if not yet returned.
     */
    get returnDate() {
        return this._returnDate;
    }

    /**
     * Sets the date and time when the rental item was returned.
     * @param {Date | null} value - The new return date, or null.
     * @throws {Error} If the value is not a Date object or null.
     */
    set returnDate(value) {
        if (value !== null && !(value instanceof Date)) {
            throw new Error('Return Date must be a Date object or null.');
        }
        this._returnDate = value;
    }

    /**
     * Gets the timestamp of the last update to this rental record.
     * @returns {Date} The last update timestamp.
     */
    get lastUpdate() {
        return this._lastUpdate;
    }

    /**
     * Sets the timestamp of the last update to this rental record.
     * @param {Date} value - The new last update timestamp.
     * @throws {Error} If the value is not a Date object.
     */
    set lastUpdate(value) {
        if (!(value instanceof Date)) {
            throw new Error('Last Update must be a Date object.');
        }
        this._lastUpdate = value;
    }

    /**
     * Gets the ID of the staff member who processed the rental.
     * @returns {number} The staff ID.
     */
    get staffId() {
        return this._staffId;
    }

    /**
     * Sets the ID of the staff member who processed the rental.
     * @param {number} value - The new staff ID.
     * @throws {Error} If the value is not a positive number.
     */
    set staffId(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Staff ID must be a positive number.');
        }
        this._staffId = value;
    }

    /**
     * Compares this Rental object with another object for equality.
     * Two Rental objects are considered equal if all their significant properties are identical.
     * This method is analogous to Java's `equals()` method.
     * @param {object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    isEqual(other) {
        if (this === other) return true;
        if (!(other instanceof Rental)) return false;

        // Compare primitive types directly
        if (this.rentalId !== other.rentalId ||
            this.inventoryId !== other.inventoryId ||
            this.customerId !== other.customerId ||
            this.staffId !== other.staffId) {
            return false;
        }

        // Compare Date objects by their time value
        const rentalDateEqual = this.rentalDate.getTime() === other.rentalDate.getTime();
        const lastUpdateEqual = this.lastUpdate.getTime() === other.lastUpdate.getTime();

        // Compare returnDate, handling nulls
        const returnDateEqual = (this.returnDate === other.returnDate) ||
                                (this.returnDate && other.returnDate && this.returnDate.getTime() === other.returnDate.getTime());

        return rentalDateEqual && returnDateEqual && lastUpdateEqual;
    }

    /**
     * Converts the Rental object into a plain JavaScript object suitable for database operations.
     * This method maps the class properties back to the expected database column names.
     * @returns {object} A plain object with database column names as keys.
     */
    toDbObject() {
        return {
            rental_id: this.rentalId,
            rental_date: this.rentalDate,
            inventory_id: this.inventoryId,
            customer_id: this.customerId,
            return_date: this.returnDate,
            last_update: this.lastUpdate,
            staff_id: this.staffId,
        };
    }

    /**
     * Creates a Rental instance from a raw database object.
     * This static factory method is useful for hydrating Rental objects from database query results.
     * It handles the mapping from database column names (e.g., `rental_id`) to class property names (e.g., `rentalId`).
     * @param {object} dbObject - The raw object returned from a database query.
     * @param {number} dbObject.rental_id - The rental ID from the database.
     * @param {Date | string} dbObject.rental_date - The rental date from the database.
     * @param {number} dbObject.inventory_id - The inventory ID from the database.
     * @param {number} dbObject.customer_id - The customer ID from the database.
     * @param {Date | string | null} dbObject.return_date - The return date from the database.
     * @param {Date | string} dbObject.last_update - The last update timestamp from the database.
     * @param {number} dbObject.staff_id - The staff ID from the database.
     * @returns {Rental} A new Rental instance.
     * @throws {Error} If the database object is invalid or missing required fields.
     */
    static fromDbObject(dbObject) {
        if (!dbObject || typeof dbObject !== 'object') {
            throw new Error('Invalid database object provided for Rental.fromDbObject.');
        }

        try {
            return new Rental({
                rentalId: dbObject.rental_id,
                rentalDate: dbObject.rental_date instanceof Date ? dbObject.rental_date : new Date(dbObject.rental_date),
                inventoryId: dbObject.inventory_id,
                customerId: dbObject.customer_id,
                returnDate: dbObject.return_date ? (dbObject.return_date instanceof Date ? dbObject.return_date : new Date(dbObject.return_date)) : null,
                lastUpdate: dbObject.last_update instanceof Date ? dbObject.last_update : new Date(dbObject.last_update),
                staffId: dbObject.staff_id,
            });
        } catch (error) {
            // Re-throw with more context if the constructor fails
            throw new Error(`Failed to create Rental from DB object: ${error.message}`);
        }
    }

    /**
     * Asynchronously fetches a single rental record by its ID from a simulated database.
     * This method demonstrates the use of async/await for database interaction.
     * In a real application, this would interact with a database client or ORM.
     * @param {number} id - The ID of the rental to fetch.
     * @returns {Promise<Rental | null>} A promise that resolves to a Rental instance if found, otherwise null.
     * @throws {Error} If there's a problem fetching the rental (e.g., database error).
     */
    static async fetchById(id) {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('Invalid rental ID provided for fetchById. Must be a positive number.');
        }

        console.log(`[RentalRepository] Attempting to fetch rental with ID: ${id}`);

        try {
            // Simulate an asynchronous database call
            const simulatedDbResult = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate a database error 10% of the time
                    if (Math.random() < 0.1) {
                        return reject(new Error('Simulated database connection error.'));
                    }

                    // Simulate finding a rental
                    if (id === 1) {
                        resolve({
                            rental_id: 1,
                            rental_date: new Date('2005-05-24T22:53:30.000Z'),
                            inventory_id: 367,
                            customer_id: 130,
                            return_date: new Date('2005-05-26T22:04:30.000Z'),
                            last_update: new Date('2006-02-15T21:30:53.000Z'),
                            staff_id: 1,
                        });
                    } else if (id === 2) {
                        resolve({
                            rental_id: 2,
                            rental_date: new Date('2005-05-24T22:53:30.000Z'),
                            inventory_id: 367,
                            customer_id: 130,
                            return_date: null, // Not yet returned
                            last_update: new Date('2006-02-15T21:30:53.000Z'),
                            staff_id: 1,
                        });
                    } else {
                        resolve(null); // Not found
                    }
                }, 100); // Simulate network latency
            });

            if (simulatedDbResult) {
                console.log(`[RentalRepository] Rental ID ${id} found.`);
                return Rental.fromDbObject(simulatedDbResult);
            } else {
                console.log(`[RentalRepository] Rental ID ${id} not found.`);
                return null;
            }
        } catch (error) {
            console.error(`[RentalRepository] Error fetching rental ID ${id}: ${error.message}`);
            // Re-throw a more specific error or handle it based on application needs
            throw new Error(`Failed to fetch rental by ID ${id}: ${error.message}`);
        }
    }
}

// Export the Rental class for use in other modules
module.exports = Rental;

/*
// Example Usage (for demonstration purposes, typically in a service or controller)

async function runExamples() {
    console.log('--- Rental Class Examples ---');

    // 1. Create a new Rental instance
    try {
        const rental1 = new Rental({
            rentalId: 101,
            rentalDate: new Date('2023-01-15T10:00:00Z'),
            inventoryId: 501,
            customerId: 201,
            returnDate: null,
            lastUpdate: new Date('2023-01-15T10:00:00Z'),
            staffId: 1,
        });
        console.log('\nCreated Rental 1:', rental1.toDbObject());
        console.log('Rental ID:', rental1.rentalId);
        rental1.returnDate = new Date('2023-01-20T12:00:00Z');
        console.log('Updated returnDate for Rental 1:', rental1.returnDate);

        // 2. Test isEqual
        const rental2 = new Rental({
            rentalId: 101,
            rentalDate: new Date('2023-01-15T10:00:00Z'),
            inventoryId: 501,
            customerId: 201,
            returnDate: new Date('2023-01-20T12:00:00Z'),
            lastUpdate: new Date('2023-01-15T10:00:00Z'),
            staffId: 1,
        });
        console.log('Rental 1 equals Rental 2 (after update)?', rental1.isEqual(rental2)); // Should be true

        const rental3 = new Rental({
            rentalId: 102, // Different ID
            rentalDate: new Date('2023-01-15T10:00:00Z'),
            inventoryId: 501,
            customerId: 201,
            returnDate: null,
            lastUpdate: new Date('2023-01-15T10:00:00Z'),
            staffId: 1,
        });
        console.log('Rental 1 equals Rental 3?', rental1.isEqual(rental3)); // Should be false

        // 3. Test fromDbObject static method
        const dbRecord = {
            rental_id: 200,
            rental_date: '2022-11-01T08:30:00.000Z',
            inventory_id: 600,
            customer_id: 300,
            return_date: '2022-11-05T15:00:00.000Z',
            last_update: '2022-11-01T08:30:00.000Z',
            staff_id: 2,
        };
        const rentalFromDb = Rental.fromDbObject(dbRecord);
        console('\nCreated Rental from DB object:', rentalFromDb.toDbObject());
        console.log('Type of rentalFromDb.rentalDate:', rentalFromDb.rentalDate instanceof Date);

        // 4. Test error handling in constructor/setters
        try {
            new Rental({ rentalId: -5, rentalDate: new Date(), inventoryId: 1, customerId: 1, lastUpdate: new Date(), staffId: 1 });
        } catch (error) {
            console.error('\nError creating Rental with invalid ID:', error.message);
        }

        try {
            rental1.rentalId = 'abc';
        } catch (error) {
            console.error('Error setting invalid rentalId:', error.message);
        }

        // 5. Test async fetchById
        console('\n--- Async Fetch Examples ---');
        const fetchedRental1 = await Rental.fetchById(1);
        if (fetchedRental1) {
            console.log('Fetched Rental 1:', fetchedRental1.toDbObject());
        }

        const fetchedRental2 = await Rental.fetchById(2);
        if (fetchedRental2) {
            console.log('Fetched Rental 2 (not returned):', fetchedRental2.toDbObject());
        }

        const fetchedRentalNotFound = await Rental.fetchById(999);
        console('Fetched Rental 999:', fetchedRentalNotFound); // Should be null

        // Test simulated error
        try {
            // Loop to increase chance of hitting the simulated error
            let foundError = false;
            for (let i = 0; i < 20 && !foundError; i++) {
                await Rental.fetchById(1); // Try fetching a valid ID, but might hit error
            }
            console('No simulated database error occurred during error test.');
        } catch (error) {
            console.error('Caught simulated database error:', error.message);
        }

    } catch (globalError) {
        console.error('An unexpected error occurred during examples:', globalError.message);
    }
}

// Uncomment to run examples
// runExamples();
*/