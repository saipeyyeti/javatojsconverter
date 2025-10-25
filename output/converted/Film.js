/**
 * @file Film.js
 * @description Represents a Film entity, mirroring the Java JPA model.
 * This class serves as a data model for film records, providing encapsulation
 * and methods for object identity and equality. It is designed to be used
 * within a Node.js application, potentially with an ORM for database persistence.
 *
 * This model uses `decimal.js` for precise decimal arithmetic, crucial for
 * financial values like rental rates and replacement costs, avoiding
 * JavaScript's floating-point inaccuracies.
 *
 * Note: JPA annotations from the Java model (e.g., @Entity, @Id, @Column)
 * are Java-specific and have no direct equivalent in a plain JavaScript class.
 * In a Node.js application, an Object-Relational Mapper (ORM) like Sequelize
 * or TypeORM would handle the database mapping configuration separately,
 * often using schema definitions or decorators.
 *
 * Asynchronous operations (async/await) are not inherently part of a pure
 * data model class like this. They would typically be found in service or
 * repository layers that interact with databases or external APIs to
 * fetch or persist `Film` objects.
 */

// Import decimal.js for precise decimal arithmetic
// To use this, you need to install it: npm install decimal.js
const Decimal = require('decimal.js');

/**
 * Represents a Film entity.
 * This class models a film record with various attributes,
 * providing getters, setters, and methods for object comparison.
 */
class Film {
    /**
     * @private
     * @type {number}
     * The unique identifier for the film. Corresponds to `film_id` in the database.
     */
    _filmId;

    /**
     * @private
     * @type {string}
     * The title of the film. Corresponds to `title` in the database.
     */
    _title;

    /**
     * @private
     * @type {string}
     * A brief description of the film. Corresponds to `description` in the database.
     */
    _description;

    /**
     * @private
     * @type {number}
     * The release year of the film. Corresponds to `release_year` in the database.
     */
    _releaseYear;

    /**
     * @private
     * @type {number | null}
     * The rental duration in days. Can be null. Corresponds to `rental_duration` in the database.
     */
    _rentalDuration;

    /**
     * @private
     * @type {Decimal}
     * The rental rate of the film. Stored as a Decimal for precision. Corresponds to `rental_rate` in the database.
     */
    _rentalRate;

    /**
     * @private
     * @type {number | null}
     * The length of the film in minutes. Can be null. Corresponds to `length` in the database.
     */
    _length;

    /**
     * @private
     * @type {Decimal}
     * The replacement cost of the film. Stored as a Decimal for precision. Corresponds to `replacement_cost` in the database.
     */
    _replacementCost;

    /**
     * @private
     * @type {string}
     * The rating of the film (e.g., 'G', 'PG'). Corresponds to `rating` in the database.
     */
    _rating;

    /**
     * @private
     * @type {string}
     * Special features available for the film (e.g., 'Trailers', 'Commentaries'). Corresponds to `special_features` in the database.
     */
    _specialFeatures;

    /**
     * @private
     * @type {Date}
     * The timestamp of the last update. Corresponds to `last_update` in the database.
     */
    _lastUpdate;

    /**
     * Creates an instance of Film.
     * @param {object} [options={}] - An object containing initial property values.
     * @param {number} [options.filmId=0] - The unique identifier for the film.
     * @param {string} [options.title=''] - The title of the film.
     * @param {string} [options.description=''] - A brief description of the film.
     * @param {number} [options.releaseYear=0] - The release year of the film.
     * @param {number | null} [options.rentalDuration=null] - The rental duration in days.
     * @param {number | string | Decimal} [options.rentalRate=0.00] - The rental rate.
     * @param {number | null} [options.length=null] - The length of the film in minutes.
     * @param {number | string | Decimal} [options.replacementCost=0.00] - The replacement cost.
     * @param {string} [options.rating='G'] - The rating of the film.
     * @param {string} [options.specialFeatures=''] - Special features available.
     * @param {Date | string | number} [options.lastUpdate=new Date()] - The timestamp of the last update.
     */
    constructor(options = {}) {
        this.filmId = options.filmId || 0;
        this.title = options.title || '';
        this.description = options.description || '';
        this.releaseYear = options.releaseYear || 0;
        this.rentalDuration = options.rentalDuration === undefined ? null : options.rentalDuration;
        this.rentalRate = options.rentalRate === undefined ? new Decimal(0.00) : options.rentalRate;
        this.length = options.length === undefined ? null : options.length;
        this.replacementCost = options.replacementCost === undefined ? new Decimal(0.00) : options.replacementCost;
        this.rating = options.rating || 'G';
        this.specialFeatures = options.specialFeatures || '';
        this.lastUpdate = options.lastUpdate === undefined ? new Date() : options.lastUpdate;
    }

    /**
     * Gets the film's ID.
     * @returns {number} The film ID.
     */
    get filmId() {
        return this._filmId;
    }

