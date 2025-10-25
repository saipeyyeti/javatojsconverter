/**
 * @file FilmCategoryPK.js
 * @description Represents a composite primary key for the FilmCategory entity,
 *              encapsulating filmId and categoryId. This class provides value
 *              object behavior with proper equality and hashing mechanisms.
 *              It is designed to be a data holder for unique identifiers
 *              in a persistence layer, similar to its Java counterpart.
 *
 *              This module exports the FilmCategoryPK class, adhering to the
 *              "collection of utility functions framework" by providing a
 *              well-defined, reusable data structure.
 */

/**
 * @class FilmCategoryPK
 * @description Represents a composite primary key for the FilmCategory entity.
 *              This class encapsulates the `filmId` and `categoryId` that together
 *              form a unique identifier for a record in a `film_category` join table.
 *
 *              It provides value object behavior by implementing `equals()` and
 *              `getHash()` methods, which are essential for comparing and
 *              identifying unique key instances.
 *
 *              In a Node.js/JavaScript environment, this class would typically
 *              be used to represent the unique identifier when interacting with
 *              an ORM or database layer, where the combination of `filmId` and
 *              `categoryId` is the primary key.
 *
 *              **Note on JPA Annotations:** The original Java class used `@Column`
 *              and `@Id` annotations for JPA mapping. These are Java-specific
 *              and have no direct equivalent in standard JavaScript. In a Node.js
 *              application using an ORM (e.g., Sequelize, TypeORM), the mapping
 *              would be defined separately in the ORM's schema configuration
 *              or using decorators (in TypeScript). This JavaScript class focuses
 *              solely on the data holding and value object behavior.
 *
 *              **Note on Asynchronous Operations:** The original Java class is
 *              a synchronous data holder. There are no inherent asynchronous
 *              operations within the responsibilities of a composite primary key
 *              class itself. Therefore, `async/await` is not applicable to
 *              the methods of this class. Any asynchronous database interactions
 *              would occur in a separate service or repository layer that
 *              utilizes instances of this class.
 */
class FilmCategoryPK {
    /**
     * The ID of the film.
     * @type {number}
     * @private
     */
    #filmId;

    /**
     * The ID of the category.
     * @type {number}
     * @private
     */
    #categoryId;

    /**
     * Creates an instance of FilmCategoryPK.
     * @param {number} filmId - The ID of the film. Must be a non-negative integer.
     * @param {number} categoryId - The ID of the category. Must be a non-negative integer.
     * @throws {Error} If `filmId` or `categoryId` are not valid non-negative integers.
     */
    constructor(filmId, categoryId) {
        if (!Number.isInteger(filmId) || filmId < 0) {
            throw new Error(`FilmCategoryPKError: Invalid filmId '${filmId}'. Must be a non-negative integer.`);
        }
        if (!Number.isInteger(categoryId) || categoryId < 0) {
            throw new Error(`FilmCategoryPKError: Invalid categoryId '${categoryId}'. Must be a non-negative integer.`);
        }

        this.#filmId = filmId;
        this.#categoryId = categoryId;
    }

    /**
     * Gets the film ID component of the composite key.
     * @returns {number} The film ID.
     */
    get filmId() {
        return this.#filmId;
    }

    /**
     * Sets the film ID component of the composite key.
     * @param {number} newFilmId - The new film ID. Must be a non-negative integer.
     * @throws {Error} If `newFilmId` is not a valid non-negative integer.
     */
    set filmId(newFilmId) {
        if (!Number.isInteger(newFilmId) || newFilmId < 0) {
            throw new Error(`FilmCategoryPKError: Invalid filmId '${newFilmId}'. Must be a non-negative integer.`);
        }
        this.#filmId = newFilmId;
    }

    /**
     * Gets the category ID component of the composite key.
     * @returns {number} The category ID.
     */
    get categoryId() {
        return this.#categoryId;
    }

