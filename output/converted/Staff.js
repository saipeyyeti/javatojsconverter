/**
 * @file Staff.js
 * @description This file defines the Staff class, a JavaScript model representing
 *              a staff member entity, analogous to a JPA Entity in Java.
 *              It provides data representation, encapsulation, and methods for
 *              object identity and comparison.
 */

const { Buffer } = require('buffer'); // For handling binary data (picture)

/**
 * Represents a Staff entity from the database.
 * This class models a staff record, providing data representation,
 * encapsulation, and methods for object identity and comparison.
 *
 * It is the Node.js/JavaScript equivalent of the Java `Staff` JPA Entity,
 * designed to hold the state of a single staff member.
 *
 * @class Staff
 * @property {number} staffId - The unique identifier for the staff member (primary key, `staff_id`).
 * @property {string} firstName - The first name of the staff member (`first_name`).
 * @property {string} lastName - The last name of the staff member (`last_name`).
 * @property {Buffer | null} picture - Binary data representing the staff member's picture (`picture`).
 * @property {string | null} email - The email address of the staff member (`email`).
 * @property {number} active - Indicates if the staff member is active (1 for active, 0 for inactive) (`active`).
 * @property {string} username - The username for the staff member's account (`username`).
 * @property {string} password - The password for the staff member's account (`password`).
 * @property {Date} lastUpdate - The timestamp of the last update to the staff record (`last_update`).
 */
class Staff {
    /**
     * Creates an instance of Staff.
     *
     * @param {object} params - Object containing staff properties.
     * @param {number} params.staffId - The unique identifier for the staff member. Must be a positive integer.
     * @param {string} params.firstName - The first name of the staff member. Must be a non-empty string.
     * @param {string} params.lastName - The last name of the staff member. Must be a non-empty string.
     * @param {Buffer | null} [params.picture=null] - Binary data for the staff member's picture. Must be a Buffer or null.
     * @param {string | null} [params.email=null] - The email address of the staff member. Must be a valid email string or null.
     * @param {number} params.active - Indicates if the staff member is active (1 for active, 0 for inactive). Must be 0 or 1.
     * @param {string} params.username - The username for the staff member's account. Must be a non-empty string.
     * @param {string} params.password - The password for the staff member's account. Must be a non-empty string.
     * @param {Date | string | number} params.lastUpdate - The timestamp of the last update. Can be a Date object, ISO string, or Unix timestamp.
     * @throws {Error} If any required parameter is missing or invalid, or if types do not match.
     */
    constructor({
        staffId,
        firstName,
        lastName,
        picture = null,
        email = null,
        active,
        username,
        password,
        lastUpdate
    }) {
        // --- Input Validation ---
        if (typeof staffId !== 'number' || !Number.isInteger(staffId) || staffId <= 0) {
            throw new Error('Invalid Staff ID: Must be a positive integer.');
        }
        if (typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('Invalid First Name: Must be a non-empty string.');
        }
        if (typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('Invalid Last Name: Must be a non-empty string.');
        }
        if (picture !== null && !(picture instanceof Buffer)) {
            throw new Error('Invalid Picture: Must be a Buffer object or null.');
        }
        if (email !== null && (typeof email !== 'string' || !email.includes('@'))) {
            // Basic email validation; more robust validation might be in a service layer.
            throw new Error('Invalid Email: Must be a valid email string or null.');
        }
        if (typeof active !== 'number' || ![0, 1].includes(active)) {
            throw new Error('Invalid Active Status: Must be 0 or 1.');
        }
        if (typeof username !== 'string' || username.trim() === '') {
            throw new Error('Invalid Username: Must be a non-empty string.');
        }
        if (typeof password !== 'string' || password.trim() === '') {
            throw new Error('Invalid Password: Must be a non-empty string.');
        }

        let parsedLastUpdate;
        if (lastUpdate instanceof Date) {
            parsedLastUpdate = lastUpdate;
        } else if (typeof lastUpdate === 'string' || typeof lastUpdate === 'number') {
            parsedLastUpdate = new Date(lastUpdate);
            if (isNaN(parsedLastUpdate.getTime())) {
                throw new Error('Invalid Last Update: Must be a valid Date, ISO string, or Unix timestamp.');
            }
        } else {
            throw new Error('Invalid Last Update: Must be a Date object, string, or number.');
        }

        // --- Assign Properties ---
        this.staffId = staffId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.picture = picture;
        this.email = email;
        this.active = active;
        this.username = username;
        this.password = password;
        this.lastUpdate = parsedLastUpdate;
    }

