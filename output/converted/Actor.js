/**
 * @fileoverview This module defines the Actor class, a data model representing an actor entity.
 * It mirrors the structure and responsibilities of a JPA Entity in Java, focusing on data
 * representation, object identity, and equality. It also includes a conceptual ActorRepository
 * to demonstrate asynchronous database operations and error handling in a Node.js context.
 */

/**
 * Represents an Actor entity, encapsulating actor data and providing methods for
 * data access and object comparison.
 *
 * This class is designed to be a Plain Old JavaScript Object (POJO) adhering to
 * ES6 class syntax, similar to a JavaBean in Java. It provides a structured way
 * to manage actor information, including ID, first name, last name, and last update timestamp.
 *
 * While it doesn't directly use JPA annotations (which are Java-specific), it conceptually
 * represents a record in a database table, with properties mapping to columns.
 */
class Actor {
    /**
     * Constructs a new Actor instance.
     *
     * @param {object} [data={}] - An object containing initial data for the actor.
     * @param {number} [data.actorId] - The unique identifier for the actor (primary key).
     * @param {string} [data.firstName] - The first name of the actor.
     * @param {string} [data.lastName] - The last name of the actor.
     * @param {Date|string} [data.lastUpdate] - The timestamp of the last update. Can be a Date object or a string parseable by Date.
     */
    constructor(data = {}) {
        /**
         * The unique identifier for the actor. Corresponds to the `actor_id` column in the database.
         * Marked as private (`_`) to encourage access via getter/setter, mirroring Java's private fields.
         * @type {number}
         * @private
         */
        this._actorId = data.actorId || 0; // Default to 0 for new entities, or null if preferred.

        /**
         * The first name of the actor. Corresponds to the `first_name` column.
         * @type {string}
         * @private
         */
        this._firstName = data.firstName || '';

        /**
         * The last name of the actor. Corresponds to the `last_name` column.
         * @type {string}
         * @private
         */
        this._lastName = data.lastName || '';

        /**
         * The timestamp of the last update for the actor record. Corresponds to the `last_update` column.
         * Stored as a JavaScript Date object.
         * @type {Date}
         * @private
         */
        this._lastUpdate = data.lastUpdate ? new Date(data.lastUpdate) : new Date();

        // Validate initial date if provided
        if (isNaN(this._lastUpdate.getTime())) {
            throw new Error('Invalid initial date provided for lastUpdate.');
        }
    }

    /**
     * Gets the actor's ID.
     * @returns {number} The actor's ID.
     */
    get actorId() {
        return this._actorId;
    }

    /**
     * Sets the actor's ID.
     * @param {number} value - The new actor ID. Must be a non-negative number.
     * @throws {Error} If the provided value is not a valid number or is negative.
     */
    set actorId(value) {
        if (typeof value !== 'number' || isNaN(value) || value < 0) {
            throw new Error('Actor ID must be a non-negative number.');
        }
        this._actorId = value;
    }

    /**
     * Gets the actor's first name.
     * @returns {string} The actor's first name.
     */
    get firstName() {
        return this._firstName;
    }

    /**
     * Sets the actor's first name.
     * @param {string} value - The new first name. Must be a string.
     * @throws {Error} If the provided value is not a string.
     */
    set firstName(value) {
        if (typeof value !== 'string') {
            throw new Error('First name must be a string.');
        }
        this._firstName = value;
    }

    /**
     * Gets the actor's last name.
     * @returns {string} The actor's last name.
     */
    get lastName() {
        return this._lastName;
    }

    /**
     * Sets the actor's last name.
     * @param {string} value - The new last name. Must be a string.
     * @throws {Error} If the provided value is not a string.
     */
    set lastName(value) {
        if (typeof value !== 'string') {
            throw new Error('Last name must be a string.');
        }
        this._lastName = value;
    }

    /**
     * Gets the actor's last update timestamp.
     * Returns a new Date object to prevent external modification of the internal state.
     * @returns {Date} The last update timestamp.
     */
    get lastUpdate() {
        return new Date(this._lastUpdate);
    }

