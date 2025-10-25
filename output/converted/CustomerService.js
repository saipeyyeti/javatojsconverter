/**
 * @typedef {object} Customer
 * @property {number} [customerId] - The unique identifier for the customer. Optional for new customers.
 * @property {string} firstName - The first name of the customer.
 * @property {string} lastName - The last name of the customer.
 * @property {string} email - The email address of the customer (should be unique).
 * // Add other customer properties as needed based on the actual entity structure
 */

/**
 * @typedef {object} CustomerRepository
 * @property {function(): Promise<Customer[]>} findAll - Retrieves all customer records.
 * @property {(firstName: string) => Promise<Customer[]>} getCustomersByFirstName - Retrieves customers by first name.
 * @property {(lastName: string) => Promise<Customer[]>} getCustomersByLastName - Retrieves customers by last name.
 * @property {(firstName: string, lastName: string) => Promise<Customer[]>} getCustomersByFullName - Retrieves customers by full name.
 * @property {(id: number) => Promise<Customer | null>} getCustomerByCustomerId - Retrieves a customer by their ID.
 * @property {(email: string) => Promise<Customer | null>} getCustomerByEmail - Retrieves a customer by their email.
 * @property {(customer: Customer) => Promise<Customer>} save - Persists a customer entity (create or update).
 * @property {function(): Promise<number>} getCustomerCount - Retrieves the total number of customer records.
 */

/**
 * Custom error class for when a customer is not found.
 * @extends Error
 */
class CustomerNotFoundError extends Error {
    /**
     * Creates an instance of CustomerNotFoundError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'CustomerNotFoundError';
        this.statusCode = 404; // Common HTTP status for Not Found
    }
}

/**
 * CustomerService class encapsulates business logic related to Customer entities.
 * It acts as an intermediary layer between the presentation/controller layer and the data access layer (CustomerRepository).
 * This service orchestrates operations, handles business rules (if any), and abstracts data access details.
 */
class CustomerService {
    /**
     * @private
     * @type {CustomerRepository}
     */
    #customerRepository; // Using private class fields (ES2019) for better encapsulation

    /**
     * Creates an instance of CustomerService.
     * This constructor uses Dependency Injection to receive the CustomerRepository.
     * @param {CustomerRepository} customerRepository - The data access layer for Customer entities.
     *   This dependency is injected, allowing for loose coupling and testability.
     * @throws {Error} If customerRepository is not provided.
     */
    constructor(customerRepository) {
        if (!customerRepository) {
            throw new Error('CustomerService: CustomerRepository must be provided.');
        }
        this.#customerRepository = customerRepository;
    }

    /**
     * Retrieves a list of all Customer records from the database.
     * Delegates directly to `customerRepository.findAll()`.
     * @returns {Promise<Customer[]>} A promise that resolves to an array of Customer objects.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getAllCustomers() {
        try {
            return await this.#customerRepository.findAll();
        } catch (error) {
            console.error(`CustomerService: Error in getAllCustomers: ${error.message}`);
            throw new Error('Failed to retrieve all customers due to a database error.');
        }
    }

    /**
     * Retrieves a list of Customer records whose first name matches the given `firstName`.
     * Delegates to a custom method in the repository.
     * @param {string} firstName - The first name to search for.
     * @returns {Promise<Customer[]>} A promise that resolves to an array of Customer objects.
     * @throws {Error} If `firstName` is invalid or an error occurs during data retrieval.
     */
    async getCustomersByFirstName(firstName) {
        if (typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('CustomerService: First name must be a non-empty string.');
        }
        try {
            return await this.#customerRepository.getCustomersByFirstName(firstName);
        } catch (error) {
            console.error(`CustomerService: Error in getCustomersByFirstName for '${firstName}': ${error.message}`);
            throw new Error(`Failed to retrieve customers by first name '${firstName}'.`);
        }
    }

    /**
     * Retrieves a list of Customer records whose last name matches the given `lastName`.
     * Delegates to a custom method in the repository.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Customer[]>} A promise that resolves to an array of Customer objects.
     * @throws {Error} If `lastName` is invalid or an error occurs during data retrieval.
     */
    async getCustomersByLastName(lastName) {
        if (typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('CustomerService: Last name must be a non-empty string.');
        }
        try {
            return await this.#customerRepository.getCustomersByLastName(lastName);
        } catch (error) {
            console.error(`CustomerService: Error in getCustomersByLastName for '${lastName}': ${error.message}`);
            throw new Error(`Failed to retrieve customers by last name '${lastName}'.`);
        }
    }

