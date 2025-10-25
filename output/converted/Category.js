/**
 * @file Category.js
 * @description Represents a Category entity, mapping to a 'category' table in a relational database.
 * This class serves as a data model for Object-Relational Mapping (ORM) in a Node.js application,
 * similar to a JPA Entity in Java. It encapsulates category data and provides methods for
 * access, modification, and comparison, adhering to ES6 class syntax and Node.js best practices.
 */

/**
 * Represents a Category entity.
 * This class models a 'category' table in a relational database. It provides a structured
 * way to interact with category data, including properties for category identification,
 * name, and last update timestamp. It adheres to the JavaBean pattern with private-like
 * fields accessed via public getters and setters, and includes robust equality checking.
 *
 * In a full ORM context (e.g., using Sequelize or TypeORM), this class would typically
 * be decorated with ORM-specific annotations or configurations to define its mapping
 * to the database table and columns. The JSDoc comments indicate these conceptual mappings.
 *
 * @class
 * @property {number} categoryId - The unique identifier for the category (Primary Key).
 * @property {string} name - The name of the category.
 * @property {Date} lastUpdate - The timestamp of the last update to the category record.
 */
class Category {
    /**
     * Creates an instance of Category.
     *
     * @constructor
     * @param {object} params - An object containing category properties.
     * @param {number} params.categoryId - The unique identifier for the category. Must be a positive integer.
     * @param {string} params.name - The name of the category. Must be a non-empty string.
     * @param {Date|string} params.lastUpdate - The timestamp of the last update. Can be a Date object or a string parseable by `new Date()`.
     * @throws {Error} If `categoryId` is not a valid positive integer.
     * @throws {Error} If `name` is not a valid non-empty string.
     * @throws {Error} If `lastUpdate` is not a valid Date object or a parseable date string.
     */
    constructor({ categoryId, name, lastUpdate }) {
        // Validate and set categoryId
        if (typeof categoryId !== 'number' || !Number.isInteger(categoryId) || categoryId <= 0) {
            throw new Error(`CategoryError: Invalid categoryId '${categoryId}'. Must be a positive integer.`);
        }
        /**
         * The unique identifier for the category.
         * Mapped to `category_id` column in the database (Primary Key).
         * @private
         * @type {number}
         */
        this._categoryId = categoryId;

        // Validate and set name
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error(`CategoryError: Invalid name '${name}'. Must be a non-empty string.`);
        }
        /**
         * The name of the category.
         * Mapped to `name` column in the database.
         * @private
         * @type {string}
         */
        this._name = name.trim();

        // Validate and set lastUpdate
        let parsedLastUpdate;
        if (lastUpdate instanceof Date) {
            parsedLastUpdate = lastUpdate;
        } else if (typeof lastUpdate === 'string') {
            parsedLastUpdate = new Date(lastUpdate);
        } else {
            throw new Error(`CategoryError: Invalid lastUpdate type '${typeof lastUpdate}'. Must be a Date object or a valid date string.`);
        }