    /**
     * Compares this Staff object with another object for equality.
     * Two Staff objects are considered equal if all their corresponding fields are equal.
     * This method is analogous to the `equals()` method in the Java class, ensuring
     * value-based equality for data models.
     *
     * @param {object} o - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    equals(o) {
        // 1. Reference equality check
        if (this === o) return true;

        // 2. Type and null/undefined check
        if (o === null || typeof o !== 'object' || o.constructor !== Staff) return false;

        // Conceptually "cast" to Staff for property access
        /** @type {Staff} */
        const staff = o;

        // 3. Compare primitive and string fields
        if (this.staffId !== staff.staffId) return false;
        if (this.active !== staff.active) return false;
        if (this.firstName !== staff.firstName) return false;
        if (this.lastName !== staff.lastName) return false;
        if (this.email !== staff.email) return false; // Handles null/undefined correctly
        if (this.username !== staff.username) return false;
        if (this.password !== staff.password) return false;

        // 4. Compare Buffer (byte[]) field
        // Check if both are null/undefined or if they are different Buffer objects
        if (this.picture !== staff.picture) {
            // If one is null and the other isn't, they are not equal
            if (this.picture === null || staff.picture === null) return false;
            // If both are not null, compare their content
            if (!Buffer.isBuffer(this.picture) || !Buffer.isBuffer(staff.picture) || Buffer.compare(this.picture, staff.picture) !== 0) {
                return false;
            }
        }

        // 5. Compare Date (Timestamp) field
        // Check if both are null/undefined or if they are different Date objects
        if (this.lastUpdate !== staff.lastUpdate) {
            // If one is null and the other isn't, they are not equal
            if (this.lastUpdate === null || staff.lastUpdate === null) return false;
            // If both are not null, compare their time values
            if (!(this.lastUpdate instanceof Date) || !(staff.lastUpdate instanceof Date) || this.lastUpdate.getTime() !== staff.lastUpdate.getTime()) {
                return false;
            }
        }

        // If all comparisons pass, the objects are equal
        return true;
    }

    /**
     * Generates a string representation of the Staff object.
     * This method is useful for debugging and logging purposes.
     *
     * @returns {string} A string representation of the Staff object's key properties.
     */
    toString() {
        const lastUpdateStr = this.lastUpdate ? this.lastUpdate.toISOString() : 'null';
        const pictureStatus = this.picture ? `[Buffer, length=${this.picture.length}]` : 'null';
        return `Staff(staffId=${this.staffId}, firstName='${this.firstName}', lastName='${this.lastName}', ` +
               `email='${this.email}', active=${this.active}, username='${this.username}', ` +
               `picture=${pictureStatus}, lastUpdate=${lastUpdateStr})`;
    }

    // --- Note on hashCode() ---
    // JavaScript objects do not have a built-in `hashCode()` method like Java.
    // In JavaScript, object equality for built-in collections like `Map` and `Set`
    // is based on reference equality by default (i.e., `obj1 === obj2`).
    //
    // If value-based hashing is required for custom collections or specific use cases
    // (e.g., to implement a custom Set or Map that uses value equality), a custom
    // hashing function would need to be implemented externally or by generating a
    // unique string representation of the object's state.
    //
    // For a direct translation of the data model, `hashCode` is omitted as it
    // doesn't have a direct, idiomatic equivalent in standard JavaScript for this purpose.
    // The `equals` method provides the necessary value comparison logic.
}

module.exports = Staff;