/**
 * @typedef {Object} CustomerData
 * @property {number} [customerId] - The unique identifier for the customer. Optional for new customers.
 * @property {string} firstName - The first name of the customer. Required.
 * @property {string} lastName - The last name of the customer. Required.
 * @property {string} [email] - The email address of the customer. Optional.
 * @property {number} [active=1] - Whether the customer is active (1 for active, 0 for inactive). Defaults to 1.
 * @property {Date} [createDate] - The date and time the customer record was created. Defaults to current time.
 * @property {Date} [lastUpdate] - The date and time the customer record was last updated. Defaults to current time.
 */

/**
 * Represents a Customer entity, designed to map to a relational database table.
 * This class encapsulates customer data and provides methods for identity, equality,
 * and conceptual persistence operations, mirroring the functionality of a JPA Entity
 * in a Node.js/JavaScript environment.
 */
class Customer {
    /**
     * Maps class properties to their corresponding database column names.
     * This serves a similar purpose to JPA's `@Column(name="...")` annotation.
     * @private
     * @static
     * @type {Object.<string, string>}
     */
    static _columnMap = {
        customerId: 'customer_id',
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        active: 'active',
        createDate: 'create_date',
        lastUpdate: 'last_update',
    };

    /**
     * Creates an instance of Customer.
     * Initializes customer properties with provided data, performing basic validation.
     *
     * @param {CustomerData} data - The customer data to initialize the object.
     * @throws {TypeError} If required data is missing or invalid.
     */
    constructor(data) {
        if (!data || typeof data !== 'object') {
            throw new TypeError('Customer data must be a non-null object.');
        }

        // Validate and assign required fields
        this.firstName = this._validateString('firstName', data.firstName, false);
        this.lastName = this._validateString('lastName', data.lastName, false);

        /**
         * The unique identifier for the customer. Corresponds to `customer_id` in the database.
         * @type {number|undefined}
         */
        this.customerId = data.customerId !== undefined ? this._validateNumber('customerId', data.customerId, true) : undefined;

        /**
         * The email address of the customer. Corresponds to `email` in the database.
         * @type {string|undefined}
         */
        this.email = data.email !== undefined ? this._validateString('email', data.email, true) : undefined;

        /**
         * Whether the customer is active (1 for active, 0 for inactive). Corresponds to `active` in the database.
         * @type {number}
         */
        this.active = data.active !== undefined ? this._validateActive('active', data.active) : 1; // Default to 1 (active)

        /**
         * The date and time the customer record was created. Corresponds to `create_date` in the database.
         * @type {Date}
         */
        this.createDate = data.createDate instanceof Date ? data.createDate : new Date();

        /**
         * The date and time the customer record was last updated. Corresponds to `last_update` in the database.
         * @type {Date}
         */
        this.lastUpdate = data.lastUpdate instanceof Date ? data.lastUpdate : new Date();
    }

