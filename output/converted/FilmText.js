/**
 * @file FilmText.js
 * @description Represents a film_text entity from the Sakila database.
 * This class models the data structure and provides methods for data manipulation,
 * including simulated persistence operations using async/await.
 *
 * In a real-world Node.js application, the persistence methods (findById, findAll, save, update, delete)
 * would typically interact with a database via an Object-Relational Mapper (ORM) like Sequelize, TypeORM,
 * or Prisma, or directly with a database driver. The JPA annotations from the Java model
 * (`@Entity`, `@Table`, `@Id`, `@Column`, `@Basic`) are Java-specific and are conceptually
 * replaced by the ORM's configuration or schema definition in the Node.js ecosystem.
 *
 * This implementation uses an in-memory array (`#inMemoryStore`) to simulate database interactions
 * for demonstration purposes, fulfilling the requirement to maintain functionality and use async/await.
 */

/**
 * Represents a FilmText entity, mapping conceptually to the `film_text` table in the `sakila` schema.
 * This class serves as a Plain Old JavaScript Object (POJO) / Data Transfer Object (DTO)
 * and provides methods for data access, equality checks, and simulated persistence.
 */
class FilmText {
    /**
     * A private static in-memory store to simulate a database table.
     * In a real application, this would be replaced by an actual database connection
     * and an ORM's model definition.
     * @private
     * @type {Array<Object>}
     */
    static #inMemoryStore = [];

