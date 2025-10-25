// Ensure you have bcryptjs installed: npm install bcryptjs
const bcrypt = require('bcryptjs');

/**
 * @file This module provides the UserDetailsServiceImpl, a crucial component
 *       for integrating user authentication with an application's data sources
 *       in a Node.js environment, mimicking Spring Security's UserDetailsService.
 *       It handles user retrieval, type differentiation, password hashing,
 *       and error handling for user not found scenarios.
 */

/**
 * @class UsernameNotFoundException
 * @extends Error
 * @description Custom error class to signify that a user could not be found.
 *              Mimics Spring Security's `UsernameNotFoundException`.
 */
class UsernameNotFoundException extends Error {
    /**
     * Creates an instance of UsernameNotFoundException.
     * @param {string} [message="Could not find user"] - The error message.
     */
    constructor(message = "Could not find user") {
        super(message);
        this.name = "UsernameNotFoundException";
        // Assign a common HTTP status code for 'Not Found' scenarios
        this.statusCode = 404;
    }
}

/**
 * @class PasswordEncoder
 * @description A utility class for securely hashing and comparing passwords
 *              using bcrypt. Mimics Spring Security's `BCryptPasswordEncoder`.
 */
class PasswordEncoder {
    /**
     * Creates an instance of PasswordEncoder.
     * @param {number} [saltRounds=10] - The number of salt rounds to use for hashing.
     *                                   A higher number increases security but also computation time.
     */
    constructor(saltRounds = 10) {
        if (typeof saltRounds !== 'number' || saltRounds < 4 || saltRounds > 31) {
            throw new Error("saltRounds must be a number between 4 and 31.");
        }
        this.saltRounds = saltRounds;
    }

    /**
     * Hashes a plain text password using bcrypt.
     * @param {string} plainTextPassword - The password string to hash.
     * @returns {Promise<string>} A promise that resolves with the bcrypt hashed password.
     * @throws {Error} If the input is invalid or hashing fails.
     */
    async hash(plainTextPassword) {
        if (typeof plainTextPassword !== 'string' || plainTextPassword.length === 0) {
            throw new Error("Password to hash must be a non-empty string.");
        }
        try {
            return await bcrypt.hash(plainTextPassword, this.saltRounds);
        } catch (error) {
            console.error("PasswordEncoder: Error hashing password:", error);
            throw new Error("Failed to hash password due to an internal error.");
        }
    }

    /**
     * Compares a plain text password with a bcrypt hashed password.
     * @param {string} plainTextPassword - The plain text password provided by the user.
     * @param {string} hashedPassword - The bcrypt hashed password stored in the database.
     * @returns {Promise<boolean>} A promise that resolves with `true` if passwords match, `false` otherwise.
     * @throws {Error} If the input is invalid or comparison fails.
     */
    async compare(plainTextPassword, hashedPassword) {
        if (typeof plainTextPassword !== 'string' || typeof hashedPassword !== 'string') {
            throw new Error("Both plain text and hashed passwords must be strings for comparison.");
        }
        try {
            return await bcrypt.compare(plainTextPassword, hashedPassword);
        } catch (error) {
            console.error("PasswordEncoder: Error comparing password:", error);
            throw new Error("Failed to compare password due to an internal error.");
        }
    }
}

/**
 * @class CustomerRepository
 * @description A mock repository for customer data. In a real application,
 *              this would interact with a database (e.g., using Mongoose, Sequelize, or a raw SQL client).
 */
class CustomerRepository {
    /**
     * Finds a customer by their email address.
     * @param {string} email - The email address of the customer.
     * @returns {Promise<object|null>} A promise that resolves with the customer object if found, otherwise null.
     *                                  Customer object structure: `{ customerId: number, email: string, ... }`
     */
    async getCustomerByEmail(email) {
        // Simulate an asynchronous database call
        return new Promise(resolve => {
            setTimeout(() => {
                const customers = [
                    { customerId: 101, email: "customer@example.com", firstName: "John", lastName: "Doe" },
                    { customerId: 102, email: "testcustomer@example.com", firstName: "Jane", lastName: "Smith" }
                ];
                const foundCustomer = customers.find(c => c.email === email);
                resolve(foundCustomer || null);
            }, 50); // Simulate network latency
        });
    }
}