    /**
     * Sets the actor's last update timestamp.
     * @param {Date|string} value - The new last update timestamp. Can be a Date object or a string parseable by Date.
     * @throws {Error} If the provided value is not a valid Date or a string that can be parsed into a Date.
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
            throw new Error('Invalid date provided for last update.');
        }
        this._lastUpdate = dateValue;
    }

    /**
     * Compares this Actor object with another object for equality.
     * Two Actor objects are considered equal if they are the same instance,
     * or if they are both Actor instances and all their significant fields
     * (actorId, firstName, lastName, lastUpdate) are strictly equal.
     *
     * This method mirrors the `equals()` method in the Java analysis.
     *
     * @param {object} other - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    isEqual(other) {
        if (this === other) {
            return true;
        }
        if (!(other instanceof Actor)) {
            return false;
        }

        // Compare primitive fields
        if (this._actorId !== other._actorId ||
            this._firstName !== other._firstName ||
            this._lastName !== other._lastName) {
            return false;
        }

        // Compare Date objects by their time value (milliseconds since epoch)
        // Handle potential null/undefined dates gracefully
        const thisLastUpdateMs = this._lastUpdate ? this._lastUpdate.getTime() : undefined;
        const otherLastUpdateMs = other._lastUpdate ? other._lastUpdate.getTime() : undefined;

        return thisLastUpdateMs === otherLastUpdateMs;
    }

    /**
     * Generates a conceptual hash code for this Actor object.
     * This method provides a consistent string representation that can be used as a key
     * in JavaScript Maps or Sets where custom object equality is desired.
     * It's not a true numeric hash code like in Java, but serves a similar purpose
     * for identifying unique objects based on their content.
     *
     * The hash is generated from the same fields used in `isEqual()` to maintain
     * the contract: if two objects are equal, they must have the same hash code.
     *
     * This method mirrors the `hashCode()` method in the Java analysis.
     *
     * @returns {string} A string representing the hash code of the Actor object.
     */
    getHashCode() {
        // Use a consistent string representation of the Date object for hashing
        const lastUpdateStr = this._lastUpdate ? this._lastUpdate.toISOString() : 'null';
        return `${this._actorId}|${this._firstName}|${this._lastName}|${lastUpdateStr}`;
    }

    /**
     * Returns a string representation of the Actor object, useful for logging and debugging.
     * @returns {string} A string containing the actor's details.
     */
    toString() {
        return `Actor(ID: ${this._actorId}, Name: ${this._firstName} ${this._lastName}, Last Update: ${this._lastUpdate.toISOString()})`;
    }

    /**
     * Converts the Actor object to a plain JavaScript object, suitable for serialization (e.g., JSON.stringify).
     * This method is automatically called by `JSON.stringify()`.
     * @returns {object} A plain object with the actor's properties.
     */
    toJSON() {
        return {
            actorId: this._actorId,
            firstName: this._firstName,
            lastName: this._lastName,
            lastUpdate: this._lastUpdate.toISOString() // Standardize date format for JSON
        };
    }
}

// --- Conceptual Asynchronous Operations (Demonstrating async/await and error handling) ---
// This part is not strictly part of the Actor model itself but demonstrates how it would be used
// in a Node.js environment with database interactions, fulfilling the async/await requirement.
// In a real application, this would be a separate module (e.g., `actor.repository.js`).

/**
 * A conceptual repository class for managing Actor entities.
 * In a real application, this would interact with a database (e.g., using a SQL client like `mysql2` or an ORM like `Sequelize` or `TypeORM`).
 * It demonstrates how `async/await` and proper error handling would be applied when working with the `Actor` model.
 */