    /**
     * Creates an instance of FilmText.
     * @param {number} filmId - The unique identifier for the film text (primary key).
     * @param {string} title - The title of the film.
     * @param {string} description - A description of the film.
     * @throws {Error} If filmId is not a non-negative integer, or title/description are not non-empty strings.
     */
    constructor(filmId, title, description) {
        if (typeof filmId !== 'number' || !Number.isInteger(filmId) || filmId < 0) {
            throw new Error('FilmText: filmId must be a non-negative integer.');
        }
        if (typeof title !== 'string' || title.trim() === '') {
            throw new Error('FilmText: title must be a non-empty string.');
        }
        if (typeof description !== 'string' || description.trim() === '') {
            throw new Error('FilmText: description must be a non-empty string.');
        }

        /**
         * The unique identifier for the film text.
         * Corresponds to `film_id` column and is the primary key.
         * @private
         * @type {number}
         */
        this._filmId = filmId;

        /**
         * The title of the film.
         * Corresponds to `title` column.
         * @private
         * @type {string}
         */
        this._title = title;

        /**
         * A description of the film.
         * Corresponds to `description` column.
         * @private
         * @type {string}
         */
        this._description = description;
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
     * @param {number} value - The new film ID.
     * @throws {Error} If the value is not a non-negative integer.
     */
    set filmId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error('FilmText: filmId must be a non-negative integer.');
        }
        this._filmId = value;
    }

    /**
     * Gets the title of the film.
     * @returns {string} The film title.
     */
    get title() {
        return this._title;
    }

    /**
     * Sets the title of the film.
     * @param {string} value - The new title.
     * @throws {Error} If the value is not a non-empty string.
     */
    set title(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error('FilmText: title must be a non-empty string.');
        }
        this._title = value;
    }

    /**
     * Gets the description of the film.
     * @returns {string} The film description.
     */
    get description() {
        return this._description;
    }

    /**
     * Sets the description of the film.
     * @param {string} value - The new description.
     * @throws {Error} If the value is not a non-empty string.
     */
    set description(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error('FilmText: description must be a non-empty string.');
        }
        this._description = value;
    }

    /**
     * Compares this FilmText object with another object for equality.
     * Two FilmText objects are considered equal if they are of the same class
     * and their `filmId`, `title`, and `description` properties are strictly equal.
     * This method mirrors the functionality of Java's `equals` method.
     * @param {Object} o - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(o) {
        if (this === o) return true; // Same instance
        if (o === null || this.constructor !== o.constructor) return false; // Null or different class

        // Compare significant fields
        return this._filmId === o._filmId &&
               this._title === o._title &&
               this._description === o._description;
    }

    /**
     * Generates a hash string for the FilmText object based on its significant fields.
     * This method conceptually replaces Java's `hashCode()` for situations where a unique
     * string representation of an object's content is needed (e.g., as a key in a custom Map
     * or for logging/debugging). JavaScript's built-in `Map` and `Set` use referential
     * equality for objects by default, so this is for specific use cases.
     * @returns {string} A unique string representation of the object's content.
     */
    toHashString() {
        // A simple, consistent string representation for hashing purposes.
        return `${this._filmId}|${this._title}|${this._description}`;
    }

    /**
     * Converts the FilmText object to a plain JavaScript object.
     * This is useful for serialization (e.g., to JSON for API responses) or
     * for passing data to other layers that expect plain data structures.
     * @returns {Object} A plain object with `filmId`, `title`, and `description` properties.
     */
    toJSON() {
        return {
            filmId: this._filmId,
            title: this._title,
            description: this._description
        };
    }

    // --- Simulated Persistence Methods (using async/await) ---
    // These methods demonstrate how persistence operations would be handled
    // in a Node.js environment, using async/await for asynchronous database calls.
    // They interact with the static `#inMemoryStore` for simulation.

    /**
     * Simulates finding a FilmText entity by its primary key (filmId).
     * @param {number} id - The filmId to search for.
     * @returns {Promise<FilmText|null>} A promise that resolves with the FilmText object if found, otherwise null.
     * @throws {Error} If the id is invalid or a simulated database error occurs.
     */
    static async findById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
            throw new Error('FilmText.findById: id must be a non-negative integer.');
        }

        try {
            // Simulate an asynchronous database call (e.g., network latency)
            await new Promise(resolve => setTimeout(resolve, 50));

            const foundData = FilmText.#inMemoryStore.find(film => film.filmId === id);
            return foundData ? new FilmText(foundData.filmId, foundData.title, foundData.description) : null;
        } catch (error) {
            console.error(`FilmText.findById: Error fetching film with ID ${id}:`, error);
            throw new Error(`Failed to retrieve film by ID ${id}. Details: ${error.message}`);
        }
    }

    /**
     * Simulates finding all FilmText entities.
     * @returns {Promise<FilmText[]>} A promise that resolves with an array of all FilmText objects.
     * @throws {Error} If a simulated database error occurs.
     */
    static async findAll() {
        try {
            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 100));

            return FilmText.#inMemoryStore.map(filmData => new FilmText(filmData.filmId, filmData.title, filmData.description));
        } catch (error) {
            console.error('FilmText.findAll: Error fetching all films:', error);
            throw new Error(`Failed to retrieve all films. Details: ${error.message}`);
        }
    }

    /**
     * Simulates saving a FilmText entity to the database.
     * If an entity with the same `filmId` already exists, it updates it. Otherwise, it creates a new one.
     * This method conceptually combines Java's `persist` and `merge` operations.
     * @returns {Promise<FilmText>} A promise that resolves with the saved/updated FilmText object.
     * @throws {Error} If the object's data is invalid or a simulated database error occurs.
     */
    async save() {
        try {
            // Basic validation before attempting to save
            if (typeof this._filmId !== 'number' || !Number.isInteger(this._filmId) || this._filmId < 0) {
                throw new Error('FilmText.save: Invalid filmId for saving.');
            }
            if (typeof this._title !== 'string' || this._title.trim() === '') {
                throw new Error('FilmText.save: Invalid title for saving.');
            }
            if (typeof this._description !== 'string' || this._description.trim() === '') {
                throw new Error('FilmText.save: Invalid description for saving.');
            }

            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 75));

            const existingIndex = FilmText.#inMemoryStore.findIndex(film => film.filmId === this._filmId);

            if (existingIndex !== -1) {
                // Update existing record
                FilmText.#inMemoryStore[existingIndex] = this.toJSON(); // Store a plain object copy
                console.log(`FilmText.save: Updated film with ID ${this._filmId}`);
            } else {
                // Create new record
                FilmText.#inMemoryStore.push(this.toJSON()); // Store a plain object copy
                console.log(`FilmText.save: Created new film with ID ${this._filmId}`);
            }
            // Return a new instance to reflect the saved state (common ORM pattern)
            return new FilmText(this._filmId, this._title, this._description);
        } catch (error) {
            console.error(`FilmText.save: Error saving film with ID ${this._filmId}:`, error);
            throw new Error(`Failed to save film. Details: ${error.message}`);
        }
    }

    /**
     * Simulates updating an existing FilmText entity in the database.
     * This method assumes the entity already exists and will throw an error if not found.
     * @returns {Promise<FilmText>} A promise that resolves with the updated FilmText object.
     * @throws {Error} If the entity does not exist, its data is invalid, or a simulated database error occurs.
     */
    async update() {
        try {
            // Basic validation before attempting to update
            if (typeof this._filmId !== 'number' || !Number.isInteger(this._filmId) || this._filmId < 0) {
                throw new Error('FilmText.update: Invalid filmId for updating.');
            }
            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 75));

            const existingIndex = FilmText.#inMemoryStore.findIndex(film => film.filmId === this._filmId);

            if (existingIndex !== -1) {
                FilmText.#inMemoryStore[existingIndex] = this.toJSON(); // Store a plain object copy
                console.log(`FilmText.update: Updated film with ID ${this._filmId}`);
                return new FilmText(this._filmId, this._title, this._description);
            } else {
                throw new Error(`FilmText.update: Film with ID ${this._filmId} not found for update.`);
            }
        } catch (error) {
            console.error(`FilmText.update: Error updating film with ID ${this._filmId}:`, error);
            throw new Error(`Failed to update film. Details: ${error.message}`);
        }
    }

    /**
     * Simulates deleting a FilmText entity from the database.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the deletion was successful (record found and removed), `false` otherwise (record not found).
     * @throws {Error} If the object's `filmId` is invalid or a simulated database error occurs.
     */
    async delete() {
        try {
            // Basic validation before attempting to delete
            if (typeof this._filmId !== 'number' || !Number.isInteger(this._filmId) || this._filmId < 0) {
                throw new Error('FilmText.delete: Invalid filmId for deletion.');
            }

            // Simulate an asynchronous database call
            await new Promise(resolve => setTimeout(resolve, 60));

            const initialLength = FilmText.#inMemoryStore.length;
            FilmText.#inMemoryStore = FilmText.#inMemoryStore.filter(film => film.filmId !== this._filmId);

            if (FilmText.#inMemoryStore.length < initialLength) {
                console.log(`FilmText.delete: Deleted film with ID ${this._filmId}`);
                return true;
            } else {
                console.warn(`FilmText.delete: Film with ID ${this._filmId} not found for deletion.`);
                return false;
            }
        } catch (error) {
            console.error(`FilmText.delete: Error deleting film with ID ${this._filmId}:`, error);
            throw new Error(`Failed to delete film. Details: ${error.message}`);
        }
    }
}

module.exports = FilmText;