/**
 * @class StaffRepository
 * @description A mock repository for staff data. In a real application,
 *              this would interact with a database.
 */
class StaffRepository {
    /**
     * Finds a staff member by their username.
     * @param {string} username - The username of the staff member.
     * @returns {Promise<object|null>} A promise that resolves with the staff object if found, otherwise null.
     *                                  Staff object structure: `{ staffId: number, username: string, password: string, ... }`
     *                                  Note: `password` here is assumed to be plain text as per Java analysis for re-hashing.
     */
    async getStaffByUsername(username) {
        // Simulate an asynchronous database call
        return new Promise(resolve => {
            setTimeout(() => {
                const staffMembers = [
                    // As per Java analysis, 'password' is treated as plain text here for re-hashing.
                    { staffId: 1, username: "adminuser", password: "adminpassword123", firstName: "Admin", lastName: "User" },
                    { staffId: 2, username: "teststaff", password: "staffpassword", firstName: "Test", lastName: "Staff" }
                ];
                const foundStaff = staffMembers.find(s => s.username === username);
                resolve(foundStaff || null);
            }, 50); // Simulate network latency
        });
    }
}

/**
 * @typedef {object} UserDetails
 * @property {string} username - The username of the authenticated user.
 * @property {string} password - The hashed password of the authenticated user.
 * @property {string[]} roles - An array of roles/authorities assigned to the user (e.g., ["ADMIN", "USER"]).
 * @property {boolean} enabled - Indicates whether the user is enabled (default: true).
 * @property {boolean} accountNonExpired - Indicates whether the user's account has expired (default: true).
 * @property {boolean} credentialsNonExpired - Indicates whether the user's credentials (password) have expired (default: true).
 * @property {boolean} accountNonLocked - Indicates whether the user is locked (default: true).
 */

/**
 * @class UserDetailsServiceImpl
 * @description A service responsible for loading user-specific data for authentication.
 *              It acts as the bridge between the authentication mechanism and the application's
 *              user data (Customers and Staff), mimicking Spring Security's `UserDetailsService`.
 */
