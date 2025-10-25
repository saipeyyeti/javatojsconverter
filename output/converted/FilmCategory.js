/**
 * @file FilmCategory.js
 * @description This file defines the FilmCategory model, representing an association
 *              between a film and a category in the Sakila database.
 *              It mirrors the functionality of a JPA Entity in Java, focusing on
 *              data representation, identity management via a composite key,
 *              and object equality.
 */

/**
 * Represents a FilmCategory entity, mapping to the 'film_category' table in the database.
 * This class serves as a data model for associating films with categories,
 * and includes a composite primary key consisting of `filmId` and `categoryId`.
 *
 * In a Node.js environment, this class acts as a Plain Old JavaScript Object (POJO)
 * for data transfer and manipulation. Persistence (saving to/loading from a database)
 * would typically be handled by an ORM (e.g., Sequelize, TypeORM) in a separate
 * repository or service layer, where asynchronous operations (`async/await`) would be used.
 */
class FilmCategory {
    /**
     * The ID of the film. Part of the composite primary key.
     * @type {number}
     * @private
     */
    #filmId;

    /**
     * The ID of the category. Part of the composite primary key.
     * @type {number}
     * @private
     */
    #categoryId;

    /**
     * The timestamp of the last update for this film-category association.
     * @type {Date|null}
     * @private
     */
    #lastUpdate;

    /**
     * Creates an instance of FilmCategory.
     * @param {number} filmId - The ID of the film.
     * @param {number} categoryId - The ID of the category.
     * @param {Date|string|number|null} lastUpdate - The timestamp of the last update.
     *   Can be a Date object, a string parseable by `new Date()`, a number representing milliseconds, or null.
     * @throws {Error} If filmId, categoryId, or lastUpdate are invalid.
     */
    constructor(filmId, categoryId, lastUpdate) {
        this.setFilmId(filmId);
        this.setCategoryId(categoryId);
        this.setLastUpdate(lastUpdate);
    }

    /**
     * Gets the film ID.
     * @returns {number} The film ID.
     */
    getFilmId() {
        return this.#filmId;
    }

    /**
     * Sets the film ID.
     * @param {number} filmId - The ID of the film.
     * @throws {Error} If filmId is not a valid positive integer.
     */
    setFilmId(filmId) {
        if (typeof filmId !== 'number' || !Number.isInteger(filmId) || filmId <= 0) {
            throw new Error('Film ID must be a positive integer.');
        }
        this.#filmId = filmId;
    }

    /**
     * Gets the category ID.
     * @returns {number} The category ID.
     */
    getCategoryId() {
        return this.#categoryId;
    }

    /**
     * Sets the category ID.
     * @param {number} categoryId - The ID of the category.
     * @throws {Error} If categoryId is not a valid positive integer.
     */
    setCategoryId(categoryId) {
        if (typeof categoryId !== 'number' || !Number.isInteger(categoryId) || categoryId <= 0) {
            throw new Error('Category ID must be a positive integer.');
        }
        this.#categoryId = categoryId;
    }

    /**
     * Gets the last update timestamp.
     * @returns {Date|null} The last update timestamp, or null if not set.
     */
    getLastUpdate() {
        return this.#lastUpdate;
    }

    /**
     * Sets the last update timestamp.
     * @param {Date|string|number|null} lastUpdate - The timestamp of the last update. Can be a Date object,
     *   a string parseable by `new Date()`, a number representing milliseconds, or null.
     * @throws {Error} If lastUpdate is provided but is not a valid Date.
     */
    setLastUpdate(lastUpdate) {
        if (lastUpdate === null || lastUpdate === undefined) {
            this.#lastUpdate = null;
            return;
        }

        let date;
        if (lastUpdate instanceof Date) {
            date = lastUpdate;
        } else if (typeof lastUpdate === 'string' || typeof lastUpdate === 'number') {
            date = new Date(lastUpdate);
        } else {
            throw new Error('Last update must be a Date object, a valid date string/number, or null.');
        }

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date provided for last update.');
        }
        this.#lastUpdate = date;
    }

    /**
     * Checks if this FilmCategory object is equal to another object.
     * Two FilmCategory objects are considered equal if they are both instances of FilmCategory
     * and their `filmId`, `categoryId`, and `lastUpdate` properties are all strictly equal.
     * For `lastUpdate` (Date objects), their time values are compared.
     *
     * @param {Object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(other) {
        if (this === other) return true;
        if (!(other instanceof FilmCategory)) return false;

        // Compare primitive types directly
        if (this.#filmId !== other.#filmId || this.#categoryId !== other.#categoryId) {
            return false;
        }

        // Compare Date objects by their time value, handling nulls
        const thisLastUpdateMs = this.#lastUpdate ? this.#lastUpdate.getTime() : null;
        const otherLastUpdateMs = other.#lastUpdate ? other.#lastUpdate.getTime() : null;

        return thisLastUpdateMs === otherLastUpdateMs;
    }

    /**
     * Generates a unique string representation of the composite primary key (filmId, categoryId).
     * This can be used as a key in Maps or for quick identification, serving a similar purpose
     * to a hash code in Java for composite keys.
     * @returns {string} A string representing the composite key, e.g., "film_123-category_456".
     */
    getCompositeKey() {
        return `film_${this.#filmId}-category_${this.#categoryId}`;
    }

    /**
     * Converts the FilmCategory object to a plain JavaScript object.
     * Useful for serialization (e.g., to JSON).
     * @returns {Object} A plain object representation of the FilmCategory.
     */
    toJSON() {
        return {
            filmId: this.#filmId,
            categoryId: this.#categoryId,
            lastUpdate: this.#lastUpdate ? this.#lastUpdate.toISOString() : null, // ISO string for consistency
        };
    }
}

// Export the FilmCategory class for use in other modules.
export default FilmCategory;

/*
 * Note on Asynchronous Operations:
 * The `FilmCategory` class itself is a synchronous data model.
 * Asynchronous operations (`async/await`) would typically be used in a separate
 * data access layer (e.g., a repository or service) responsible for interacting
 * with a database. For example:
 *
 *