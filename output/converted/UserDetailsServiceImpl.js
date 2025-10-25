```javascript
// userDetailsService.js

// Import bcryptjs for password hashing.
// In a real Node.js project, you would install it via npm: `npm install bcryptjs`
const bcrypt = require('bcryptjs');

/**
 * @typedef {object} Customer
 * @property {number} customerId - The unique ID of the customer.
 * @property {string} email - The email address of the customer.
 * @property {string} [firstName] - The first name of the customer.
 * @property {string} [lastName] - The last name of the customer.
 * // In a real system, a customer would also have a hashed password field.
 */

/**
 * @typedef {object} Staff
 * @property {number} staffId - The unique ID of the staff member.
 * @property {string} username - The username of the staff member.
 * @property {string} password - The hashed password of the staff member.
 * @property {string} [firstName] - The first name of the staff member.
 * @property {string} [lastName] - The last name of the staff member.
 */

/**
 * @typedef {object} UserDetails
 * @property {string} username - The username of the user.
 * @property {string} password - The hashed password of the user.
 * @property {string[]} roles - An array of roles/authorities assigned to the user (e.g., "ADMIN", "USER").
 * // Additional fields like enabled, accountNonExpired, etc., could be added for full Spring Security parity.
 */

/**
 * Custom error class for when a username is not found.
 * This is analogous to Spring Security's `UsernameNotFoundException`.
 */
class UsernameNotFoundException extends Error {
    /**
     * Creates an instance of UsernameNotFoundException.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'UsernameNotFoundException';
        // Ensure the stack trace is captured correctly in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UsernameNotFoundException);
        }
    }
}

/**
 * A mock CustomerRepository for demonstration purposes.
 * In a real application, this would interact with a database (e.g., using an ORM like Sequelize or Mongoose).
 */
class CustomerRepository {
    constructor() {
        // Mock data for customers
        this.customers = [
            { customerId: 101, email: 'customer1@example.com', firstName: 'John', lastName: 'Doe' },
            { customerId: 102, email: 'customer2@example.com', firstName: 'Jane', lastName: 'Smith' },
        ];
    }

    /**
     * Retrieves a customer by their email address.
     * @param {string} email - The email address of the customer.
     * @returns {Promise<Customer|null>} A promise that resolves with the customer object or null if not found.
     */
    async getCustomerByEmail(email) {
        // Simulate an asynchronous database call
        return new Promise(resolve => {
            setTimeout(() => {
                const customer = this.customers.find(c => c.email === email);
                resolve(customer || null);
            }, 50); // Simulate network latency
        });
    }
}

/**
 * A mock StaffRepository for demonstration purposes.
 * In a real application, this would interact with a database.
 */
class StaffRepository {
    /**
     * @param {object} passwordEncoder - An object with a `hashSync` method for pre-hashing mock passwords.
     */
    constructor(passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        // Mock data for staff members. Passwords should be pre-hashed in a real database.
        this.staffMembers = [
            { staffId: 1, username: 'admin', password: this.passwordEncoder.hashSync('adminpass', 10), firstName: 'Admin', lastName: 'User' },
            { staffId: 2, username: 'staffuser', password: this.passwordEncoder.hashSync('staffpass', 10), firstName: 'Staff', lastName: 'Member' },
        ];
    }

    /**
     * Retrieves a staff member by their username.
     * @param {string} username - The username of the staff member.
     * @returns {Promise<Staff|null>} A promise that resolves with the staff object or null if not found.
     */
    async getStaffByUsername(username) {
        // Simulate an asynchronous database call
        return new Promise(resolve => {
            setTimeout(() => {
                const staff = this.staffMembers.find(s => s.username === username);
                resolve(staff || null);
            }, 50); // Simulate network latency
        });
    }
}

/**
 * This service is a crucial component in an authentication setup, responsible for loading user-specific data
 * during the authentication process. It supports two distinct user types: `Customer` and `Staff`.
 *
 * This class implements the core logic analogous to Spring Security's `UserDetailsService` interface.
 */
class UserDetailsServiceImpl {
    /**
     * Creates an instance of UserDetailsServiceImpl.
     * Dependencies are injected via the constructor, following Node.js best practices for modularity and testability.
     *
     * @param {CustomerRepository} customerRepository - The repository for accessing customer data.
     * @param {StaffRepository} staffRepository - The repository for accessing staff data.
     * @param {object} passwordEncoder - An object providing password hashing and comparison functionality.
     *                                   It should have `hash(password, saltRounds)` and `compare(password, hash)` methods.
     *                                   (e.g., `bcryptjs` module).
     * @param {number} [saltRounds=10] - The number of salt rounds to use for bcrypt hashing.
     */
    constructor(customerRepository, staffRepository, passwordEncoder, saltRounds = 10) {
        if (!customerRepository || !staffRepository || !passwordEncoder) {
            throw new Error('UserDetailsServiceImpl: CustomerRepository, StaffRepository, and passwordEncoder are required dependencies.');
        }
        if (typeof passwordEncoder.hash !== 'function' || typeof passwordEncoder.compare !== 'function') {
            throw new Error('UserDetailsServiceImpl: passwordEncoder must provide hash and compare methods.');
        }

        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.saltRounds = saltRounds;
    }

    /**
     * Loads user-specific data by username during the authentication process.
     * This is the core method for retrieving user details, attempting to find the user
     * as either a customer (by email) or a staff member (by username).
     *
     * @param {string} anyUsername - The username provided by the user attempting to log in.
     *                               This could be a customer's email or a staff member's username.
     * @returns {Promise<UserDetails>} A promise that resolves with a `UserDetails` object
     *                                  containing the username, hashed password, and assigned roles.
     * @throws {UsernameNotFoundException} If no user (neither customer nor staff) with the given `anyUsername` is found.
     * @throws {Error} For other unexpected errors that occur during data retrieval or password processing.
     */
    async loadUserByUsername(anyUsername) {
        try {
            // Attempt to find a customer by email and a staff member by username concurrently.
            const [customer, staff] = await Promise.all([
                this.customerRepository.getCustomerByEmail(anyUsername),
                this.staffRepository.getStaffByUsername(anyUsername)
            ]);

            // If neither a customer nor a staff member is found, throw an exception.
            if (!customer && !staff) {
                throw new UsernameNotFoundException(`Could not find user with username: "${anyUsername}"`);
            }

            /** @type {UserDetails} */
            let userDetails = {
                username: anyUsername,
                password: '', // Will be set based on user type
                roles: [],    // Will be set based on user type
            };

            // Prioritize staff members if a match is found.
            if (staff) {
                userDetails.password = staff.password; // Staff passwords are assumed to be pre-hashed in the DB.
                userDetails.roles = ['ADMIN'];
            } else {
                // If no staff member is found, a customer must have been found (due to the check above).
                /**
                 * @critical_security_vulnerability
                 * The original Java analysis highlights this: using `String.valueOf(customer.getCustomerId())`
                 * as the password for customers is a significant security vulnerability. Customer IDs are
                 * typically sequential and easily guessable/discoverable.
                 *
                 * In a production system, customers should have a proper password field,
                 * which would be stored securely (hashed) in the database.
                 *
                 * For direct translation as per requirements, we hash the customer ID here.
                 */
                userDetails.password = await this.passwordEncoder.hash(String(customer.customerId), this.saltRounds);
                userDetails.roles = ['USER'];
            }

            return userDetails;

        } catch (error) {
            // Re-throw `UsernameNotFoundException` directly as it's an expected authentication failure.
            if (error instanceof UsernameNotFoundException) {
                throw error;
            }
            // Log and re-throw other unexpected errors for better debugging and context.
            console.error(`[UserDetailsServiceImpl] Error loading user "${anyUsername}":`, error);
            throw new Error(`Failed to load user details for "${anyUsername}" due to an internal error.`);
        }
    }
}

// --- Dependency Injection Setup and Example Usage ---
// In a real Node.js application, you would typically set up your dependencies
// in a central configuration file or using a dedicated dependency injection container.

// 1. Configure and instantiate the password encoder.
// We're creating an object that wraps bcryptjs methods to match the expected interface.
const saltRounds = 10;
const passwordEncoder = {
    /**
     * Hashes a password using bcrypt.
     * @param {string} password - The plain-text password.
     * @param {number} rounds - The number of salt rounds.
     * @returns {Promise<string>} A promise that resolves with the hashed password.
     */
    hash: (password, rounds) => bcrypt.hash(password, rounds),
    /**
     * Compares a plain-text password with a hashed password.
     * @param {string} password - The plain-text password.
     * @param {string} hash - The hashed password.
     * @returns {Promise<boolean>} A promise that resolves with true if passwords match, false otherwise.
     */
    compare: (password, hash) => bcrypt.compare(password, hash),
    /**
     * Synchronously hashes a password (used here for mock data initialization).
     * @param {string} password - The plain-text password.
     * @param {number} rounds - The number of salt rounds.
     * @returns {string} The hashed password.
     */
    hashSync: (password, rounds) => bcrypt.hashSync(password, rounds)
};

// 2. Instantiate repositories.
const customerRepository = new CustomerRepository();
// Pass the passwordEncoder to StaffRepository for pre-hashing mock staff passwords.
const staffRepository = new StaffRepository(passwordEncoder);

// 3. Instantiate the UserDetailsService with its dependencies.
const userDetailsService = new UserDetailsServiceImpl(
    customerRepository,
    staffRepository,
    passwordEncoder,
    saltRounds
);

// --- Test Cases (Self-executing async function for demonstration) ---
(async () => {
    console.log('--- UserDetailsServiceImpl Demonstration ---');

    // Test Case 1: Successfully find a Staff user
    try {
        console.log('\nAttempting to load staff user "admin"...');
        const staffUserDetails = await userDetailsService.loadUserByUsername('admin');
        console.log('✅ Found Staff User:', JSON.stringify(staffUserDetails, null, 2));
        // Verify password (in a real authentication system, this would be handled by the auth provider)
        const isStaffPasswordValid = await passwordEncoder.compare('adminpass', staffUserDetails.password);
        console.log('   Staff password valid:', isStaffPasswordValid); // Should be true
    } catch (error) {
        console.error('❌ Error finding staff user:', error.message);
    }

    // Test Case 2: Successfully find a Customer user
    try {
        console.log('\nAttempting to load customer user "customer1@example.com"...');
        const customerUserDetails = await userDetailsService.loadUserByUsername('customer1@example.com');
        console.log('✅ Found Customer User:', JSON.stringify(customerUserDetails, null, 2));
        // Verify password (customer ID as password, as per original Java logic)
        const isCustomerPasswordValid = await passwordEncoder.compare(String(101), customerUserDetails.password);
        console.log('   Customer password valid (ID as pass):', isCustomerPasswordValid); // Should be true
    } catch (error) {
        console.error('❌ Error finding customer user:', error.message);
    }

    // Test Case 3: User not found (neither staff nor customer)
    try {
        console.log('\nAttempting to load nonexistent user "unknown@example.com"...');
        await userDetailsService.loadUserByUsername('unknown@example.com');
        console.log('❌ Unexpected: User found for "unknown@example.com"');
    } catch (error) {
        console.error(`✅ Expected Error (User not found): ${error.name} - ${error.message}`);
    }

    // Test Case 4: Another Staff user
    try {
        console.log('\nAttempting to load staff user "staffuser"...');
        const anotherStaffUserDetails = await userDetailsService.loadUserByUsername('staffuser');
        console.log('✅ Found Staff User:', JSON.stringify(anotherStaffUserDetails, null, 2));
        const isAnotherStaffPasswordValid = await passwordEncoder.compare('staffpass', anotherStaffUserDetails.password);
        console.log('   Staff password valid:', isAnotherStaffPasswordValid); // Should be true
    } catch (error) {
        console.error('❌ Error finding staff user:', error.message);
    }

    // Test Case 5: Another Customer user
    try {
        console.log('\nAttempting to load customer user "customer2@example.com"...');
        const anotherCustomerUserDetails = await userDetailsService.loadUserByUsername('customer2@example.com');
        console.log('✅ Found Customer User:', JSON.stringify(anotherCustomerUserDetails, null, 2));
        const isAnotherCustomerPasswordValid = await passwordEncoder.compare(String(102), anotherCustomerUserDetails.password);
        console.log('   Customer password valid (ID as pass):', isAnotherCustomerPasswordValid); // Should be true
    } catch (error) {
        console.error('❌ Error finding customer user:', error.message);
    }

    // Test Case 6: Invalid dependencies during service instantiation
    try {
        console.log('\nAttempting to instantiate service with missing dependencies...');
        new UserDetailsServiceImpl(null, staffRepository, passwordEncoder);
        console.log('❌ Unexpected: Service instantiated with missing dependencies.');
    } catch (error) {
        console.error(`✅ Expected Error (Invalid dependencies): ${error.message}`);
    }

    console.log('\n--- Demonstration Complete ---');
})();


// Export the service and related classes for use in other modules.
module.exports = {
    UserDetailsServiceImpl,
    UsernameNotFoundException,
    // Exporting mock repositories and passwordEncoder for potential testing or further demonstration.
    CustomerRepository,
    StaffRepository,
    passwordEncoder
};
```