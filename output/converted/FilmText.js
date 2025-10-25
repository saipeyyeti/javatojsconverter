```javascript
/**
 * @file FilmText.js
 * @description Represents a data model for the `film_text` table from the `sakila` database.
 * This class is a direct translation of a Java JPA Entity, focusing on data representation,
 * object identity, and property access.
 *
 * In a Node.js environment, the JPA annotations (like @Entity, @Table, @Id, @Column)
 * would typically be replaced by configurations specific to an Object-Relational Mapper (ORM)
 * library such as TypeORM, Sequelize, or Prisma. This class itself serves as the Plain Old
 * JavaScript Object (POJO) that holds the data, and its persistence mapping would be
 * defined externally by the chosen ORM.
 *
 * Asynchronous operations (e.g., database interactions like saving or fetching data)
 * would be handled by a separate repository or service layer, utilizing async/await.
 * This model class itself is synchronous as it only defines the data structure and its behavior.
 */

/**
 * Represents a single record from the `film_text` table in the `sakila` database.
 * It encapsulates film text data including its ID, title, and description.
 *
 * @class FilmText
 * @property {number} filmId - The unique identifier for the film text (primary key).
 * @property {string} title - The title of the film.
 * @property {string} description - The description of the film.
 */
class FilmText {
    /**
     * Creates an instance of FilmText.
     * @constructor
     * @param {number} filmId - The unique identifier for the film text. Must be a positive integer.
     * @param {string} title - The title of the film. Must be a non-empty string.
     * @param {string} description - The description of the film. Must be a string.
     * @throws {Error} If any provided parameter is invalid according to its type or constraints.
     */
    constructor(filmId, title, description) {
        // Use setters to leverage validation logic
        this.filmId = filmId;
        this.title = title;
        this.description = description;
    }

    /**
     * Get the film ID.
     * This property is considered the primary key for the FilmText entity.
     * @returns {number} The unique identifier for the film text.
     */
    get filmId() {
        return this._filmId;
    }

    /**
     * Set the film ID.
     * @param {number} value - The new film ID. Must be a positive integer.
     * @throws {Error} If the value is not a valid positive integer.
     */
    set filmId(value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
            throw new Error('Invalid Film ID: Must be a positive integer.');
        }
        this._filmId = value;
    }

    /**
     * Get the film title.
     * @returns {string} The title of the film.
     */
    get title() {
        return this._title;
    }

    /**
     * Set the film title.
     * @param {string} value - The new title. Must be a non-empty string.
     * @throws {Error} If the value is not a string or is empty.
     */
    set title(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Invalid Title: Must be a non-empty string.');
        }
        this._title = value;
    }

    /**
     * Get the film description.
     * @returns {string} The description of the film.
     */
    get description() {
        return this._description;
    }

    /**
     * Set the film description.
     * @param {string} value - The new description. Must be a string.
     * @throws {Error} If the value is not a string.
     */
    set description(value) {
        if (typeof value !== 'string') {
            throw new Error('Invalid Description: Must be a string.');
        }
        this._description = value;
    }

    /**
     * Checks if this FilmText object is equal to another object based on its properties.
     * This method provides value-based equality, similar to Java's `equals()` method.
     * It compares `filmId`, `title`, and `description`.
     *
     * @param {Object} other - The object to compare with.
     * @returns {boolean} True if the objects are considered equal, false otherwise.
     */
    isEqual(other) {
        if (this === other) {
            return true;
        }
        // Check if 'other' is null, not an object, or not an instance of FilmText
        if (other === null || typeof other !== 'object' || !(other instanceof FilmText)) {
            return false;
        }

        // Compare properties for value equality
        return this._filmId === other._filmId &&
               this._title === other._title &&
               this._description === other._description;
    }

    /**
     * Generates a string representation that can be used as a hash key for this object.
     * This is analogous to Java's `hashCode()` for value-based comparison in hash-based collections
     * (e.g., using a Map where keys are objects and you need content-based lookup).
     * The hash string is a concatenation of the object's primary properties.
     *
     * @returns {string} A unique string representation based on the object's properties.
     */
    toHashString() {
        // Using a delimiter to prevent collision if property values themselves contain the delimiter
        // This provides a simple, deterministic string for hashing based on content.
        return `${this._filmId}|${this._title}|${this._description}`;
    }

    /**
     * Returns a plain JavaScript object representation of this FilmText instance.
     * Useful for serialization (e.g., to JSON) or when interacting with ORMs that expect plain objects.
     * @returns {Object} A plain object with filmId, title, and description properties.
     */
    toObject() {
        return {
            filmId: this._filmId,
            title: this._title,
            description: this._description
        };
    }
}

module.exports = FilmText;
```