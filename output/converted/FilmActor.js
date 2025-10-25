/**
 * @file This file defines the FilmActor and FilmActorPK data models for a Node.js application,
 *       mirroring the structure and functionality of a Java JPA entity.
 *       It represents the `film_actor` join table in the `sakila` database schema.
 */

/**
 * Represents the composite primary key for the FilmActor entity.
 * In a relational database, this typically maps to the combined primary key columns
 * of the `film_actor` table (`actor_id`, `film_id`).
 *
 * This class is analogous to the `FilmActorPK.java` class used with JPA's `@IdClass` annotation.
 * It provides robust equality and hashing for use in collections.
 */
class FilmActorPK {
    /**
     * The ID of the actor, forming part of the composite primary key.
     * @type {number}
     * @private
     */
    _actorId;

    /**
     * The ID of the film, forming part of the composite primary key.
     * @type {number}
     * @private
     */
    _filmId;

    /**
     * Creates an instance of FilmActorPK.
     * @param {number} actorId - The ID of the actor. Must be a non-negative integer.
     * @param {number} filmId - The ID of the film. Must be a non-negative integer.
     * @throws {Error} If `actorId` or `filmId` are not valid non-negative integers.
     */
    constructor(actorId, filmId) {
        if (typeof actorId !== 'number' || !Number.isInteger(actorId) || actorId < 0) {
            throw new Error('FilmActorPK: actorId must be a non-negative integer.');
        }
        if (typeof filmId !== 'number' || !Number.isInteger(filmId) || filmId < 0) {
            throw new Error('FilmActorPK: filmId must be a non-negative integer.');
        }

        this._actorId = actorId;
        this._filmId = filmId;
    }

    /**
     * Gets the actor ID.
     * @returns {number} The actor ID.
     */
    get actorId() {
        return this._actorId;
    }

    /**
     * Sets the actor ID.
     * @param {number} value - The new actor ID. Must be a non-negative integer.
     * @throws {Error} If the value is not a non-negative integer.
     */
    set actorId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('FilmActorPK: actorId must be a non-negative integer.');
        }
        this._actorId = value;
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
     * @param {number} value - The new film ID. Must be a non-negative integer.
     * @throws {Error} If the value is not a non-negative integer.
     */
    set filmId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('FilmActorPK: filmId must be a non-negative integer.');
        }
        this._filmId = value;
    }

    /**
     * Checks if this FilmActorPK object is equal to another object.
     * Equality is determined by comparing `actorId` and `filmId`.
     * This method is crucial for correct behavior in collections (e.g., `Set`, `Map`).
     * @param {Object} o - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(o) {
        if (this === o) return true;
        if (o === null || this.constructor !== o.constructor) return false;
        const other = /** @type {FilmActorPK} */ (o); // JSDoc type assertion
        return this._actorId === other._actorId &&
               this._filmId === other._filmId;
    }

    /**
     * Generates a hash code for this FilmActorPK object.
     * This is crucial for using FilmActorPK objects as keys in hash-based collections (e.g., `Map`, `Set`).
     * The hash is a string representation of the key components.
     * @returns {string} A string hash code.
     */
    hashCode() {
        return `${this._actorId}|${this._filmId}`;
    }

    /**
     * Returns a string representation of the FilmActorPK object.
     * @returns {string} A string representation.
     */
    toString() {
        return `FilmActorPK { actorId: ${this._actorId}, filmId: ${this._filmId} }`;
    }
}

/**
 * Represents a record in the `film_actor` table of the `sakila` database.
 * This class serves as a data model (analogous to a JPA Entity in Java)
 * for the many-to-many relationship between films and actors.
 *
 * It defines the structure and behavior of a single film-actor association,
 * including its composite primary key components and a last update timestamp.
 *
 * @class
 * @property {number} actorId - The ID of the actor, part of the composite primary key. Maps to `actor_id` column.
 * @property {number} filmId - The ID of the film, part of the composite primary key. Maps to `film_id` column.
 * @property {Date} lastUpdate - The timestamp of the last update. Maps to `last_update` column.
 */
class FilmActor {
    /**
     * The ID of the actor.
     * Maps to the `actor_id` column in the `film_actor` table.
     * This is part of the composite primary key.
     * @type {number}
     * @private
     */
    _actorId;

    /**
     * The ID of the film.
     * Maps to the `film_id` column in the `film_actor` table.
     * This is part of the composite primary key.
     * @type {number}
     * @private
     */
    _filmId;

    /**
     * The timestamp of the last update for this record.
     * Maps to the `last_update` column in the `film_actor` table.
     * @type {Date}
     * @private
     */
    _lastUpdate;

