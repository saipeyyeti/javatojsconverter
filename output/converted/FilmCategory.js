```javascript
/**
 * @file FilmCategory.js
 * @module models/FilmCategory
 * @description Represents the FilmCategory entity, mapping to the 'film_category' table in the 'sakila' database.
 *              This class is a JavaScript equivalent of a JPA Entity, designed to hold data and define its structure.
 *              It encapsulates the data for a film-category association, including its composite primary key
 *              (`filmId`, `categoryId`) and `lastUpdate` timestamp.
 *
 *              In a Node.js environment, this class would typically be used in conjunction with an ORM
 *              (e.g., Sequelize, TypeORM, Prisma) to interact with the database. The JPA annotations
 *              from the original Java model are conceptually represented in JSDoc comments.
 *
 *              **JPA Conceptual Mapping:**
 *              - `@Entity`: Represented by this class's purpose as a data model.
 *              - `@Table(name = "film_category", schema = "sakila", catalog = "")`: Implied by the class name and context.
 *              - `@IdClass(FilmCategoryPK.class)`: The composite primary key logic is handled directly within this class
 *                via `filmId` and `categoryId` properties, and the `isEqual()` and `getCompositeKey()` methods.
 *                A separate `FilmCategoryPK` class is not strictly necessary in a plain JS model but the concept is maintained.
 */
class FilmCategory {
    /**
     * @private
     * @type {number}
     * @description The ID of the film. Part of the composite primary key.
     *              Corresponds to the `film_id` column in the `film_category` table.
     *              JPA equivalent: `@Id @Column(name = "film_id")`
     */
    #filmId;

    /**
     * @private
     * @type {number}
     * @description The ID of the category. Part of the composite primary key.
     *              Corresponds to the `category_id` column in the `film_category` table.
     *              JPA equivalent: `@Id @Column(name = "category_id")`
     */
    #categoryId;

    /**
     * @private
     * @type {Date}
     * @description The timestamp of the last update.
     *              Corresponds to the `last_update` column in the `film_category` table.
     *              JPA equivalent: `@Basic @Column(name = "last_update")`
     */
    #lastUpdate;

    /**
     * Creates an instance of FilmCategory.
     *
     * @param {number} filmId - The ID of the film. Must be an integer.
     * @param {number} categoryId - The ID of the category. Must be an integer.
     * @param {Date|string} lastUpdate - The timestamp of the last update. Can be a Date object or a string parseable by Date.
     * @throws {TypeError} If filmId or categoryId are not valid numbers, or if lastUpdate is not a valid Date.
     */
    constructor(filmId, categoryId, lastUpdate) {
        // Use setters for initial validation and assignment
        this.filmId = filmId;
        this.categoryId = categoryId;
        this.lastUpdate = lastUpdate;
    }

    /**
     * Gets the film ID.
     * @returns {number} The film ID.
     */
    get filmId() {
        return this.#filmId;
    }

    /**
     * Sets the film ID.
     * @param {number} value - The new film ID. Must be an integer.
     * @throws {TypeError} If the value is not a valid integer.
     */
    set filmId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            throw new TypeError('Film ID must be an integer.');
        }
        this.#filmId = value;
    }

    /**
     * Gets the category ID.
     * @returns {number} The category ID.
     */
    get categoryId() {
        return this.#categoryId;
    }

    /**
     * Sets the category ID.
     * @param {number} value - The new category ID. Must be an integer.
     * @throws {TypeError} If the value is not a valid integer.
     */
    set categoryId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            throw new TypeError('Category ID must be an integer.');
        }
        this.#categoryId = value;
    }

    /**
     * Gets the last update timestamp.
     * @returns {Date} The last update timestamp.
     */
    get lastUpdate() {
        return this.#lastUpdate;
    }

    /**
     * Sets the last update timestamp.
     * @param {Date|string} value - The new last update timestamp. Can be a Date object or a string parseable by Date.
     * @throws {TypeError} If the value is not a valid Date.
     */
    set lastUpdate(value) {
        let dateValue;
        if (value === null || value === undefined) {
            dateValue = null; // Allow null, similar to Java's Timestamp
        } else if (value instanceof Date) {
            dateValue = value;
        } else if (typeof value === 'string') {
            dateValue = new Date(value);
        } else {
            throw new TypeError('Last update must be a Date object, a valid date string, null, or undefined.');
        }

        if (dateValue !== null && isNaN(dateValue.getTime())) {
            throw new TypeError('Invalid date provided for last update.');
        }
        this.#lastUpdate = dateValue;
    }

    /**
     * Checks if this FilmCategory object is equal to another object.
     *
     * This method conceptually replicates the `equals()` method from the Java model.
     * Two `FilmCategory` objects are considered equal if their `filmId`, `categoryId`,
     * and `lastUpdate` values are identical. This is crucial for correct object
     * comparison and behavior in collections or persistence contexts.
     *
     * @param {Object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    isEqual(other) {
        if (this === other) {
            return true;
        }
        // Check if 'other' is null, not an object, or not an instance of FilmCategory
        if (other === null || typeof other !== 'object' || !(other instanceof FilmCategory)) {
            return false;
        }

        // Compare primitive parts of the composite key
        if (this.#filmId !== other.filmId || this.#categoryId !== other.categoryId) {
            return false;
        }

        // Compare lastUpdate (Date objects). Handle null/undefined dates gracefully,
        // similar to Java's Objects.equals for nullable fields.
        const thisLastUpdateMillis = this.#lastUpdate ? this.#lastUpdate.getTime() : null;
        const otherLastUpdateMillis = other.lastUpdate ? other.lastUpdate.getTime() : null;

        return thisLastUpdateMillis === otherLastUpdateMillis;
    }

    /**
     * Generates a unique string representation of the composite primary key.
     *
     * This method serves a similar purpose to `hashCode()` in Java, providing a
     * consistent identifier for the object based on its primary key components.
     * It's useful for using `FilmCategory` objects as keys in JavaScript Maps
     * (by using this string as the key) or for quick identity checks.
     *
     * @returns {string} A string representing the composite key (e.g., "film_123-category_456").
     */
    getCompositeKey() {
        return `film_${this.#filmId}-category_${this.#categoryId}`;
    }

    /**
     * Converts the FilmCategory object to a plain JavaScript object.
     * This is useful for serialization (e.g., to JSON) or for passing data
     * to other layers that expect simple data structures.
     *
     * @returns {Object} A plain object representation of the FilmCategory.
     */
    toJSON() {
        return {
            filmId: this.#filmId,
            categoryId: this.#categoryId,
            // Convert Date object to ISO string for consistent JSON representation
            lastUpdate: this.#lastUpdate ? this.#lastUpdate.toISOString() : null
        };
    }

    /**
     * Static factory method to create a FilmCategory instance from a plain object.
     * This is useful for deserialization (e.g., from JSON or database results)
     * where data might initially come as a simple object.
     *
     * @param {Object} data - A plain object containing `filmId`, `categoryId`, and `lastUpdate` properties.
     * @returns {FilmCategory} A new FilmCategory instance.
     * @throws {TypeError} If required data properties are missing or invalid in the input object.
     */
    static fromObject(data) {
        if (!data || typeof data !== 'object') {
            throw new TypeError('Input data for FilmCategory.fromObject must be a non-null object.');
        }
        const { filmId, categoryId, lastUpdate } = data;

        // The constructor handles validation, so we just pass the extracted data.
        // This ensures consistency with the validation logic in setters.
        return new FilmCategory(filmId, categoryId, lastUpdate);
    }
}

// Export the FilmCategory class for use in other modules.
module.exports = FilmCategory;
```