    /**
     * Sets the category ID component of the composite key.
     * @param {number} newCategoryId - The new category ID. Must be a non-negative integer.
     * @throws {Error} If `newCategoryId` is not a valid non-negative integer.
     */
    set categoryId(newCategoryId) {
        if (!Number.isInteger(newCategoryId) || newCategoryId < 0) {
            throw new Error(`FilmCategoryPKError: Invalid categoryId '${newCategoryId}'. Must be a non-negative integer.`);
        }
        this.#categoryId = newCategoryId;
    }

    /**
     * Compares this `FilmCategoryPK` instance with another object for equality.
     * Two `FilmCategoryPK` instances are considered equal if they are of the same class
     * and their `filmId` and `categoryId` values are identical.
     *
     * @param {any} other - The object to compare with.
     * @returns {boolean} `true` if the objects are equal, `false` otherwise.
     */
    equals(other) {
        // Check for reference equality first for performance
        if (this === other) {
            return true;
        }

        // Check if the other object is null, not an object, or not an instance of FilmCategoryPK
        if (other === null || typeof other !== 'object' || !(other instanceof FilmCategoryPK)) {
            return false;
        }

        // Compare the internal values
        return this.#filmId === other.#filmId &&
               this.#categoryId === other.#categoryId;
    }

    /**
     * Generates a string representation of the composite key that can be used
     * as a hash code or a unique identifier in hash-based collections (e.g., `Map` keys, `Set` elements).
     * This method ensures consistency with the `equals()` method: if two objects
     * are equal according to `equals()`, their `getHash()` must return the same string.
     *
     * The format is typically "filmId-categoryId".
     *
     * @returns {string} A unique string hash for this composite key.
     */
    getHash() {
        // A simple string concatenation is a common and effective way to create
        // a unique hash for composite keys in JavaScript, suitable for Map/Set keys.
        return `${this.#filmId}-${this.#categoryId}`;
    }

    /**
     * Returns a string representation of the `FilmCategoryPK` object.
     * Useful for logging and debugging.
     * @returns {string} A string in the format "FilmCategoryPK(filmId:X, categoryId:Y)".
     */
    toString() {
        return `FilmCategoryPK(filmId:${this.#filmId}, categoryId:${this.#categoryId})`;
    }

    /**
     * Converts the `FilmCategoryPK` object to a plain JavaScript object.
     * This method is automatically called by `JSON.stringify()` when serializing
     * an instance of `FilmCategoryPK` to JSON.
     * @returns {object} A plain object with `filmId` and `categoryId` properties.
     */
    toJSON() {
        return {
            filmId: this.#filmId,
            categoryId: this.#categoryId
        };
    }

    /**
     * Static factory method to create a `FilmCategoryPK` instance from a plain object.
     * This is useful for deserialization (e.g., when receiving data from a JSON payload).
     *
     * @param {object} data - A plain object containing `filmId` and `categoryId`.
     * @param {number} data.filmId - The film ID.
     * @param {number} data.categoryId - The category ID.
     * @returns {FilmCategoryPK} A new `FilmCategoryPK` instance.
     * @throws {Error} If `data` is not an object, is null, or is missing required properties,
     *                 or if the values are invalid.
     */
    static fromJSON(data) {
        if (typeof data !== 'object' || data === null) {
            throw new Error('FilmCategoryPK.fromJSONError: Input data must be a non-null object.');
        }
        const { filmId, categoryId } = data;

        if (filmId === undefined || categoryId === undefined) {
            throw new Error('FilmCategoryPK.fromJSONError: Input data must contain both filmId and categoryId properties.');
        }

        return new FilmCategoryPK(filmId, categoryId);
    }
}

/**
 * Exports the FilmCategoryPK class as the default export of this module.
 * This allows it to be imported and used as a utility class for handling
 * composite primary keys in a Node.js application.
 * @module FilmCategoryPK
 */
module.exports = FilmCategoryPK;