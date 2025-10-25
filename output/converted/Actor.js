```javascript
/**
 * @file Actor.js
 * @description Represents an Actor entity, mapping directly to a database table.
 * This class serves as a data model (POJO/DTO) for actor records,
 * providing encapsulation and value-based equality.
 */

/**
 * Represents an Actor entity, encapsulating actor data.
 * This class is designed to be a data model, similar to a JPA entity in Java,
 * for representing records from an 'actor' database table. It provides
 * controlled access to its properties and defines value-based equality.
 */
class Actor {
    /**
     * The unique identifier for the actor. Corresponds to the 'actor_id' database column.
     * @private
     * @type {number|undefined}
     */
    #actorId;

    /**
     * The first name of the actor. Corresponds to the 'first_name' database column.
     * @private
     * @type {string|undefined}
     */
    #firstName;

    /**
     * The last name of the actor. Corresponds to the 'last_name' database column.
     * @private
     * @type {string|undefined}
     */
    #lastName;

    /**
     * The timestamp of the last update for this actor record. Corresponds to the 'last_update' database column.
     * @private
     * @type {Date|undefined}
     */
    #lastUpdate;

    /**
     * Creates an instance of Actor.
     * @param {object} [data={}] - An object containing initial actor data.
     * @param {number} [data.actorId] - The actor's ID. Must be a non-negative integer.
     * @param {string} [data.firstName] - The actor's first name. Must be a non-empty string.
     * @param {string} [data.lastName] - The actor's last name. Must be a non-empty string.
     * @param {Date|string} [data.lastUpdate] - The last update timestamp. Can be a Date object or a string parseable by Date.
     * @throws {Error} If any provided data is invalid.
     */
    constructor({ actorId, firstName, lastName, lastUpdate } = {}) {
        try {
            this.actorId = actorId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.lastUpdate = lastUpdate;
        } catch (error) {
            // Re-throw with context for constructor errors
            throw new Error(`Failed to construct Actor: ${error.message}`);
        }
    }

    /**
     * Gets the actor's ID.
     * @returns {number|undefined} The actor's ID.
     */
    get actorId() {
        return this.#actorId;
    }

    /**
     * Sets the actor's ID.
     * @param {number|undefined} value - The new actor ID. Can be `undefined` to clear.
     * @throws {Error} If the value is not a valid non-negative integer.
     */
    set actorId(value) {
        if (value === undefined || value === null) {
            this.#actorId = undefined;
            return;
        }
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('Actor ID must be a non-negative integer.');
        }
        this.#actorId = value;
    }

    /**
     * Gets the actor's first name.
     * @returns {string|undefined} The actor's first name.
     */
    get firstName() {
        return this.#firstName;
    }

    /**
     * Sets the actor's first name.
     * @param {string|undefined} value - The new first name. Can be `undefined` to clear.
     * @throws {Error} If the value is not a non-empty string.
     */
    set firstName(value) {
        if (value === undefined || value === null) {
            this.#firstName = undefined;
            return;
        }
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error('First name must be a non-empty string.');
        }
        this.#firstName = value.trim();
    }

    /**
     * Gets the actor's last name.
     * @returns {string|undefined} The actor's last name.
     */
    get lastName() {
        return this.#lastName;
    }

    /**
     * Sets the actor's last name.
     * @param {string|undefined} value - The new last name. Can be `undefined` to clear.
     * @throws {Error} If the value is not a non-empty string.
     */
    set lastName(value) {
        if (value === undefined || value === null) {
            this.#lastName = undefined;
            return;
        }
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error('Last name must be a non-empty string.');
        }
        this.#lastName = value.trim();
    }

    /**
     * Gets the last update timestamp.
     * @returns {Date|undefined} The last update timestamp.
     */
    get lastUpdate() {
        return this.#lastUpdate;
    }

    /**
     * Sets the last update timestamp.
     * @param {Date|string|undefined} value - The new last update timestamp. Can be a Date object, a string, or `undefined` to clear.
     * @throws {Error} If the value is not a valid Date object or a parseable date string.
     */
    set lastUpdate(value) {
        if (value === undefined || value === null) {
            this.#lastUpdate = undefined;
            return;
        }

        let dateValue;
        if (value instanceof Date) {
            dateValue = value;
        } else if (typeof value === 'string') {
            dateValue = new Date(value);
        } else {
            throw new Error('Last update must be a Date object or a valid date string.');
        }

        if (isNaN(dateValue.getTime())) {
            throw new Error('Last update must be a valid date.');
        }
        this.#lastUpdate = dateValue;
    }

    /**
     * Compares this Actor object with another object for value-based equality.
     * Two Actor objects are considered equal if all their corresponding fields
     * (`actorId`, `firstName`, `lastName`, `lastUpdate`) are strictly equal.
     * This method mimics Java's `Object.equals()` behavior.
     *
     * @param {Object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    isEqual(other) {
        if (this === other) {
            return true;
        }
        if (!(other instanceof Actor)) {
            return false;
        }

        // Compare primitive fields and strings (which are immutable)
        if (this.#actorId !== other.#actorId ||
            this.#firstName !== other.#firstName ||
            this.#lastName !== other.#lastName) {
            return false;
        }

        // Compare Date objects (lastUpdate) for equality, handling undefined/null
        if (this.#lastUpdate === other.#lastUpdate) {
            return true; // Both are undefined/null or same reference
        }
        if (!this.#lastUpdate || !other.#lastUpdate) {
            return false; // One is undefined/null, the other is not
        }
        // Compare actual date values
        return this.#lastUpdate.getTime() === other.#lastUpdate.getTime();
    }

    /**
     * Generates a hash code for this Actor object.
     * The hash code is based on all significant fields (`actorId`, `firstName`, `lastName`, `lastUpdate`)
     * to be consistent with the `isEqual` method. This method mimics Java's `Object.hashCode()` behavior.
     *
     * @returns {string} A string representation of the hash code. This can be used for unique identification
     *                   in contexts where a hash is required (e.g., as a key in a custom Map implementation).
     */
    getHashCode() {
        // A simple, consistent way to generate a hash in JS is to combine string representations
        // of the significant fields. For Date objects, use getTime() for consistent hashing.
        const actorIdPart = this.#actorId !== undefined ? this.#actorId.toString() : 'null';
        const firstNamePart = this.#firstName !== undefined ? this.#firstName : 'null';
        const lastNamePart = this.#lastName !== undefined ? this.#lastName : 'null';
        const lastUpdatePart = this.#lastUpdate !== undefined ? this.#lastUpdate.getTime().toString() : 'null';

        return `${actorIdPart}|${firstNamePart}|${lastNamePart}|${lastUpdatePart}`;
    }

    /**
     * Returns a string representation of the Actor object.
     * @returns {string} A human-readable string representation of the Actor.
     */
    toString() {
        return `Actor(id=${this.#actorId}, firstName='${this.#firstName}', lastName='${this.#lastName}', lastUpdate=${this.#lastUpdate ? this.#lastUpdate.toISOString() : 'null'})`;
    }

    /**
     * Converts the Actor object to a plain JavaScript object, suitable for serialization (e.g., JSON.stringify).
     * Dates are converted to ISO 8601 strings.
     * @returns {object} A plain object representation of the Actor.
     */
    toJSON() {
        return {
            actorId: this.#actorId,
            firstName: this.#firstName,
            lastName: this.#lastName,
            lastUpdate: this.#lastUpdate ? this.#lastUpdate.toISOString() : null
        };
    }
}

