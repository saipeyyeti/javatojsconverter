```javascript
/**
 * @file Category.js
 * @description Represents a Category entity, mapping directly to a database table.
 * This class serves as a persistent entity for managing category data,
 * translated from a Java JPA Entity.
 */

/**
 * Represents a Category entity.
 * This class encapsulates category data, providing controlled access through
 * getters and setters, and defines logical equality for Category objects.
 * It's designed to be a Plain Old JavaScript Object (POJO) with persistence
 * concerns (like primary key, column mapping) indicated via JSDoc,
 * mirroring its Java JPA Entity origin.
 */
class Category {
    /**
     * @private
     * @type {number}
     * @description The unique identifier for the category. Corresponds to JPA's @Id and @Column(name = "category_id").
     */
    _categoryId;

    /**
     * @private
     * @type {string}
     * @description The name of the category. Corresponds to JPA's @Column(name = "name").
     */
    _name;

    /**
     * @private
     * @type {Date}
     * @description The timestamp of the last update for the category. Corresponds to JPA's @Column(name = "last_update").
     */
    _lastUpdate;

    /**
     * Creates an instance of Category.
     * @param {number} categoryId - The unique identifier for the category.
     * @param {string} name - The name of the category.
     * @param {Date|string} lastUpdate - The timestamp of the last update for the category. Can be a Date object or a string parseable by Date.
     * @throws {Error} If any initial property is invalid.
     */
    constructor(categoryId, name, lastUpdate) {
        // Initialize properties using setters for validation
        this.setCategoryId(categoryId);
        this.setName(name);
        this.setLastUpdate(lastUpdate);
    }

    /**
     * Gets the category ID.
     * @returns {number} The category ID.
     */
    get categoryId() {
        return this._categoryId;
    }

    /**
     * Sets the category ID.
     * @param {number} value - The new category ID.
     * @throws {Error} If the category ID is not a valid positive integer.
     */
    set categoryId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
            throw new Error('Category ID must be a positive integer.');
        }
        this._categoryId = value;
    }

    /**
     * Gets the name of the category.
     * @returns {string} The name of the category.
     */
    get name() {
        return this._name;
    }

    /**
     * Sets the name of the category.
     * @param {string} value - The new name for the category.
     * @throws {Error} If the name is not a non-empty string.
     */
    set name(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Category name must be a non-empty string.');
        }
        this._name = value.trim();
    }

    /**
     * Gets the last update timestamp.
     * @returns {Date} The last update timestamp.
     */
    get lastUpdate() {
        return this._lastUpdate;
    }

    /**
     * Sets the last update timestamp.
     * @param {Date|string} value - The new last update timestamp. Can be a Date object or a string parseable by Date.
     * @throws {Error} If the value is not a valid Date object or a string that can be parsed into a valid Date.
     */
    set lastUpdate(value) {
        let dateValue;
        if (value instanceof Date) {
            dateValue = value;
        } else if (typeof value === 'string') {
            dateValue = new Date(value);
        } else {
            throw new Error('Last update must be a Date object or a valid date string.');
        }

        if (isNaN(dateValue.getTime())) {
            throw new Error('Invalid date provided for lastUpdate.');
        }
        this._lastUpdate = dateValue;
    }

    /**
     * Determines whether this Category object is logically equal to another object.
     * Two Category objects are considered equal if their `categoryId`, `name`, and `lastUpdate` are identical.
     * This method mirrors the `equals()` contract from Java.
     * @param {Object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(other) {
        if (this === other) {
            return true;
        }
        // Check if 'other' is null, not an object, or not an instance of Category
        if (other === null || typeof other !== 'object' || !(other instanceof Category)) {
            return false;
        }

        // Compare primitive types directly
        if (this._categoryId !== other.categoryId) {
            return false;
        }

        // Compare strings
        if (this._name !== other.name) {
            return false;
        }

        // Compare Date objects (timestamps)
        // Handle cases where one or both might be null/undefined
        if (this._lastUpdate && other.lastUpdate) {
            if (this._lastUpdate.getTime() !== other.lastUpdate.getTime()) {
                return false;
            }
        } else if (this._lastUpdate !== other.lastUpdate) { // One is null/undefined, the other is not
            return false;
        }

        return true;
    }

    /**
     * Generates a hash code for the Category object.
     * This method provides a consistent string representation based on the object's key properties,
     * useful for custom hashing implementations or debugging.
     * Note: JavaScript's built-in Map/Set use reference equality by default.
     * This method mirrors the `hashCode()` contract from Java.
     * @returns {string} A string representation of the object's hash.
     */
    hashCode() {
        // A simple way to create a "hash" string for comparison/identification.
        // In a real-world scenario for hash-based collections, you might use a library
        // or a more sophisticated hashing algorithm.
        const categoryIdPart = this._categoryId;
        const namePart = this._name;
        const lastUpdatePart = this._lastUpdate ? this._lastUpdate.toISOString() : 'null';

        // Using a simple string concatenation for hashing.
        // A more robust hash function might involve a cryptographic hash or a polynomial rolling hash.
        return `${categoryIdPart}|${namePart}|${lastUpdatePart}`;
    }

    /**
     * Returns a string representation of the Category object.
     * @returns {string} A string representation of the Category.
     */
    toString() {
        return `Category { id: ${this._categoryId}, name: '${this._name}', lastUpdate: '${this._lastUpdate ? this._lastUpdate.toISOString() : 'null'}' }`;
    }

    /**
     * Simulates fetching a Category by its ID from a data source asynchronously.
     * This is an example of an asynchronous operation that would typically reside in a repository or service layer,
     * demonstrating the use of `async/await` as requested.
     * @param {number} id - The ID of the category to fetch.
     * @returns {Promise<Category|null>} A promise that resolves to a Category object if found, or null if not found.
     * @throws {Error} If an invalid ID is provided or an error occurs during the simulated fetch operation.
     */
    static async fetchById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid category ID provided for fetchById: ID must be a positive integer.');
        }

        try {
            console.log(`[Category.fetchById] Attempting to fetch category with ID: ${id}`);
            // Simulate a database call or API request delay
            await new Promise(resolve => setTimeout(resolve, 150));

            // In a real application, this would involve a database query
            // using an ORM like Sequelize or TypeORM.
            // For demonstration, we return mock data.
            if (id === 1) {
                return new Category(1, 'Action', new Date('2023-01-15T10:00:00Z'));
            } else if (id === 2) {
                return new Category(2, 'Comedy', new Date('2023-02-20T14:30:00Z'));
            } else if (id === 3) {
                return new Category(3, 'Drama', new Date('2023-03-01T08:15:00Z'));
            } else {
                console.log(`[Category.fetchById] Category with ID ${id} not found.`);
                return null; // Category not found
            }
        } catch (error) {
            // Log the error and re-throw a more user-friendly error
            console.error(`[Category.fetchById] Error fetching category with ID ${id}:`, error.message, error.stack);
            throw new Error(`Failed to fetch category by ID: ${id}. Details: ${error.message}`);
        }
    }
}

// Export the Category class for use in other modules
module.exports = Category;

/*
// Example Usage (for testing purposes, not part of the module export)
(async () => {
    try {
        // Create Category instances
        const category1 = new Category(1, 'Horror', new Date());
        const category2 = new Category(2, 'Sci-Fi', '2023-10-26T10:30:00Z');
        const category3 = new Category(1, 'Horror', new Date()); // Same as category1 for equals test
        const category4 = new Category(4, 'Thriller', new Date('2023-11-01T12:00:00Z'));

        console.log('--- Category Instances ---');
        console.log(category1.toString());
        console.log(category2.toString());
        console.log(category3.toString());
        console.log(category4.toString());

        // Test Getters
        console.log('\n--- Getters ---');
        console.log(`Category 1 ID: ${category1.categoryId}`);
        console.log(`Category 2 Name: ${category2.name}`);
        console.log(`Category 4 Last Update: ${category4.lastUpdate.toISOString()}`);

        // Test Setters with validation
        console.log('\n--- Setters (with validation) ---');
        try {
            category1.setName(''); // Should throw error
        } catch (e) {
            console.error(`Setter Error (expected): ${e.message}`);
        }
        try {
            category2.setCategoryId(0); // Should throw error
        } catch (e) {
            console.error(`Setter Error (expected): ${e.message}`);
        }
        try {
            category4.setLastUpdate('invalid-date'); // Should throw error
        } catch (e) {
            console.error(`Setter Error (expected): ${e.message}`);
        }
        category1.setName('Updated Horror');
        console.log(`Category 1 Name after update: ${category1.name}`);

        // Test equals()
        console.log('\n--- Equals Method ---');
        console.log(`category1 equals category3 (same data): ${category1.equals(category3)}`); // Should be true
        console.log(`category1 equals category2 (different data): ${category1.equals(category2)}`); // Should be false
        console.log(`category1 equals null: ${category1.equals(null)}`); // Should be false
        console.log(`category1 equals plain object: ${category1.equals({ categoryId: 1, name: 'Horror', lastUpdate: category1.lastUpdate })}`); // Should be false (not instance of Category)

        // Test hashCode()
        console.log('\n--- HashCode Method ---');
        console.log(`category1 hash: ${category1.hashCode()}`);
        console.log(`category3 hash: ${category3.hashCode()}`);
        console.log(`category2 hash: ${category2.hashCode()}`);
        console.log(`Hashes match for equal objects: ${category1.hashCode() === category3.hashCode()}`); // Should be true

        // Test async fetchById
        console.log('\n--- Async fetchById Method ---');
        const fetchedCategory1 = await Category.fetchById(1);
        console.log(`Fetched Category 1: ${fetchedCategory1 ? fetchedCategory1.toString() : 'Not Found'}`);

        const fetchedCategory5 = await Category.fetchById(5);
        console.log(`Fetched Category 5: ${fetchedCategory5 ? fetchedCategory5.toString() : 'Not Found'}`);

        // Test async fetchById with error handling
        try {
            await Category.fetchById(-1); // Invalid ID
        } catch (e) {
            console.error(`Async Error (expected): ${e.message}`);
        }

    } catch (error) {
        console.error('An unexpected error occurred during example usage:', error);
    }
})();
*/
```