    /**
     * Sets the film's ID.
     * @param {number} value - The new film ID.
     * @throws {Error} If the value is not a number.
     */
    set filmId(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Film ID must be a number.');
        }
        this._filmId = value;
    }

    /**
     * Gets the film's title.
     * @returns {string} The film title.
     */
    get title() {
        return this._title;
    }

    /**
     * Sets the film's title.
     * @param {string} value - The new title.
     * @throws {Error} If the value is not a string.
     */
    set title(value) {
        if (typeof value !== 'string') {
            throw new Error('Title must be a string.');
        }
        this._title = value;
    }

    /**
     * Gets the film's description.
     * @returns {string} The film description.
     */
    get description() {
        return this._description;
    }

    /**
     * Sets the film's description.
     * @param {string} value - The new description.
     * @throws {Error} If the value is not a string.
     */
    set description(value) {
        if (typeof value !== 'string') {
            throw new Error('Description must be a string.');
        }
        this._description = value;
    }

    /**
     * Gets the film's release year.
     * @returns {number} The release year.
     */
    get releaseYear() {
        return this._releaseYear;
    }

    /**
     * Sets the film's release year.
     * @param {number} value - The new release year.
     * @throws {Error} If the value is not a number.
     */
    set releaseYear(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Release year must be a number.');
        }
        this._releaseYear = value;
    }

    /**
     * Gets the film's rental duration.
     * @returns {number | null} The rental duration.
     */
    get rentalDuration() {
        return this._rentalDuration;
    }

    /**
     * Sets the film's rental duration.
     * @param {number | null} value - The new rental duration.
     * @throws {Error} If the value is not a number or null.
     */
    set rentalDuration(value) {
        if (value !== null && (typeof value !== 'number' || isNaN(value))) {
            throw new Error('Rental duration must be a number or null.');
        }
        this._rentalDuration = value;
    }

    /**
     * Gets the film's rental rate.
     * @returns {Decimal} The rental rate as a Decimal object.
     */
    get rentalRate() {
        return this._rentalRate;
    }

    /**
     * Sets the film's rental rate.
     * @param {number | string | Decimal} value - The new rental rate.
     * @throws {Error} If the value cannot be converted to a Decimal.
     */
    set rentalRate(value) {
        try {
            this._rentalRate = new Decimal(value);
        } catch (e) {
            throw new Error(`Rental rate must be a number, string, or Decimal object: ${e.message}`);
        }
    }

    /**
     * Gets the film's length.
     * @returns {number | null} The film length.
     */
    get length() {
        return this._length;
    }

    /**
     * Sets the film's length.
     * @param {number | null} value - The new length.
     * @throws {Error} If the value is not a number or null.
     */
    set length(value) {
        if (value !== null && (typeof value !== 'number' || isNaN(value))) {
            throw new Error('Length must be a number or null.');
        }
        this._length = value;
    }

    /**
     * Gets the film's replacement cost.
     * @returns {Decimal} The replacement cost as a Decimal object.
     */
    get replacementCost() {
        return this._replacementCost;
    }

    /**
     * Sets the film's replacement cost.
     * @param {number | string | Decimal} value - The new replacement cost.
     * @throws {Error} If the value cannot be converted to a Decimal.
     */
    set replacementCost(value) {
        try {
            this._replacementCost = new Decimal(value);
        } catch (e) {
            throw new Error(`Replacement cost must be a number, string, or Decimal object: ${e.message}`);
        }
    }

    /**
     * Gets the film's rating.
     * @returns {string} The film rating.
     */
    get rating() {
        return this._rating;
    }

    /**
     * Sets the film's rating.
     * @param {string} value - The new rating.
     * @throws {Error} If the value is not a string.
     */
    set rating(value) {
        if (typeof value !== 'string') {
            throw new Error('Rating must be a string.');
        }
        this._rating = value;
    }

    /**
     * Gets the film's special features.
     * @returns {string} The special features.
     */
    get specialFeatures() {
        return this._specialFeatures;
    }

    /**
     * Sets the film's special features.
     * @param {string} value - The new special features.
     * @throws {Error} If the value is not a string.
     */
    set specialFeatures(value) {
        if (typeof value !== 'string') {
            throw new Error('Special features must be a string.');
        }
        this._specialFeatures = value;
    }

    /**
     * Gets the film's last update timestamp.
     * @returns {Date} The last update timestamp.
     */
    get lastUpdate() {
        return this._lastUpdate;
    }

    /**
     * Sets the film's last update timestamp.
     * @param {Date | string | number} value - The new last update timestamp. Can be a Date object,
     *   a string parseable by `new Date()`, or a number representing milliseconds since epoch.
     * @throws {Error} If the value cannot be converted to a valid Date.
     */
    set lastUpdate(value) {
        let date;
        if (value instanceof Date) {
            date = value;
        } else if (typeof value === 'string' || typeof value === 'number') {
            date = new Date(value);
        } else {
            throw new Error('Last update must be a Date object, string, or number.');
        }

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date value for last update.');
        }
        this._lastUpdate = date;
    }

    /**
     * Compares this Film object with another object for equality.
     * Two Film objects are considered equal if all their corresponding
     * fields have the same values.
     *
     * @param {object} o - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(o) {
        if (this === o) return true;
        if (o === null || this.constructor !== o.constructor) return false;

        /** @type {Film} */
        const film = o;

        // Compare primitive types directly
        if (this._filmId !== film._filmId ||
            this._releaseYear !== film._releaseYear ||
            this._rentalDuration !== film._rentalDuration ||
            this._length !== film._length) {
            return false;
        }

        // Compare strings
        if (this._title !== film._title ||
            this._description !== film._description ||
            this._rating !== film._rating ||
            this._specialFeatures !== film._specialFeatures) {
            return false;
        }

        // Compare Decimal objects using their equals method
        if (!this._rentalRate.equals(film._rentalRate) ||
            !this._replacementCost.equals(film._replacementCost)) {
            return false;
        }

        // Compare Date objects by their time value
        if (this._lastUpdate.getTime() !== film._lastUpdate.getTime()) {
            return false;
        }

        return true;
    }

    /**
     * Generates a hash code for the Film object.
     * This method is consistent with `equals()`, meaning if two objects
     * are equal according to `equals()`, they will have the same hash code.
     * This is useful for scenarios requiring object hashing (e.g., custom
     * hash maps, although less common in standard JavaScript than in Java).
     *
     * @returns {number} The hash code for the object.
     */
    hashCode() {
        let hash = 17; // A prime number
        const primeMultiplier = 31; // Another prime number

        hash = primeMultiplier * hash + this._filmId;
        hash = primeMultiplier * hash + (this._title ? this._title.hashCode() : 0); // String hashing
        hash = primeMultiplier * hash + (this._description ? this._description.hashCode() : 0);
        hash = primeMultiplier * hash + this._releaseYear;
        hash = primeMultiplier * hash + (this._rentalDuration || 0);
        hash = primeMultiplier * hash + (this._rentalRate ? this._rentalRate.toString().hashCode() : 0); // Hash string representation of Decimal
        hash = primeMultiplier * hash + (this._length || 0);
        hash = primeMultiplier * hash + (this._replacementCost ? this._replacementCost.toString().hashCode() : 0);
        hash = primeMultiplier * hash + (this._rating ? this._rating.hashCode() : 0);
        hash = primeMultiplier * hash + (this._specialFeatures ? this._specialFeatures.hashCode() : 0);
        hash = primeMultiplier * hash + (this._lastUpdate ? this._lastUpdate.getTime() : 0);

        // Ensure string.hashCode() exists for consistency, or provide a simple one
        // For simplicity, we'll use a basic string hash if not available.
        // In a real-world scenario, you might use a dedicated hashing library.
        // This is a simple polynomial rolling hash.
        if (!String.prototype.hashCode) {
            String.prototype.hashCode = function() {
                let h = 0;
                for (let i = 0; i < this.length; i++) {
                    h = (Math.imul(31, h) + this.charCodeAt(i)) | 0;
                }
                return h;
            };
        }

        return hash;
    }

    /**
     * Converts the Film object to a plain JavaScript object.
     * Useful for serialization (e.g., to JSON).
     * @returns {object} A plain object representation of the film.
     */
    toJSON() {
        return {
            filmId: this.filmId,
            title: this.title,
            description: this.description,
            releaseYear: this.releaseYear,
            rentalDuration: this.rentalDuration,
            rentalRate: this.rentalRate.toString(), // Convert Decimal to string for JSON
            length: this.length,
            replacementCost: this.replacementCost.toString(), // Convert Decimal to string for JSON
            rating: this.rating,
            specialFeatures: this.specialFeatures,
            lastUpdate: this.lastUpdate.toISOString() // Convert Date to ISO string for JSON
        };
    }

    /**
     * Creates a Film instance from a plain JavaScript object.
     * Useful for deserialization (e.g., from JSON).
     * @param {object} data - The plain object containing film data.
     * @returns {Film} A new Film instance.
     */
    static fromJSON(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data provided for Film.fromJSON.');
        }
        return new Film({
            filmId: data.filmId,
            title: data.title,
            description: data.description,
            releaseYear: data.releaseYear,
            rentalDuration: data.rentalDuration,
            rentalRate: data.rentalRate,
            length: data.length,
            replacementCost: data.replacementCost,
            rating: data.rating,
            specialFeatures: data.specialFeatures,
            lastUpdate: data.lastUpdate
        });
    }
}

// Export the Film class for use in other modules
module.exports = Film;