/**
 * @summary Note on Asynchronous Operations (async/await):
 * The original Java `Actor` class is a pure data model (POJO/Entity) and does not
 * contain any business logic or database interaction itself. Its purpose is to
 * encapsulate data and be managed by a JPA/ORM framework.
 *
 * Similarly, this Node.js `Actor` class is designed as a data structure.
 * It does not inherently perform asynchronous operations like database calls.
 * All its methods (constructor, getters, setters, isEqual, getHashCode, toString, toJSON)
 * are synchronous.
 *
 * In a Node.js application, asynchronous operations (e.g., fetching actors from a database,
 * saving actor data) would be handled by a separate Repository or Service layer.
 * This layer would interact with a database driver or an ORM (like Sequelize, TypeORM, Knex.js)
 * and would naturally use `async/await` for those database interactions.
 *
 * Example of how `async/await` would be used in a hypothetical `ActorRepository` (not part of this `Actor` class):
 *
 * ```javascript
 * // Example: ActorRepository.js (a separate module)
 * import Actor from './Actor.js';
 * // Assume 'db' is an initialized database client (e.g., Knex.js, or a Sequelize/TypeORM model)
 *
 * class ActorRepository {
 *     constructor(dbClient) {
 *         this.db = dbClient;
 *     }
 *
 *     /**
 *      * Finds an actor by their ID asynchronously.
 *      * @param {number} id - The ID of the actor to find.
 *      * @returns {Promise<Actor|null>} A promise that resolves to an Actor object or null if not found.
 *      * @throws {Error} If there's a database error.
 *      *\/
 *     async findById(id) {
 *         try {
 *             // Example using a hypothetical 'actors' table and a DB client
 *             const result = await this.db('actors').where({ actor_id: id }).first();
 *             if (!result) {
 *                 return null;
 *             }
 *             // Map database result to Actor class instance
 *             return new Actor({
 *                 actorId: result.actor_id,
 *                 firstName: result.first_name,
 *                 lastName: result.last_name,
 *                 lastUpdate: result.last_update // DB driver should handle Date conversion
 *             });
 *         } catch (error) {
 *             console.error(`[ActorRepository] Error finding actor by ID ${id}:`, error);
 *             throw new Error('Could not retrieve actor due to a database error.');
 *         }
 *     }
 *
 *     /**
 *      * Saves an Actor object to the database asynchronously.
 *      * Inserts if actorId is not set, updates if actorId is present.
 *      * @param {Actor} actor - The Actor object to save.
 *      * @returns {Promise<Actor>} A promise that resolves to the saved Actor object (with ID if newly inserted).
 *      * @throws {Error} If the provided object is not an Actor instance or if there's a database error.
 *      *\/
 *     async save(actor) {
 *         if (!(actor instanceof Actor)) {
 *             throw new Error('Invalid object provided; must be an instance of Actor.');
 *         }
 *         try {
 *             const dataToSave = {
 *                 first_name: actor.firstName,
 *                 last_name: actor.lastName,
 *                 last_update: actor.lastUpdate // Date object will be handled by DB driver
 *             };
 *
 *             if (actor.actorId) {
 *                 // Update existing actor
 *                 const updatedRows = await this.db('actors')
 *                                             .where({ actor_id: actor.actorId })
 *                                             .update(dataToSave);
 *                 if (updatedRows === 0) {
 *                     throw new Error(`Actor with ID ${actor.actorId} not found for update.`);
 *                 }
 *                 return actor; // Return the updated actor instance
 *             } else {
 *                 // Insert new actor
 *                 // Assuming 'returning' is supported to get the new ID
 *                 const [newId] = await this.db('actors').insert(dataToSave).returning('actor_id');
 *                 actor.actorId = newId; // Assign the newly generated ID
 *                 return actor; // Return the actor instance with the new ID
 *             }
 *         } catch (error) {
 *             console.error(`[ActorRepository] Error saving actor:`, error);
 *             throw new Error('Could not save actor due to a database error.');
 *         }
 *     }
 * }
 * ```
 */
export default Actor;
```