class UserDetailsServiceImpl {
    /**
     * Creates an instance of UserDetailsServiceImpl.
     * @param {CustomerRepository} customerRepository - The repository for customer data.
     * @param {StaffRepository} staffRepository - The repository for staff data.
     * @param {PasswordEncoder} passwordEncoder - The password encoder for hashing passwords.
     */
    constructor(customerRepository, staffRepository, passwordEncoder) {
        if (!customerRepository || !staffRepository || !passwordEncoder) {
            throw new Error("UserDetailsServiceImpl requires CustomerRepository, StaffRepository, and PasswordEncoder instances.");
        }
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Locates the user based on the provided username (which can be an email for customers).
     * This is the core method for user authentication integration.
     *
     * @param {string} anyUsername - The username (or email for customers) identifying the user.
     * @returns {Promise<UserDetails>} A promise that resolves with a UserDetails object
     *                                  containing the user's authentication and authorization information.
     * @throws {UsernameNotFoundException} If no user (Customer or Staff) is found for the given username.
     * @throws {Error} For other unexpected errors during user retrieval or password processing.
     */
    async loadUserByUsername(anyUsername) {
        if (typeof anyUsername !== 'string' || anyUsername.trim().length === 0) {
            throw new Error("Username must be a non-empty string.");
        }

        let customer = null;
        let staff = null;

        try {
            // Attempt to find user as a Customer by email
            customer = await this.customerRepository.getCustomerByEmail(anyUsername);

            // If not found as a customer, attempt to find as a Staff by username
            if (!customer) {
                staff = await this.staffRepository.getStaffByUsername(anyUsername);
            }
        } catch (error) {
            console.error(`UserDetailsServiceImpl: Error during user lookup for username '${anyUsername}':`, error);
            // Re-throw a more generic error to avoid exposing internal database errors
            throw new Error("An error occurred during user lookup.");
        }

        // If neither a Customer nor a Staff member is found, throw an exception
        if (!customer && !staff) {
            throw new UsernameNotFoundException(`Could not find user with username: ${anyUsername}`);
        }

        let hashedPassword;
        let roles;

        try {
            if (staff) {
                // As per the Java analysis, staff's password (assumed plain text) is re-encoded.
                hashedPassword = await this.passwordEncoder.hash(staff.password);
                roles = ["ADMIN"];
            } else { // Must be a customer if staff is null
                // As per the Java analysis, customerId is converted to string and used as password, then re-encoded.
                hashedPassword = await this.passwordEncoder.hash(String(customer.customerId));
                roles = ["USER"];
            }
        } catch (error) {
            console.error(`UserDetailsServiceImpl: Error hashing password for user '${anyUsername}':`, error);
            throw new Error("Failed to process user credentials due to an internal error.");
        }

        /**
         * The returned object structure aligns with common Node.js authentication
         * patterns (e.g., Passport.js local strategy) for representing user details.
         * It includes essential fields like username, hashed password, and roles.
         * Other fields like enabled, accountNonExpired, etc., are often assumed true
         * by default or can be dynamically determined based on application logic.
         */
        return {
            username: anyUsername,
            password: hashedPassword, // This is the *hashed* password to be stored/compared
            roles: roles,
            enabled: true, // Defaulting to true; add logic if user accounts can be disabled
            accountNonExpired: true, // Defaulting to true; add logic if accounts can expire
            credentialsNonExpired: true, // Defaulting to true; add logic if passwords can expire
            accountNonLocked: true // Defaulting to true; add logic if accounts can be locked
        };
    }
}

// Export all components for modular use
module.exports = {
    UsernameNotFoundException,
    PasswordEncoder,
    CustomerRepository,
    StaffRepository,
    UserDetailsServiceImpl
};

/*
// Example Usage (for demonstration purposes, typically in an entry file or test)

async function main() {
    const customerRepo = new CustomerRepository();
    const staffRepo = new StaffRepository();
    const passwordEncoder = new PasswordEncoder(); // Default saltRounds = 10

    const userDetailsService = new UserDetailsServiceImpl(customerRepo, staffRepo, passwordEncoder);

    console.log("--- Testing Customer Lookup ---");
    try {
        const customerDetails = await userDetailsService.loadUserByUsername("customer@example.com");
        console.log("Customer Found:", customerDetails);
        // Verify password (for demonstration, in real auth, this would be done by auth provider)
        const isPasswordMatch = await passwordEncoder.compare("101", customerDetails.password);
        console.log("Customer password '101' matches hashed password:", isPasswordMatch); // Should be true
    } catch (error) {
        console.error("Customer Lookup Error:", error.message);
    }

    console.log("\n--- Testing Staff Lookup ---");
    try {
        const staffDetails = await userDetailsService.loadUserByUsername("adminuser");
        console.log("Staff Found:", staffDetails);
        // Verify password (for demonstration)
        const isPasswordMatch = await passwordEncoder.compare("adminpassword123", staffDetails.password);
        console.log("Staff password 'adminpassword123' matches hashed password:", isPasswordMatch); // Should be true
    } catch (error) {
        console.error("Staff Lookup Error:", error.message);
    }

    console.log("\n--- Testing User Not Found ---");
    try {
        await userDetailsService.loadUserByUsername("nonexistent@example.com");
    } catch (error) {
        console.error("User Not Found Error (Expected):", error.message);
        console.log("Error instance of UsernameNotFoundException:", error instanceof UsernameNotFoundException); // Should be true
    }

    console.log("\n--- Testing Invalid Username Input ---");
    try {
        await userDetailsService.loadUserByUsername("");
    } catch (error) {
        console.error("Invalid Username Error (Expected):", error.message);
    }
}

// Uncomment to run the example usage
// main();
*/