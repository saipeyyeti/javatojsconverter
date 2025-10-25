/**
 * @module FilmActorPK
 * @description This module defines the `FilmActorPK` class, a composite primary key
 *              class designed for use in Node.js/JavaScript applications. It serves
 *              an analogous purpose to JPA's `@EmbeddedId` or `@IdClass` in Java,
 *              encapsulating the components of a compound primary key.
 *
 *              This class functions as a Value Object, where its identity is
 *              determined by the values of its properties (`actorId` and `filmId`)
 *              rather than its object reference.
 */

/**
 * Represents a composite primary key for a `FilmActor` relationship.
 * This class encapsulates the `actorId` and `filmId` that together form the unique
 * identifier for a record in a `FilmActor` join table.
 *
 * It provides methods for equality comparison, a unique string representation
 * (useful for hashing/keying in collections), and serialization/deserialization.
 */
class FilmActorPK {
    /**
     * The unique identifier for the actor.
     * @private
     * @type {number}
     */
    #actorId;

    /**
     * The unique identifier for the film.
     * @private
     * @type {number}
     */
    #filmId;

    /**
     * Creates an instance of `FilmActorPK`.
     *
     * @param {number} actorId - The unique identifier for the actor. Must be an integer.
     * @param {number} filmId - The unique identifier for the film. Must be an integer.
     * @throws {Error} If `actorId` or `filmId` are not valid integer numbers.
     */
    constructor(actorId, filmId) {
        if (typeof actorId !== 'number' || !Number.isInteger(actorId)) {
            throw new Error(`Invalid actorId: Expected an integer number, but received ${typeof actorId} (${actorId}).`);
        }
        if (typeof filmId !== 'number' || !Number.isInteger(filmId)) {
            throw new Error(`Invalid filmId: Expected an integer number, but received ${typeof filmId} (${filmId}).`);
        }

        this.#actorId = actorId;
        this.#filmId = filmId;
    }

    /**
     * Gets the actor ID.
     * This property represents a component of the composite primary key.
     *
     * @returns {number} The actor's unique identifier.
     */
    get actorId() {
        return this.#actorId;
    }

    /**
     * Sets the actor ID.
     *
     * @param {number} newActorId - The new actor ID. Must be an integer.
     * @throws {Error} If `newActorId` is not a valid integer number.
     */
    set actorId(newActorId) {
        if (typeof newActorId !== 'number' || !Number.isInteger(newActorId)) {
            throw new Error(`Invalid actorId: Expected an integer number, but received ${typeof newActorId} (${newActorId}).`);
        }
        this.#actorId = newActorId;
    }

    /**
     * Gets the film ID.
     * This property represents a component of the composite primary key.
     *
     * @returns {number} The film's unique identifier.
     */
    get filmId() {
        return this.#filmId;
    }

    /**
     * Sets the film ID.
     *
     * @param {number} newFilmId - The new film ID. Must be an integer.
     * @throws {Error} If `newFilmId` is not a valid integer number.
     */
    set filmId(newFilmId) {
        if (typeof newFilmId !== 'number' || !Number.isInteger(newFilmId)) {
            throw new Error(`Invalid filmId: Expected an integer number, but received ${typeof newFilmId} (${newFilmId}).`);
        }
        this.#filmId = newFilmId;
    }

    /**
     * Checks if this `FilmActorPK` instance is equal to another object.
     * Two `FilmActorPK` instances are considered equal if and only if both their
     * `actorId` and `filmId` values are identical.
     *
     * This method is crucial for correctly identifying and managing entities,
     * especially when working with collections or comparing primary keys.
     *
     * @param {object} other - The object to compare with.
     * @returns {boolean} `true` if the objects are equal, `false` otherwise.
     */
    equals(other) {
        // Optimization: if it's the exact same object reference, they are equal.
        if (this === other) {
            return true;
        }
        // If the other object is null, undefined, or not an instance of FilmActorPK, they are not equal.
        // This mirrors Java's `o == null || getClass() != o.getClass()` behavior.
        if (!(other instanceof FilmActorPK)) {
            return false;
        }
        // Compare the internal private fields for value equality.
        return this.#actorId === other.#actorId && this.#filmId === other.#filmId;
    }

    /**
     * Generates a unique string representation of this primary key.
     * This method serves a similar purpose to Java's `hashCode()` in that it provides
     * a consistent, unique identifier for the object based on its values.
     *
     * In JavaScript, native `Map`s and `Set`s use reference equality for objects.
     * This `toKeyString()` method allows `FilmActorPK` instances to be used as keys
     * in custom `Map`s or `Set`s (or as properties in plain objects) to ensure
     * value-based uniqueness and lookup, by using this string as the actual key.
     *
     * The format is designed to be unambiguous and easily parsable if needed.
     *
     * @returns {string} A unique string representation of the composite key
     *                   (e.g., "PK_A123_F456").
     */
    toKeyString() {
        // Using a consistent prefix and separator ensures uniqueness and readability.
        // This effectively acts as a "hash code" for JavaScript's string-keyed collections.
        return `PK_A${this.#actorId}_F${this.#filmId}`;
    }

    /**
     * Provides a human-readable string representation of the `FilmActorPK` object.
     * This is particularly useful for logging, debugging, and general inspection.
     *
     * @returns {string} A string representation of the object
     *                   (e.g., "FilmActorPK(actorId=1, filmId=10)").
     */
    toString() {
        return `FilmActorPK(actorId=${this.#actorId}, filmId=${this.#filmId})`;
    }

    /**
     * Converts the `FilmActorPK` instance to a plain JavaScript object.
     * This method is automatically called by `JSON.stringify()` when serializing
     * the object, making it easily convertible to JSON.
     *
     * @returns {{actorId: number, filmId: number}} A plain object representation
     *                                             suitable for JSON serialization.
     */
    toJSON() {
        return {
            actorId: this.#actorId,
            filmId: this.#filmId,
        };
    }

    /**
     * Creates a `FilmActorPK` instance from a plain JavaScript object.
     * This static factory method is useful for deserialization (e.g., from JSON)
     * or when constructing an instance from raw data.
     *
     * @param {object} data - An object containing `actorId` and `filmId` properties.
     * @returns {FilmActorPK} A new `FilmActorPK` instance.
     * @throws {Error} If the input `data` is invalid, not an object, or missing
     *                 required `actorId` or `filmId` properties, or if their values are invalid.
     */
    static fromJSON(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data for FilmActorPK.fromJSON: Input must be a non-null object.');
        }
        // The constructor handles the validation of actorId and filmId types.
        return new FilmActorPK(data.actorId, data.filmId);
    }
}

export default FilmActorPK;