        if (isNaN(parsedLastUpdate.getTime())) {
            throw new Error(`CategoryError: Could not parse lastUpdate date from '${lastUpdate}'.`);
        }
        /**
         * The timestamp of the last update to the category record.
         * Mapped to `last_update` column in the database.
         * @private
         * @type {Date}
         */
        this._lastUpdate = parsedLastUpdate;
    }

    /**
     * Gets the category ID.
     * Mapped to `category_id` column (Primary Key).
     * @returns {number} The unique identifier of the category.
     */
    get categoryId() {
        return this._categoryId;
    }

    /**
     * Sets the category ID.
     * @param {number} newCategoryId - The new unique identifier for the category.
     * @throws {Error} If `newCategoryId` is not a valid positive integer.
     */
    set categoryId(newCategoryId) {
        if (typeof newCategoryId !== 'number' || !Number.isInteger(newCategoryId) || newCategoryId <= 0) {
            throw new Error(`CategoryError: Invalid categoryId '${newCategoryId}'. Must be a positive integer.`);
        }
        this._categoryId = newCategoryId;
    }

    /**
     * Gets the category name.
     * Mapped to `name` column.
     * @returns {string} The name of the category.
     */
    get name() {
        return this._name;
    }

    /**
     * Sets the category name.
     * @param {string} newName - The new name for the category.
     * @throws {Error} If `newName` is not a valid non-empty string.
     */
    set name(newName) {
        if (typeof newName !== 'string' || newName.trim().length === 0) {
            throw new Error(`CategoryError: Invalid name '${newName}'. Must be a non-empty string.`);
        }
        this._name = newName.trim();
    }

    /**
     * Gets the last update timestamp.
     * Mapped to `last_update` column.
     * @returns {Date} The timestamp indicating when the category record was last updated.
     */
    get lastUpdate() {
        return this._lastUpdate;
    }

    /**
     * Sets the last update timestamp.
     * @param {Date|string} newLastUpdate - The new timestamp for the last update. Can be a Date object or a string parseable by `new Date()`.
     * @throws {Error} If `newLastUpdate` is not a valid Date object or a parseable date string.
     */
    set lastUpdate(newLastUpdate) {
        let parsedLastUpdate;
        if (newLastUpdate instanceof Date) {
            parsedLastUpdate = newLastUpdate;
        } else if (typeof newLastUpdate === 'string') {
            parsedLastUpdate = new Date(newLastUpdate);
        } else {
            throw new Error(`CategoryError: Invalid lastUpdate type '${typeof newLastUpdate}'. Must be a Date object or a valid date string.`);
        }

        if (isNaN(parsedLastUpdate.getTime())) {
            throw new Error(`CategoryError: Could not parse lastUpdate date from '${newLastUpdate}'.`);
        }
        this._lastUpdate = parsedLastUpdate;
    }

    /**
     * Checks if this Category object is logically equal to another object.
     * Two `Category` objects are considered equal if their `categoryId`, `name`,
     * and `lastUpdate` values are identical. This method provides the same
     * logical equality as Java's `equals()` method.
     *
     * @param {object} other - The object to compare with.
     * @returns {boolean} `true` if the objects are logically equal, `false` otherwise.
     */
    equals(other) {
        if (this === other) {
            return true; // Same instance
        }
        if (!(other instanceof Category)) {
            return false; // Not an instance of Category
        }

        // Compare properties for logical equality
        return this._categoryId === other._categoryId &&
               this._name === other._name &&
               this._lastUpdate.getTime() === other._lastUpdate.getTime(); // Compare Date objects by their time value
    }

    /**
     * Returns a string representation of the Category object.
     * This is useful for logging, debugging, and quick inspection of the object's state.
     *
     * @returns {string} A string representation of the category, including its ID, name, and last update timestamp.
     */
    toString() {
        return `Category(id=${this._categoryId}, name='${this._name}', lastUpdate='${this._lastUpdate.toISOString()}')`;
    }

    /**
     * Converts the Category object to a plain JavaScript object.
     * This is particularly useful for serialization (e.g., to JSON for API responses)
     * or when passing data to other layers that expect simple data structures.
     * Dates are converted to ISO 8601 strings for consistent representation.
     *
     * @returns {object} A plain object representation of the category's data.
     */
    toObject() {
        return {
            categoryId: this._categoryId,
            name: this._name,
            lastUpdate: this._lastUpdate.toISOString() // Consistent date format
        };
    }

    // --- Asynchronous Operations (Conceptual for Database Interaction) ---
    // The Category class itself is a data model, and its core methods (getters, setters, equals)
    // are synchronous. Asynchronous operations (like fetching from or saving to a database)
    // would typically reside in a separate 'Repository' or 'Service' layer that utilizes
    // this model. However, to demonstrate async/await as requested, conceptual methods
    // for database interaction are included here.

    /**
     * Asynchronously fetches a Category from a data source (e.g., database) by its ID.
     * This is a conceptual static factory method demonstrating asynchronous data retrieval.
     * In a real application, this would involve actual database queries via an ORM or client.
     *
     * @static
     * @async
     * @param {number} id - The ID of the category to fetch. Must be a positive integer.
     * @returns {Promise<Category|null>} A promise that resolves to a `Category` instance if found, otherwise `null`.
     * @throws {Error} If the provided `id` is invalid or if a database error occurs.
     */
    static async findById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error(`CategoryRepositoryError: Invalid ID '${id}' for findById. Must be a positive integer.`);
        }

        try {
            // Simulate an asynchronous database call (e.g., using a database client or ORM)
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network/DB latency

            // --- Placeholder for actual database interaction ---
            // Example:
            // const dbResult = await someDatabaseClient.query('SELECT * FROM category WHERE category_id = ?', [id]);
            // if (dbResult && dbResult.length > 0) {
            //     const data = dbResult[0];
            //     return new Category({
            //         categoryId: data.category_id,
            //         name: data.name,
            //         lastUpdate: data.last_update // Assuming DB returns a Date or parseable string
            //     });
            // }

            // Mock data for demonstration
            if (id === 1) {
                return new Category({
                    categoryId: 1,
                    name: 'Action',
                    lastUpdate: '2006-02-15T04:46:27.000Z'
                });
            } else if (id === 2) {
                return new Category({
                    categoryId: 2,
                    name: 'Animation',
                    lastUpdate: '2006-02-15T04:46:27.000Z'
                });
            }
            return null; // Category not found
        } catch (error) {
            console.error(`CategoryRepositoryError: Failed to fetch category with ID ${id}.`, error);
            throw new Error(`CategoryRepositoryError: Database operation failed for findById(${id}).`);
        }
    }

    /**
     * Asynchronously saves the current Category instance to a data source (e.g., database).
     * This is a conceptual instance method demonstrating asynchronous data persistence.
     * It handles both creation (if `categoryId` is not set or is a placeholder) and updates.
     * In a real application, this would involve actual database INSERT/UPDATE queries.
     *
     * @async
     * @returns {Promise<Category>} A promise that resolves to the saved `Category` instance.
     *          If it was a new category, its `categoryId` might be updated with the database-generated ID.
     * @throws {Error} If there's an issue saving the category to the database.
     */
    async save() {
        try {
            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network/DB latency

            // --- Placeholder for actual database interaction ---
            // Example:
            // let result;
            // if (this._categoryId && this._categoryId > 0) {
            //     // Update existing record
            //     result = await someDatabaseClient.update('category', {
            //         name: this._name,
            //         last_update: new Date() // Update timestamp on save
            //     }, { category_id: this._categoryId });
            // } else {
            //     // Insert new record
            //     result = await someDatabaseClient.insert('category', {
            //         name: this._name,
            //         last_update: new Date()
            //     });
            //     this._categoryId = result.insertId; // Assuming DB returns the new ID
            // }

            // For demonstration, update lastUpdate and log
            this.lastUpdate = new Date(); // Simulate DB updating the timestamp
            console.log(`[DB] Successfully saved/updated Category: ${this.toString()}`);
            return this;
        } catch (error) {
            console.error(`CategoryRepositoryError: Failed to save category ${this.toString()}.`, error);
            throw new Error(`CategoryRepositoryError: Database operation failed for save().`);
        }
    }
}

/**
 * Exports the Category class for use in other modules.
 * @module Category
 */
module.exports = Category;