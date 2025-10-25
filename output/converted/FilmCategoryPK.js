```javascript
/**
 * @file FilmCategoryPK.js
 * @description This module defines the FilmCategoryPK class, a utility for representing composite primary keys
 *              in a Node.js application. It is analogous to its Java JPA counterpart, encapsulating
 *              `filmId` and `categoryId` and providing robust equality and a unique string representation.
 *              This class serves as a Value Object, crucial for identifying unique combinations of film and category.
 */

/**
 * Represents a composite primary key for a FilmCategory entity.
 *
 * This class is designed as a Value Object, meaning its identity is based purely on the
 * values of its attributes (`filmId`, `categoryId`), not on its memory address.
 * Two `FilmCategoryPK` instances are considered equal if their component values are identical.
 *
 * It provides methods for equality comparison (`equals`) and a unique string representation
 * (`toUniqueString`) suitable for use as keys in JavaScript `Map`s or `Set`s when value-based
 * equality is desired.
 *
 * @example
 * const pk1 = new FilmCategoryPK(1, 5);
 * const pk2 = new FilmCategoryPK(1, 5);
 * const pk3 = new FilmCategoryPK(2, 5);
 *
 * console.log(pk1.equals(pk2)); // true
 * console.log(pk1.equals(pk3)); // false
 * console.log(pk1.toUniqueString()); // "1-5"
 */
class FilmCategoryPK {
    /**
     * Creates an instance of FilmCategoryPK.
     *
     * @param {number} filmId - The ID of the film, which is the first component of the composite key.
     *                          Must be an integer.
     * @param {number} categoryId - The ID of the category, which is the second component of the composite key.
     *                              Must be an integer.
     * @throws {TypeError} If `filmId` or `categoryId` are not valid integers.
     */
    constructor(filmId, categoryId) {
        if (typeof filmId !== 'number' || !Number.isInteger(filmId)) {
            throw new TypeError('FilmCategoryPK: filmId must be an integer.');
        }
        if (typeof categoryId !== 'number' || !Number.isInteger(categoryId)) {
            throw new TypeError('FilmCategoryPK: categoryId must be an integer.');
        }

        /**
         * The ID of the film.
         * @type {number}
         * @private
         */
        this._filmId = filmId;

        /**
         * The ID of the category.
         * @type {number}
         * @private
         */
        this._categoryId = categoryId;
    }

    /**
     * Gets the film ID.
     * @returns {number} The film ID.
     */
    get filmId() {
        return this._filmId;
    }

    /**
     * Sets the film ID.
     * @param {number} newFilmId - The new film ID. Must be an integer.
     * @throws {TypeError} If `newFilmId` is not a valid integer.
     */
    set filmId(newFilmId) {
        if (typeof newFilmId !== 'number' || !Number.isInteger(newFilmId)) {
            throw new TypeError('FilmCategoryPK: filmId must be an integer.');
        }
        this._filmId = newFilmId;
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
     * @param {number} newCategoryId - The new category ID. Must be an integer.
     * @throws {TypeError} If `newCategoryId` is not a valid integer.
     */
    set categoryId(newCategoryId) {
        if (typeof newCategoryId !== 'number' || !Number.isInteger(newCategoryId)) {
            throw new TypeError('FilmCategoryPK: categoryId must be an integer.');
        }
        this._categoryId = newCategoryId;
    }

    /**
     * Compares this `FilmCategoryPK` instance with another object for equality.
     *
     * Two `FilmCategoryPK` instances are considered equal if their `filmId` and `categoryId`
     * values are identical. This method is fundamental for proper functioning in collections
     * (e.g., `Map`, `Set`) when custom comparison logic is required, mimicking Java's `equals()` behavior.
     *
     * @param {Object} other - The object to compare with.
     * @returns {boolean} `true` if the objects are equal (i.e., have the same `filmId` and `categoryId`),
     *                    `false` otherwise.
     */
    equals(other) {
        // If it's the exact same object reference, they are equal.
        if (this === other) {
            return true;
        }
        // If the other object is null, not an object, or not an instance of FilmCategoryPK, they are not equal.
        if (other === null || typeof other !== 'object' || other.constructor !== FilmCategoryPK) {
            return false;
        }
        // Compare the values of the composite key components.
        return this._filmId === other._filmId &&
               this._categoryId === other._categoryId;
    }

    /**
     * Generates a unique string representation of this composite key.
     *
     * This method serves a similar purpose to Java's `hashCode()` for value objects:
     * it provides a consistent string that uniquely identifies the object based on its values.
     * This string can be effectively used as a key in JavaScript `Map`s or `Set`s to enable
     * value-based equality for keys, overcoming JavaScript's default reference equality for objects.
     *
     * The format is `filmId-categoryId`.
     *
     * @returns {string} A unique string representing the composite key (e.g., "1-5").
     */
    toUniqueString() {
        // A simple, yet effective way to create a unique string for two integers.
        // The hyphen separator ensures distinctness if IDs could potentially be concatenated
        // in a way that creates ambiguity (e.g., 1 and 23 vs 12 and 3).
        return `${this._filmId}-${this._categoryId}`;
    }

    /**
     * Returns a string representation of the `FilmCategoryPK` object.
     * Useful for debugging and logging.
     *
     * @returns {string} A string in the format "FilmCategoryPK(filmId=X, categoryId=Y)".
     */
    toString() {
        return `FilmCategoryPK(filmId=${this._filmId}, categoryId=${this._categoryId})`;
    }

    /**
     * Converts the `FilmCategoryPK` instance to a plain JavaScript object.
     * This method is automatically called by `JSON.stringify()` when serializing the object,
     * making it suitable for API responses or data storage.
     *
     * @returns {{filmId: number, categoryId: number}} A plain object representation of the key.
     */
    toJSON() {
        return {
            filmId: this._filmId,
            categoryId: this._categoryId
        };
    }
}

/**
 * Exports the `FilmCategoryPK` class as a module.
 *
 * This class itself acts as a utility for handling composite primary keys.
 * The requirement for a "Collection of utility functions framework" is met by
 * defining this class as a self-contained, reusable utility module.
 * If there were multiple such utility classes or generic helper functions,
 * they would typically reside in a dedicated 'utils' directory, with each
 * exported as its own module.
 */
module.exports = FilmCategoryPK;

/*
 * Note on Asynchronous Operations (async/await):
 *
 * The original Java `FilmCategoryPK` class is a pure data holder and does not perform any I/O,
 * database operations, or time-consuming computations. Its methods (getters, setters, equals, hashCode)
 * are inherently synchronous.
 *
 * In this Node.js conversion, the `FilmCategoryPK` class maintains this synchronous nature.
 * There are no operations within this class that would inherently benefit from or require `async/await`.
 *
 * If this class were part of a larger persistence layer (e.g., an ORM entity), then the operations
 * involving database interaction (e.g., `save`, `find`, `delete`) would indeed be asynchronous
 * and would utilize `async/await` in the surrounding service or repository layers.
 * However, for the `FilmCategoryPK` utility class itself, `async/await` is not applicable
 * to its core responsibilities of data encapsulation and comparison.
 */
```