    /**
     * Validates if a value is a number.
     * @private
     * @param {string} fieldName - The name of the field being validated.
     * @param {*} value - The value to validate.
     * @param {boolean} [allowZero=false] - Whether 0 is considered a valid number.
     * @returns {number} The validated number.
     * @throws {TypeError} If the value is not a number or fails other checks.
     */
    _validateNumber(fieldName, value, allowZero = false) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new TypeError(`${fieldName} must be a valid number.`);
        }
        if (!allowZero && value === 0) {
            throw new TypeError(`${fieldName} cannot be zero.`);
        }
        return value;
    }

    /**
     * Validates if a value is a string.
     * @private
     * @param {string} fieldName - The name of the field being validated.
     * @param {*} value - The value to validate.
     * @param {boolean} [allowEmpty=false] - Whether an empty string is allowed after trimming.
     * @returns {string} The validated string.
     * @throws {TypeError} If the value is not a string or fails other checks.
     */
    _validateString(fieldName, value, allowEmpty = false) {
        if (typeof value !== 'string') {
            throw new TypeError(`${fieldName} must be a string.`);
        }
        if (!allowEmpty && value.trim() === '') {
            throw new TypeError(`${fieldName} cannot be an empty string.`);
        }
        return value;
    }

    /**
     * Validates the 'active' field, ensuring it's either 0 or 1.
     * @private
     * @param {string} fieldName - The name of the field being validated.
     * @param {*} value - The value to validate.
     * @returns {number} The validated active status (0 or 1).
     * @throws {TypeError} If the value is not 0 or 1.
     */
    _validateActive(fieldName, value) {
        if (typeof value !== 'number' || (value !== 0 && value !== 1)) {
            throw new TypeError(`${fieldName} must be 0 or 1.`);
        }
        return value;
    }

    /**
     * Checks if this Customer object is logically equal to another object.
     * Equality is determined by comparing all significant fields: customerId, firstName,
     * lastName, email, active, createDate, and lastUpdate. This mimics Java's `equals` contract.
     *
     * @param {Object} other - The object to compare with.
     * @returns {boolean} True if the objects are logically equal, false otherwise.
     */
    equals(other) {
        if (this === other) return true; // Same object reference
        if (!(other instanceof Customer)) return false; // Not an instance of Customer

        // Compare primitive fields (including null/undefined safety)
        if (this.customerId !== other.customerId) return false;
        if (this.firstName !== other.firstName) return false;
        if (this.lastName !== other.lastName) return false;
        if (this.email !== other.email) return false; // Handles null/undefined correctly
        if (this.active !== other.active) return false;

        // Compare Date objects by their time value (getTime() returns milliseconds since epoch)
        // Handles cases where one or both dates might be null/undefined
        const thisCreateTime = this.createDate ? this.createDate.getTime() : undefined;
        const otherCreateTime = other.createDate ? other.createDate.getTime() : undefined;
        if (thisCreateTime !== otherCreateTime) return false;

        const thisUpdateTime = this.lastUpdate ? this.lastUpdate.getTime() : undefined;
        const otherUpdateTime = other.lastUpdate ? other.lastUpdate.getTime() : undefined;
        if (thisUpdateTime !== otherUpdateTime) return false;

        return true;
    }

    /**
     * Generates a hash string for the Customer object, consistent with the `equals` method.
     * This serves a similar purpose to Java's `hashCode()` for identifying unique objects
     * by value, particularly useful for keys in `Map` or `Set` where value equality is desired.
     *
     * @returns {string} A string representation of the object's significant state.
     */
    toHashString() {
        const parts = [
            this.customerId,
            this.firstName,
            this.lastName,
            this.email,
            this.active,
            this.createDate ? this.createDate.toISOString() : null,
            this.lastUpdate ? this.lastUpdate.toISOString() : null,
        ];
        // Join parts with a unique separator to minimize collision risk
        return parts.map(p => (p === null || p === undefined) ? 'NULL' : String(p)).join('|');
    }

    /**
     * Converts the Customer object into a plain JavaScript object suitable for database operations.
     * It maps class properties to their corresponding database column names, and formats dates.
     * This conceptually replaces the JPA `@Column` annotations for database interaction.
     *
     * @returns {Object.<string, *>} A plain object with database column names as keys.
     */
    toDatabaseObject() {
        const dbObject = {};
        for (const prop in Customer._columnMap) {
            if (Object.prototype.hasOwnProperty.call(this, prop)) {
                const dbColumnName = Customer._columnMap[prop];
                let value = this[prop];

                // Convert Date objects to a SQL-compatible string format (YYYY-MM-DD HH:MM:SS)
                if (value instanceof Date) {
                    value = value.toISOString().slice(0, 19).replace('T', ' ');
                }
                dbObject[dbColumnName] = value;
            }
        }
        return dbObject;
    }

    /**
     * Creates a Customer instance from a raw database row object.
     * It maps database column names back to class properties and converts date strings to Date objects.
     * This acts as a factory method for hydrating Customer objects from database results.
     *
     * @static
     * @param {Object.<string, *>} dbRow - The raw object representing a database row.
     * @returns {Customer} A new Customer instance.
     * @throws {TypeError} If the database row is invalid or missing required fields.
     */
    static fromDatabaseObject(dbRow) {
        if (!dbRow || typeof dbRow !== 'object') {
            throw new TypeError('Database row must be a non-null object.');
        }

        const data = {};
        for (const prop in Customer._columnMap) {
            const dbColumnName = Customer._columnMap[prop];
            if (Object.prototype.hasOwnProperty.call(dbRow, dbColumnName)) {
                let value = dbRow[dbColumnName];

                // Convert database date/timestamp strings (or Date objects from some drivers) to Date objects
                if (['createDate', 'lastUpdate'].includes(prop) && value && !(value instanceof Date)) {
                    value = new Date(value);
                }
                data[prop] = value;
            }
        }
        return new Customer(data);
    }

    // --- Placeholder Asynchronous Database Operations ---
    // These methods demonstrate how async/await would be used for database interactions.
    // In a real application, these would typically reside in a separate 'Repository' or 'Service' layer
    // and interact with a concrete database client (e.g., 'mysql2', 'pg').
    // They are included here to fulfill the requirement for async/await and error handling.

    /**
     * Placeholder for fetching a customer by ID from a database.
     * @static
     * @async
     * @param {number} id - The ID of the customer to fetch.
     * @returns {Promise<Customer|null>} A promise that resolves to a Customer instance or null if not found.
     * @throws {Error} If a database error occurs or the ID is invalid.
     */
    static async findById(id) {
        if (typeof id !== 'number' || id <= 0) {
            throw new TypeError('Customer ID must be a positive number.');
        }
        console.log(`[DB] Attempting to find customer with ID: ${id}`);
        try {
            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network latency

            // In a real application, you would execute a database query here:
            // const result = await dbClient.query('SELECT * FROM customer WHERE customer_id = ?', [id]);
            // if (result.length === 0) return null;
            // return Customer.fromDatabaseObject(result[0]);

            // For demonstration, return a mock customer if ID is 1, otherwise null
            if (id === 1) {
                return Customer.fromDatabaseObject({
                    customer_id: 1,
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    active: 1,
                    create_date: new Date('2023-01-01T10:00:00Z'),
                    last_update: new Date('2023-01-01T10:00:00Z'),
                });
            }
            return null; // Customer not found
        } catch (error) {
            console.error(`Error finding customer by ID ${id}:`, error);
            throw new Error(`Failed to find customer: ${error.message}`);
        }
    }

    /**
     * Placeholder for saving (inserting or updating) the current customer instance to a database.
     * If `customerId` is present, it performs an update; otherwise, it performs an insert.
     *
     * @async
     * @returns {Promise<Customer>} A promise that resolves to the saved Customer instance (potentially with an updated ID for new inserts).
     * @throws {Error} If a database error occurs or validation fails.
     */
    async save() {
        console.log(`[DB] Attempting to save customer: ${this.firstName} ${this.lastName}`);
        try {
            // Update lastUpdate timestamp before saving
            this.lastUpdate = new Date();

            const dbObject = this.toDatabaseObject();
            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network latency

            if (this.customerId) {
                // Simulate UPDATE operation
                console.log(`[DB] Updating customer with ID: ${this.customerId}`, dbObject);
                // In a real app: await dbClient.query('UPDATE customer SET first_name=?, ... WHERE customer_id = ?', [dbObject.first_name, ..., this.customerId]);
            } else {
                // Simulate INSERT operation
                console.log('[DB] Inserting new customer:', dbObject);
                // In a real app: const result = await dbClient.query('INSERT INTO customer (first_name, ...) VALUES (?, ...)', [dbObject.first_name, ...]);
                // Simulate assigning a new ID from the database (e.g., auto-incremented ID)
                this.customerId = Math.floor(Math.random() * 10000) + 1000; // Assign a mock new ID
            }
            return this; // Return the updated instance
        } catch (error) {
            console.error(`Error saving customer ${this.firstName} ${this.lastName}:`, error);
            throw new Error(`Failed to save customer: ${error.message}`);
        }
    }

    /**
     * Placeholder for deleting the current customer instance from a database.
     * Requires the `customerId` to be set.
     *
     * @async
     * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
     * @throws {Error} If a database error occurs or `customerId` is missing.
     */
    async delete() {
        if (!this.customerId) {
            throw new Error('Cannot delete a customer without a customerId.');
        }
        console.log(`[DB] Attempting to delete customer with ID: ${this.customerId}`);
        try {
            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network latency

            // In a real app: await dbClient.query('DELETE FROM customer WHERE customer_id = ?', [this.customerId]);
            console.log(`[DB] Customer with ID ${this.customerId} deleted successfully.`);
            return true;
        } catch (error) {
            console.error(`Error deleting customer with ID ${this.customerId}:`, error);
            throw new Error(`Failed to delete customer: ${error.message}`);
        }
    }
}

module.exports = Customer;