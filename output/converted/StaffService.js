```javascript
/**
 * @typedef {object} Staff
 * @property {number} staff_id - The unique ID of the staff member.
 * @property {string} first_name - The first name of the staff member.
 * @property {string} last_name - The last name of the staff member.
 * @property {string} username - The unique username of the staff member.
 * @property {string} email - The email address of the staff member.
 * @property {boolean} active - Whether the staff member is active.
 * @property {number} store_id - The ID of the store the staff member works at.
 * @property {number} address_id - The ID of the staff member's address.
 * @property {string|null} picture - Path to the staff member's picture, or null.
 * @property {string} password - The staff member's password (should be hashed in real apps).
 * @property {string} last_update - Timestamp of the last update (e.g., 'YYYY-MM-DD HH:mm:ss').
 */

// --- staff.repository.js (Simulated Data Access Layer) ---
// In a real application, this would interact with a database (e.g., using an ORM like Sequelize, TypeORM,
// or a direct database client like 'pg' for PostgreSQL, 'mysql2' for MySQL).
// For this example, we'll simulate asynchronous database calls with Promises and setTimeout
// to mimic network/DB latency and potential errors.

/**
 * @class StaffRepository
 * @description Provides data access operations for Staff entities.
 * This is a mock implementation for demonstration purposes, simulating asynchronous database interactions.
 */
class StaffRepository {
    /**
     * @private
     * @type {Staff[]}
     * @description In-memory mock database for staff data.
     */
    #mockStaffData = [
        { staff_id: 1, first_name: 'Mike', last_name: 'Hillyer', username: 'MIKE', email: 'mike.hillyer@sakilastaff.com', active: true, store_id: 1, address_id: 1, picture: null, password: 'hashed_password_1', last_update: '2006-02-15 04:57:03' },
        { staff_id: 2, first_name: 'Jon', last_name: 'Stephens', username: 'JON', email: 'jon.stephens@sakilastaff.com', active: true, store_id: 2, address_id: 2, picture: null, password: 'hashed_password_2', last_update: '2006-02-15 04:57:03' },
        { staff_id: 3, first_name: 'Alice', last_name: 'Wonder', username: 'ALICE', email: 'alice.wonder@sakilastaff.com', active: false, store_id: 1, address_id: 3, picture: null, password: 'hashed_password_3', last_update: '2023-01-01 10:00:00' }
    ];

    /**
     * Finds all staff members in the data store.
     * @returns {Promise<Staff[]>} A promise that resolves to an array of Staff objects.
     * @throws {Error} If there's a problem accessing the data store (simulated).
     */
    async findAll() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Simulate a potential database connection or query error ~10% of the time
                    if (Math.random() < 0.1) {
                        throw new Error('Simulated database connection error during findAll operation.');
                    }
                    // Return a deep copy to prevent external modification of mock data
                    resolve(JSON.parse(JSON.stringify(this.#mockStaffData)));
                } catch (error) {
                    reject(error);
                }
            }, 100); // Simulate network/DB latency
        });
    }

    /**
     * Finds a single staff member by their unique username.
     * @param {string} username - The username of the staff member to find.
     * @returns {Promise<Staff|null>} A promise that resolves to a Staff object if found, otherwise null.
     * @throws {Error} If there's a problem accessing the data store (simulated).
     */
    async findByUsername(username) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Simulate a potential database connection or query error ~10% of the time
                    if (Math.random() < 0.1) {
                        throw new Error('Simulated database query error during findByUsername operation.');
                    }
                    const foundStaff = this.#mockStaffData.find(
                        staff => staff.username.toLowerCase() === username.toLowerCase()
                    );
                    // Return a deep copy if found, otherwise null
                    resolve(foundStaff ? JSON.parse(JSON.stringify(foundStaff)) : null);
                } catch (error) {
                    reject(error);
                }
            }, 100); // Simulate network/DB latency
        });
    }
}

// --- staff.service.js (The converted service class) ---

/**
 * @class StaffService
 * @description Encapsulates business logic related to Staff entities.
 * Acts as an intermediary layer between the presentation (e.g., a REST controller)
 * and the data access layer (the repository).
 */
class StaffService {
    /**
     * @private
     * @type {StaffRepository}
     * @description The data access object for Staff entities, used to interact with the database.
     */
    #staffRepository;

    /**
     * Creates an instance of StaffService.
     * This constructor uses Dependency Injection to receive its required StaffRepository.
     * @param {StaffRepository} staffRepository - An instance of StaffRepository for data access.
     * @throws {Error} If `staffRepository` is not provided, ensuring proper initialization.
     */
    constructor(staffRepository) {
        if (!staffRepository) {
            throw new Error('StaffService requires an instance of StaffRepository.');
        }
        this.#staffRepository = staffRepository;
    }

    /**
     * Retrieves all staff members from the data store.
     * This method orchestrates the data retrieval and can include additional business logic
     * such as filtering, sorting, or transforming data before returning it.
     * @returns {Promise<Staff[]>} A promise that resolves to an array of Staff objects.
     * @throws {Error} If there is an underlying issue retrieving staff data from the repository.
     */
    async getAllStaff() {
        try {
            const staffList = await this.#staffRepository.findAll();
            // Example: Add more business logic here, e.g.,
            // - Filter out inactive staff if business rules dictate
            // - Transform staff objects (e.g., hide sensitive fields)
            // - Apply sorting
            return staffList;
        } catch (error) {
            console.error(`[StaffService] Error retrieving all staff: ${error.message}`);
            // Re-throw a more generic or business-specific error to the caller
            // This hides implementation details of the data layer from higher layers.
            throw new Error('Failed to retrieve all staff members due to a data access issue.');
        }
    }

    /**
     * Retrieves a single staff member based on their unique username.
     * This method includes input validation and handles potential data access errors.
     * @param {string} username - The unique username of the staff member to retrieve.
     * @returns {Promise<Staff|null>} A promise that resolves to a Staff object if found, otherwise null.
     * @throws {Error} If the provided username is invalid or if there's an issue retrieving staff data.
     */
    async getStaffByUsername(username) {
        // Input validation: Ensure username is a valid non-empty string.
        if (!username || typeof username !== 'string' || username.trim() === '') {
            throw new Error('Invalid username provided. Username must be a non-empty string.');
        }

        try {
            const staff = await this.#staffRepository.findByUsername(username);
            // Example: Add more business logic here, e.g.,
            // - Check if the found staff member is active
            // - Apply specific data transformations for a single staff member
            return staff;
        } catch (error) {
            console.error(`[StaffService] Error retrieving staff by username '${username}': ${error.message}`);
            // Re-throw a more generic or business-specific error.
            throw new Error(`Failed to retrieve staff member with username '${username}' due to a data access issue.`);
        }
    }
}

// Export the StaffService class and StaffRepository (for demonstration/testing purposes).
// In a real application, StaffRepository might be in a separate file and imported.
module.exports = { StaffService, StaffRepository };

/*
// Example Usage (for testing the above code):
(async () => {
    const staffRepository = new StaffRepository();
    const staffService = new StaffService(staffRepository);

    console.log('--- Retrieving all staff ---');
    try {
        const allStaff = await staffService.getAllStaff();
        console.log('All Staff:', allStaff);
    } catch (error) {
        console.error('Error in getAllStaff:', error.message);
    }

    console.log('\n--- Retrieving staff by existing username (MIKE) ---');
    try {
        const mike = await staffService.getStaffByUsername('MIKE');
        console.log('Staff MIKE:', mike);
    } catch (error) {
        console.error('Error in getStaffByUsername (MIKE):', error.message);
    }

    console.log('\n--- Retrieving staff by non-existing username (UNKNOWN) ---');
    try {
        const unknown = await staffService.getStaffByUsername('UNKNOWN');
        console.log('Staff UNKNOWN:', unknown); // Should be null
    } catch (error) {
        console.error('Error in getStaffByUsername (UNKNOWN):', error.message);
    }

    console.log('\n--- Retrieving staff with invalid username (null) ---');
    try {
        await staffService.getStaffByUsername(null);
    } catch (error) {
        console.error('Error in getStaffByUsername (null):', error.message);
    }

    console.log('\n--- Retrieving staff with invalid username (empty string) ---');
    try {
        await staffService.getStaffByUsername('');
    } catch (error) {
        console.error('Error in getStaffByUsername (empty string):', error.message);
    }

    console.log('\n--- Simulating repository error (may or may not occur due to random chance) ---');
    // To reliably test error handling, you might temporarily modify the StaffRepository's random error chance
    // or create a dedicated mock repository that always throws errors.
    for (let i = 0; i < 15; i++) { // Try multiple times to hit the random error
        try {
            await staffService.getAllStaff();
            // console.log(`Attempt ${i+1}: Success`);
        } catch (error) {
            console.error(`Attempt ${i+1}: Caught expected error: ${error.message}`);
            break; // Stop after catching one error
        }
    }
})();
*/
```