    /**
     * Retrieves a list of Customer records matching both the given `firstName` and `lastName`.
     * Delegates to a custom method in the repository.
     * @param {string} firstName - The first name to search for.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Customer[]>} A promise that resolves to an array of Customer objects.
     * @throws {Error} If `firstName` or `lastName` are invalid, or an error occurs during data retrieval.
     */
    async getCustomersByFullName(firstName, lastName) {
        if (typeof firstName !== 'string' || firstName.trim() === '' ||
            typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('CustomerService: First name and last name must be non-empty strings.');
        }
        try {
            return await this.#customerRepository.getCustomersByFullName(firstName, lastName);
        } catch (error) {
            console.error(`CustomerService: Error in getCustomersByFullName for '${firstName} ${lastName}': ${error.message}`);
            throw new Error(`Failed to retrieve customers by full name '${firstName} ${lastName}'.`);
        }
    }

    /**
     * Retrieves a single Customer record by their unique `customerId`.
     * Delegates to a custom method in the repository.
     * @param {number} id - The unique identifier of the customer.
     * @returns {Promise<Customer>} A promise that resolves to a Customer object.
     * @throws {Error} If `id` is invalid.
     * @throws {CustomerNotFoundError} If no customer is found with the given ID.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getCustomerByID(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('CustomerService: Customer ID must be a positive integer.');
        }
        try {
            const customer = await this.#customerRepository.getCustomerByCustomerId(id);
            if (!customer) {
                throw new CustomerNotFoundError(`Customer with ID ${id} not found.`);
            }
            return customer;
        } catch (error) {
            if (error instanceof CustomerNotFoundError) {
                throw error; // Re-throw specific error
            }
            console.error(`CustomerService: Error in getCustomerByID for ID ${id}: ${error.message}`);
            throw new Error(`Failed to retrieve customer by ID ${id}.`);
        }
    }

    /**
     * Retrieves a single Customer record by their unique `email` address.
     * Delegates to a custom method in the repository.
     * @param {string} email - The email address of the customer.
     * @returns {Promise<Customer>} A promise that resolves to a Customer object.
     * @throws {Error} If `email` is invalid.
     * @throws {CustomerNotFoundError} If no customer is found with the given email.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getCustomerByEmail(email) {
        // Basic email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email)) {
            throw new Error('CustomerService: Email must be a valid non-empty string.');
        }
        try {
            const customer = await this.#customerRepository.getCustomerByEmail(email);
            if (!customer) {
                throw new CustomerNotFoundError(`Customer with email '${email}' not found.`);
            }
            return customer;
        } catch (error) {
            if (error instanceof CustomerNotFoundError) {
                throw error; // Re-throw specific error
            }
            console.error(`CustomerService: Error in getCustomerByEmail for '${email}': ${error.message}`);
            throw new Error(`Failed to retrieve customer by email '${email}'.`);
        }
    }

    /**
     * Persists a Customer entity to the database. This method can be used for both creating a new customer
     * and updating an existing one (if the `Customer` object has a `customerId`).
     * Delegates to `customerRepository.save()`.
     * @param {Customer} customer - The Customer object to save.
     * @returns {Promise<Customer>} A promise that resolves to the saved Customer object (potentially with an updated ID if new).
     * @throws {Error} If the customer object is invalid or an error occurs during persistence.
     */
    async save(customer) {
        if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
            throw new Error('CustomerService: Customer object must be provided.');
        }
        // Basic validation for required fields
        if (typeof customer.firstName !== 'string' || customer.firstName.trim() === '' ||
            typeof customer.lastName !== 'string' || customer.lastName.trim() === '' ||
            typeof customer.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
            throw new Error('CustomerService: Customer must have valid firstName, lastName, and email.');
        }

        try {
            return await this.#customerRepository.save(customer);
        } catch (error) {
            console.error(`CustomerService: Error in save customer: ${error.message}`);
            // Check for specific error types from repository, e.g., unique constraint violation
            if (error.code === 'ER_DUP_ENTRY' || error.message.includes('duplicate key')) { // Example for MySQL/PostgreSQL
                throw new Error('Failed to save customer: Email address already in use.');
            }
            throw new Error('Failed to save customer due to a database error.');
        }
    }

    /**
     * Retrieves the total number of Customer records in the database.
     * Delegates to a custom method in the repository.
     * @returns {Promise<number>} A promise that resolves to the total count of customers.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getCustomerCount() {
        try {
            return await this.#customerRepository.getCustomerCount();
        } catch (error) {
            console.error(`CustomerService: Error in getCustomerCount: ${error.message}`);
            throw new Error('Failed to retrieve customer count due to a database error.');
        }
    }
}

// Export the service and the custom error for external use
module.exports = { CustomerService, CustomerNotFoundError };