```javascript
import bcrypt from 'bcryptjs'; // Using bcryptjs for password hashing
import { UsernameNotFoundException } from '../errors/UsernameNotFoundException'; // Custom exception for user not found

/**
 * @typedef {object} Customer
 * @property {number} customerId - The unique ID of the customer.
 * @property {string} email - The email address of the customer.
 * // Add other customer properties as needed
 */

/**
 * @typedef {object} Staff
 * @property {string} username - The username of the staff member.
 * @property {string} password - The hashed password of the staff member.
 * // Add other staff properties as needed
 */

/**
 * @typedef {object} UserDetails
 * @property {string} username - The username of the authenticated user.
 * @property {string} password - The hashed password of the authenticated user.
 * @property {string[]} roles - An array of roles/authorities assigned to the user (e.g., "ADMIN", "USER").
 * // Add other user details properties as needed (e.g., enabled, accountNonExpired, etc. if needed by auth framework)
 */

/**
 * @interface CustomerRepository
 * @description Interface for interacting with customer data.
 */
/**
 * @function CustomerRepository.getCustomerByEmail
 * @param {string} email - The email of the customer to find.
 * @returns {Promise<Customer|null>} A promise that resolves to the customer object or null if not found.
 */

/**
 * @interface StaffRepository
 * @description Interface for interacting with staff data.
 */
/**
 * @function StaffRepository.getStaffByUsername
 * @param {string} username - The username of the staff member to find.
 * @returns {Promise<Staff|null>} A promise that resolves to the staff object or null if not found.
 */

/**
 * @class UserDetailsServiceImpl
 * @description A service responsible for loading user details for authentication.
 * It acts as the bridge between the application's user data (customers and staff)
 * and an authentication mechanism (e.g., Passport.js or a custom middleware).
 * This class implements the core logic similar to Spring Security's UserDetailsService.
 */
class UserDetailsServiceImpl {
    /**
     * @private
     * @type {CustomerRepository}
     */
    customerRepository;

    /**
     * @private
     * @type {StaffRepository}
     */
    staffRepository;

    /**
     * Creates an instance of UserDetailsServiceImpl.
     * @param {CustomerRepository} customerRepository - The repository for customer data.
     * @param {StaffRepository} staffRepository - The repository for staff data.
     */
    constructor(customerRepository, staffRepository) {
        if (!customerRepository || !staffRepository) {
            throw new Error('CustomerRepository and StaffRepository must be provided.');
        }
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
    }

    /**
     * Loads user details by a given username (which can be an email for customers or a username for staff).
     * This method is the central point for fetching user credentials and roles for authentication.
     *
     * @async
     * @param {string} anyUsername - The username or email used to identify the user.
     * @returns {Promise<UserDetails>} A promise that resolves to a UserDetails object containing
     *                                  the user's username, hashed password, and roles.
     * @throws {UsernameNotFoundException} If no user (customer or staff) is found with the given identifier.
     * @throws {Error} For any unexpected errors during data retrieval or password hashing.
     */
    async loadUserByUsername(anyUsername) {
        if (!anyUsername) {
            throw new UsernameNotFoundException('Username cannot be empty.');
        }

        let customer = null;
        let staff = null;

        try {
            // Attempt to find a customer by email and a staff by username concurrently
            [customer, staff] = await Promise.all([
                this.customerRepository.getCustomerByEmail(anyUsername),
                this.staffRepository.getStaffByUsername(anyUsername)
            ]);
        } catch (error) {
            // Log the error for debugging purposes
            console.error(`Error fetching user from repositories: ${error.message}`);
            // Re-throw a generic error or a more specific one if needed
            throw new Error('Failed to retrieve user details due to a database error.');
        }

        if (!customer && !staff) {
            throw new UsernameNotFoundException('Could not find user with the provided identifier.');
        }

        let userDetails = {
            username: anyUsername,
            password: '', // Will be hashed
            roles: []
        };

        try {
            if (staff) {
                // If a staff member is found, assign ADMIN role and hash their password
                userDetails.password = await bcrypt.hash(staff.password, 10); // Salt rounds = 10
                userDetails.roles.push('ADMIN');
            } else if (customer) {
                // If a customer is found (and no staff), assign USER role.
                // Note: The original Java code uses customerId as password.
                // In a real-world scenario, customers should have a dedicated password field.
                userDetails.password = await bcrypt.hash(String(customer.customerId), 10); // Salt rounds = 10
                userDetails.roles.push('USER');
            }
        } catch (error) {
            console.error(`Error hashing password for user ${anyUsername}: ${error.message}`);
            throw new Error('Failed to process user credentials.');
        }

        return userDetails;
    }
}

export { UserDetailsServiceImpl, UsernameNotFoundException };

// --- Example Usage (for demonstration, not part of the production service itself) ---
// To make this production-ready, you would typically have actual repository implementations
// and an authentication framework (like Passport.js) that consumes this service.

/*
// Mock Repositories for demonstration purposes
class MockCustomerRepository {
    async getCustomerByEmail(email) {
        if (email === 'customer@example.com') {
            return { customerId: 123, email: 'customer@example.com', name: 'John Doe' };
        }
        return null;
    }
}

class MockStaffRepository {
    async getStaffByUsername(username) {
        if (username === 'admin_user') {
            // In a real app, this password would already be hashed in the DB
            return { username: 'admin_user', password: 'adminpassword123', name: 'Jane Smith' };
        }
        return null;
    }
}

// Example of how to instantiate and use the service
async function runExample() {
    const customerRepo = new MockCustomerRepository();
    const staffRepo = new MockStaffRepository();
    const userDetailsService = new UserDetailsServiceImpl(customerRepo, staffRepo);

    console.log('--- Testing Customer Login ---');
    try {
        const customerDetails = await userDetailsService.loadUserByUsername('customer@example.com');
        console.log('Customer Details:', customerDetails);
        // In a real auth flow, you'd then compare the provided password with customerDetails.password
        // using bcrypt.compare(providedPassword, customerDetails.password)
    } catch (error) {
        console.error('Customer Login Error:', error.message);
    }

    console.log('\n--- Testing Staff Login ---');
    try {
        const staffDetails = await userDetailsService.loadUserByUsername('admin_user');
        console.log('Staff Details:', staffDetails);
        // In a real auth flow, you'd then compare the provided password with staffDetails.password
        // using bcrypt.compare(providedPassword, staffDetails.password)
    } catch (error) {
        console.error('Staff Login Error:', error.message);
    }

    console.log('\n--- Testing User Not Found ---');
    try {
        await userDetailsService.loadUserByUsername('nonexistent@example.com');
    } catch (error) {
        console.error('User Not Found Error:', error.message);
    }

    console.log('\n--- Testing Empty Username ---');
    try {
        await userDetailsService.loadUserByUsername('');
    } catch (error) {
        console.error('Empty Username Error:', error.message);
    }
}

// Uncomment to run the example
// runExample();
*/
```