    /**
     * Creates an instance of FilmActor.
     * @param {object} [options={}] - Optional initial properties.
     * @param {number} [options.actorId] - The initial actor ID. Must be a non-negative integer.
     * @param {number} [options.filmId] - The initial film ID. Must be a non-negative integer.
     * @param {Date|string} [options.lastUpdate] - The initial last update timestamp. Can be a Date object or a string parseable by Date.
     * @throws {Error} If any provided option is invalid.
     */
    constructor({ actorId, filmId, lastUpdate } = {}) {
        if (actorId !== undefined) this.actorId = actorId;
        if (filmId !== undefined) this.filmId = filmId;
        if (lastUpdate !== undefined) this.lastUpdate = lastUpdate;
    }

    /**
     * Gets the actor ID.
     * @returns {number} The actor ID.
     */
    get actorId() {
        return this._actorId;
    }

    /**
     * Sets the actor ID.
     * @param {number} value - The new actor ID. Must be a non-negative integer.
     * @throws {Error} If the value is not a non-negative integer.
     */
    set actorId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('FilmActor: actorId must be a non-negative integer.');
        }
        this._actorId = value;
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
     * @param {number} value - The new film ID. Must be a non-negative integer.
     * @throws {Error} If the value is not a non-negative integer.
     */
    set filmId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('FilmActor: filmId must be a non-negative integer.');
        }
        this._filmId = value;
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
        } else if (value === null || value === undefined) {
            dateValue = null; // Allow null/undefined as per Java's Timestamp behavior
        } else {
            throw new Error('FilmActor: lastUpdate must be a Date object, a valid date string, null, or undefined.');
        }

        if (dateValue && isNaN(dateValue.getTime())) {
            throw new Error('FilmActor: lastUpdate must be a valid date.');
        }
        this._lastUpdate = dateValue;
    }

    /**
     * Checks if this FilmActor object is equal to another object.
     * Equality is determined by comparing `actorId`, `filmId`, and `lastUpdate`.
     * This mirrors the `equals()` implementation in the original Java entity,
     * which includes `lastUpdate` in the equality check despite it not being part of the primary key.
     * This method is vital for correct behavior in collections and for entity management.
     * @param {Object} o - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(o) {
        if (this === o) return true;
        if (o === null || this.constructor !== o.constructor) return false;
        const other = /** @type {FilmActor} */ (o); // JSDoc type assertion

        // Compare lastUpdate, handling nulls and comparing time values for Date objects
        const lastUpdateEquals = (this._lastUpdate === other._lastUpdate) ||
                                 (this._lastUpdate && other._lastUpdate &&
                                  this._lastUpdate.getTime() === other._lastUpdate.getTime());

        return this._actorId === other._actorId &&
               this._filmId === other._filmId &&
               lastUpdateEquals;
    }

    /**
     * Generates a hash code for this FilmActor object.
     * This is crucial for using FilmActor objects as keys in hash-based collections (e.g., `Map`, `Set`).
     * The hash is a string representation of the key components (`actorId`, `filmId`) and `lastUpdate`.
     * This mirrors the `hashCode()` implementation in the original Java entity.
     * @returns {string} A string hash code.
     */
    hashCode() {
        // Use getTime() for Date objects to get a comparable numeric value, or 'null' for null/undefined
        const lastUpdateHash = this._lastUpdate ? this._lastUpdate.getTime() : 'null';
        return `${this._actorId}|${this._filmId}|${lastUpdateHash}`;
    }

    /**
     * Returns a string representation of the FilmActor object.
     * @returns {string} A string representation.
     */
    toString() {
        const lastUpdateStr = this._lastUpdate ? this._lastUpdate.toISOString() : 'null';
        return `FilmActor { actorId: ${this._actorId}, filmId: ${this._filmId}, lastUpdate: ${lastUpdateStr} }`;
    }

    /**
     * **Note on Asynchronous Operations (async/await):**
     *
     * This `FilmActor` class is a pure data model and does not inherently contain
     * asynchronous operations. Its primary responsibility is to represent data.
     *
     * In a typical Node.js application, asynchronous operations (like database interactions
     * for fetching, saving, updating, or deleting `FilmActor` records) would be handled
     * in a separate "repository" or "service" layer. This layer would utilize `async/await`
     * to manage promises returned by database drivers or ORMs (e.g., Sequelize, TypeORM, Prisma).
     *
     * **Example of how async/await would be used in a hypothetical `FilmActorRepository`:**
     *