class ActorRepository {
    constructor() {
        // Simulate a database connection and a collection of actors
        // In a real application, `this.db` would be an actual database client instance.
        this.db = {
            actors: [
                new Actor({ actorId: 1, firstName: 'PENELOPE', lastName: 'GUINESS', lastUpdate: '2006-02-15T04:34:33.000Z' }),
                new Actor({ actorId: 2, firstName: 'NICK', lastName: 'WAHLBERG', lastUpdate: '2006-02-15T04:34:33.000Z' })
            ],
            /**
             * Simulates a database query.
             * @param {string} sql - The SQL query string.
             * @param {Array<any>} params - Parameters for the query.
             * @returns {Promise<any>} A promise that resolves with query results or metadata.
             */
            query: async (sql, params) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => { // Simulate network latency
                        console.log(`[DB Mock] Executing: "${sql}" with params: ${JSON.stringify(params)}`);

                        if (sql.includes('SELECT * FROM actor WHERE actor_id = ?')) {
                            const actor = this.db.actors.find(a => a.actorId === params[0]);
                            resolve(actor ? [actor.toJSON()] : []); // Return array of plain objects
                        } else if (sql.includes('INSERT INTO actor')) {
                            const newId = (this.db.actors.length > 0 ? Math.max(...this.db.actors.map(a => a.actorId)) : 0) + 1;
                            const newActorData = { actorId: newId, firstName: params[0], lastName: params[1], lastUpdate: new Date() };
                            const newActor = new Actor(newActorData);
                            this.db.actors.push(newActor);
                            resolve({ insertId: newId, affectedRows: 1 });
                        } else if (sql.includes('UPDATE actor')) {
                            const actorIndex = this.db.actors.findIndex(a => a.actorId === params[3]); // Assuming ID is the 4th param
                            if (actorIndex !== -1) {
                                this.db.actors[actorIndex].firstName = params[0];
                                this.db.actors[actorIndex].lastName = params[1];
                                this.db.actors[actorIndex].lastUpdate = new Date(params[2]); // Update timestamp
                                resolve({ affectedRows: 1 });
                            }
                            resolve({ affectedRows: 0 });
                        } else if (sql.includes('DELETE FROM actor')) {
                            const initialLength = this.db.actors.length;
                            this.db.actors = this.db.actors.filter(a => a.actorId !== params[0]);
                            resolve({ affectedRows: initialLength - this.db.actors.length });
                        } else {
                            reject(new Error('Unsupported mock query.'));
                        }
                    }, 100); // Simulate network latency
                });
            }
        };
    }

    /**
     * Finds an actor by their ID.
     * @param {number} id - The ID of the actor to find.
     * @returns {Promise<Actor|null>} A promise that resolves to an Actor object if found, otherwise null.
     * @throws {Error} If a database error occurs or ID is invalid.
     */
    async findById(id) {
        if (typeof id !== 'number' || isNaN(id) || id <= 0) {
            throw new Error('Invalid actor ID provided for lookup.');
        }
        try {
            const results = await this.db.query('SELECT * FROM actor WHERE actor_id = ?', [id]);
            if (results && results.length > 0) {
                return new Actor(results[0]); // Convert plain object from DB to Actor instance
            }
            return null;
        } catch (error) {
            console.error(`[ActorRepository] Error finding actor by ID ${id}:`, error);
            // Re-throw a more user-friendly error or log for debugging
            throw new Error(`Failed to retrieve actor with ID ${id}: ${error.message}`);
        }
    }

    /**
     * Saves a new actor or updates an existing one.
     * If `actor.actorId` is 0 or not set, it's treated as a new actor (INSERT).
     * Otherwise, it's treated as an existing actor (UPDATE).
     *
     * @param {Actor} actor - The Actor object to save.
     * @returns {Promise<Actor>} A promise that resolves to the saved Actor object (potentially with updated ID/timestamp).
     * @throws {Error} If the actor object is invalid or a database error occurs.
     */
    async save(actor) {
        if (!(actor instanceof Actor)) {
            throw new Error('Invalid Actor object provided for saving.');
        }

        try {
            if (actor.actorId > 0) {
                // Update existing actor
                const result = await this.db.query(
                    'UPDATE actor SET first_name = ?, last_name = ?, last_update = ? WHERE actor_id = ?',
                    [actor.firstName, actor.lastName, actor.lastUpdate.toISOString(), actor.actorId]
                );
                if (result.affectedRows === 0) {
                    console.warn(`[ActorRepository] Actor with ID ${actor.actorId} not found for update.`);
                    // Depending on requirements, might throw an error here or return null
                }
                // Simulate DB updating last_update timestamp
                actor.lastUpdate = new Date();
                return actor;
            } else {
                // Insert new actor
                const result = await this.db.query(
                    'INSERT INTO actor (first_name, last_name, last_update) VALUES (?, ?, ?)',
                    [actor.firstName, actor.lastName, actor.lastUpdate.toISOString()]
                );
                actor.actorId = result.insertId; // Assign the new ID from the database
                // Simulate DB updating last_update timestamp
                actor.lastUpdate = new Date();
                return actor;
            }
        } catch (error) {
            console.error(`[ActorRepository] Error saving actor ${actor.firstName} ${actor.lastName}:`, error);
            throw new Error(`Failed to save actor: ${error.message}`);
        }
    }

    /**
     * Deletes an actor by their ID.
     * @param {number} id - The ID of the actor to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the actor was deleted, false otherwise.
     * @throws {Error} If a database error occurs or ID is invalid.
     */
    async delete(id) {
        if (typeof id !== 'number' || isNaN(id) || id <= 0) {
            throw new Error('Invalid actor ID provided for deletion.');
        }
        try {
            const result = await this.db.query('DELETE FROM actor WHERE actor_id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`[ActorRepository] Error deleting actor by ID ${id}:`, error);
            throw new Error(`Failed to delete actor: ${error.message}`);
        }
    }
}

// Export the Actor class and the conceptual ActorRepository for use in other modules.
module.exports = { Actor, ActorRepository };