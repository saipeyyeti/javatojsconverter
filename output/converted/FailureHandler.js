/**
 * @file Defines a custom error class for access denied scenarios.
 * @module AccessDeniedError
 */

/**
 * @class AccessDeniedError
 * @augments Error
 * @description
 * Represents an error indicating that a user does not have sufficient authorization
 * to access a particular resource. This custom error helps in distinguishing
 * authorization failures from other types of errors within the application.
 *
 * It mirrors the concept of Spring Security's `AccessDeniedException` in Java.
 */
class AccessDeniedError extends Error {
    /**
     * Creates an instance of AccessDeniedError.
     * @param {string} [message='Access Denied'] - A human-readable description of the error.
     * @param {number} [statusCode=403] - The HTTP status code associated with this error (Forbidden).
     */
    constructor(message = 'Access Denied', statusCode = 403) {
        super(message);
        this.name = 'AccessDeniedError';
        this.statusCode = statusCode; // Standard HTTP status for Forbidden
        // Ensure the prototype chain is correctly set for `instanceof` checks
        Object.setPrototypeOf(this, AccessDeniedError.prototype);
    }
}

export default AccessDeniedError;