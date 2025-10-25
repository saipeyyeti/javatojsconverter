/**
 * @file StaffService.js
 * @description This service encapsulates business logic related to Staff entities,
 *              acting as an intermediary between the presentation layer (e.g., a controller)
 *              and the data access layer (the repository). It provides a clear, high-level API
 *              for operations involving Staff data.
 */

/**
 * @typedef {object} Staff
 * @property {number} staff_id - The unique identifier for the staff member.
 * @property {string} first_name - The first name of the staff member.
 * @property {string} last_name - The last name of the staff member.
 * @property {string} username - The unique username of the staff member.
 * @property {string} email - The email address of the staff member.
 * @property {number} store_id - The ID of the store the staff member is associated with.
 * // Add other relevant Staff properties as per your entity definition
 */

/**
 * @interface StaffRepository
 * @description Defines the expected interface for the data access layer for Staff entities.
 *              This interface is used for type hinting in JSDoc and for validating the injected dependency.
 */
/**
 * @function StaffRepository#findAll
 * @returns {Promise<Array<Staff>>} A promise that resolves to an array of Staff objects.
 */
/**
 * @function StaffRepository#getStaffByUsername
 * @param {string} username - The username of the staff member.
 * @returns {Promise<Staff|null>} A promise that resolves to a Staff object if found, otherwise null.
 */

/**
 * `StaffService` class provides business logic for managing `Staff` entities.
 * It encapsulates operations like retrieving all staff or a specific staff member by username.
 * This class adheres to the Service Layer Pattern, promoting modularity, reusability, and testability.
 */
class StaffService {
    /**
     * @private
     * @type {StaffRepository}
     * @description The data access object for Staff entities, injected via the constructor.
     */
    #staffRepository;

    /**
     * Creates an instance of StaffService.
     * This constructor uses Dependency Injection to receive the `StaffRepository` instance,
     * ensuring the service has access to its required data access component.
     * @param {StaffRepository} staffRepository - An instance of the StaffRepository for data access.
     * @throws {Error} If `staffRepository` is not provided or does not implement the required methods.
     */
    constructor(staffRepository) {
        if (!staffRepository) {
            throw new Error('StaffService: StaffRepository is required for initialization.');
        }
        // Validate that the injected repository has the expected methods
        if (typeof staffRepository.findAll !== 'function' || typeof staffRepository.getStaffByUsername !== 'function') {
            throw new Error('StaffService: Provided staffRepository must implement `findAll()` and `getStaffByUsername(username)` methods.');
        }
        this.#staffRepository = staffRepository;
    }

    /**
     * Retrieves a list of all staff members from the persistence layer.
     * This method delegates the data retrieval operation directly to the `StaffRepository`.
     * It handles potential errors during data access and provides a consistent response.
     * @returns {Promise<Array<Staff>>} A promise that resolves to an array of Staff objects.
     * @throws {Error} If there is an issue retrieving staff data from the repository.
     */
    async getAllStaff() {
        try {
            const staffList = await this.#staffRepository.findAll();
            return staffList;
        } catch (error) {
            console.error('StaffService.getAllStaff: Failed to retrieve all staff members.', error);
            // Re-throw a more generic, user-friendly error or a custom application-specific error
            throw new Error('Failed to retrieve all staff members due to an internal server error.');
        }
    }

    /**
     * Retrieves a single staff member based on their unique username.
     * This method delegates the specific query to a custom method (`getStaffByUsername`)
     * defined in the `StaffRepository`. It includes input validation and error handling.
     * @param {string} username - The unique username of the staff member to retrieve.
     * @returns {Promise<Staff|null>} A promise that resolves to the Staff object if found, otherwise null.
     * @throws {Error} If the `username` is invalid (e.g., empty or not a string) or if there is an issue retrieving staff data.
     */
    async getStaffByUsername(username) {
        // Input validation
        if (!username || typeof username !== 'string' || username.trim() === '') {
            throw new Error('StaffService.getStaffByUsername: Username must be a non-empty string.');
        }

        try {
            const staff = await this.#staffRepository.getStaffByUsername(username);
            return staff;
        } catch (error) {
            console.error(`StaffService.getStaffByUsername: Failed to retrieve staff member with username "${username}".`, error);
            // Re-throw a more generic, user-friendly error or a custom application-specific error
            throw new Error(`Failed to retrieve staff member with username "${username}" due to an internal server error.`);
        }
    }
}

// Export the StaffService class for use in other modules (e.g., controllers)
module.exports = StaffService;