```javascript
// customer.service.js

import CustomerRepository from '../repositories/customer.repository.js'; // Adjust path as per your project structure

/**
 * @typedef {object} Customer
 * @property {number} [customerId] - The unique ID of the customer. Optional for new customers.
 * @property {string} firstName - The first name of the customer.
 * @property {string} lastName - The last name of the customer.
 * @property {string} email - The email address of the customer (must be unique).
 * @property {boolean} active - Whether the customer account is active.
 * @property {Date} createDate - The date the customer record was created.
 * @property {Date} lastUpdate - The date the customer record was last updated.
 * // Add any other properties that your Customer entity might have
 */

/**
 * @class CustomerService
 * @description A service layer component designed to encapsulate business logic related to `Customer` entities.
 * It acts as an intermediary between the presentation layer (e.g., a controller) and the data access layer (`CustomerRepository`).
 * This class uses ES6 features like classes, private fields, and async/await for asynchronous operations.
 */
class CustomerService {
    /**
     * @private
     * @type {CustomerRepository}
     * @description The data access layer for Customer entities, injected via the constructor.
     */
    #customerRepository;

    /**
     * Creates an instance of CustomerService.
     * @param {CustomerRepository} customerRepository - The data access layer for Customer entities.
     *   This dependency is injected, promoting loose coupling and testability.
     * @throws {Error} If `customerRepository` is not provided.
     */
    constructor(customerRepository) {
        if (!customerRepository) {
            throw new Error('CustomerRepository must be provided to CustomerService.');
        }
        this.#customerRepository = customerRepository;
    }

    /**
     * Retrieves all `Customer` records from the database.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of `Customer` objects.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getAllCustomers() {
        try {
            return await this.#customerRepository.findAll();
        } catch (error) {
            console.error(`[CustomerService] Error in getAllCustomers: ${error.message}`);
            // Re-throw a more generic error to abstract repository-specific details
            throw new Error('Failed to retrieve all customers.');
        }
    }

    /**
     * Retrieves a list of `Customer` records whose first name matches the given `firstName`.
     * @param {string} firstName - The first name to search for.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of `Customer` objects.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getCustomersByFirstName(firstName) {
        try {
            if (!firstName) {
                throw new Error('First name cannot be empty.');
            }
            return await this.#customerRepository.getCustomersByFirstName(firstName);
        } catch (error) {
            console.error(`[CustomerService] Error in getCustomersByFirstName for '${firstName}': ${error.message}`);
            throw new Error(`Failed to retrieve customers by first name: ${firstName}.`);
        }
    }

    /**
     * Retrieves a list of `Customer` records whose last name matches the given `lastName`.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of `Customer` objects.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getCustomersByLastName(lastName) {
        try {
            if (!lastName) {
                throw new Error('Last name cannot be empty.');
            }
            return await this.#customerRepository.getCustomersByLastName(lastName);
        } catch (error) {
            console.error(`[CustomerService] Error in getCustomersByLastName for '${lastName}': ${error.message}`);
            throw new Error(`Failed to retrieve customers by last name: ${lastName}.`);
        }
    }

    /**
     * Retrieves a list of `Customer` records whose first name and last name both match the given parameters.
     * @param {string} firstName - The first name to search for.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of `Customer` objects.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getCustomersByFullName(firstName, lastName) {
        try {
            if (!firstName || !lastName) {
                throw new Error('Both first name and last name must be provided.');
            }
            return await this.#customerRepository.getCustomersByFullName(firstName, lastName);
        } catch (error) {
            console.error(`[CustomerService] Error in getCustomersByFullName for '${firstName} ${lastName}': ${error.message}`);
            throw new Error(`Failed to retrieve customers by full name: ${firstName} ${lastName}.`);
        }
    }

    /**
     * Retrieves a single `Customer` record by their unique `customerId`.
     * @param {number} id - The unique ID of the customer.
     * @returns {Promise<Customer|null>} A promise that resolves to a `Customer` object if found, otherwise `null`.
     * @throws {Error} If an error occurs during data retrieval from the repository or if the ID is invalid.
     */
    async getCustomerById(id) {
        try {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('Invalid customer ID provided.');
            }
            return await this.#customerRepository.getCustomerByCustomerId(id);
        } catch (error) {
            console.error(`[CustomerService] Error in getCustomerById for ID '${id}': ${error.message}`);
            throw new Error(`Failed to retrieve customer with ID: ${id}.`);
        }
    }

    /**
     * Retrieves a single `Customer` record by their unique email address.
     * @param {string} email - The email address of the customer.
     * @returns {Promise<Customer|null>} A promise that resolves to a `Customer` object if found, otherwise `null`.
     * @throws {Error} If an error occurs during data retrieval from the repository or if the email is invalid.
     */
    async getCustomerByEmail(email) {
        try {
            // Basic email validation
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                throw new Error('Invalid email format provided.');
            }
            return await this.#customerRepository.getCustomerByEmail(email);
        } catch (error) {
            console.error(`[CustomerService] Error in getCustomerByEmail for '${email}': ${error.message}`);
            throw new Error(`Failed to retrieve customer with email: ${email}.`);
        }
    }

    /**
     * Persists a new `Customer` entity to the database or updates an existing one if the ID is present.
     * This method can handle both creation and update operations.
     * @param {Customer} customer - The `Customer` object to save or update.
     * @returns {Promise<Customer>} A promise that resolves to the saved or updated `Customer` object.
     * @throws {Error} If the customer object is invalid or an error occurs during persistence.
     */
    async save(customer) {
        try {
            // Basic validation for required fields
            if (!customer || !customer.firstName || !customer.lastName || !customer.email) {
                throw new Error('Customer object is invalid. Missing required fields (firstName, lastName, email).');
            }
            // Additional validation for email format
            if (!/\S+@\S+\.\S+/.test(customer.email)) {
                throw new Error('Invalid email format for customer.');
            }

            // In a real application, you might add more complex business logic here:
            // - Check for duplicate emails before saving a new customer
            // - Validate business rules (e.g., age, address format)
            // - Orchestrate operations across multiple repositories

            return await this.#customerRepository.save(customer);
        } catch (error) {
            console.error(`[CustomerService] Error in save customer: ${error.message}`);
            throw new Error(`Failed to save customer: ${error.message}`);
        }
    }

    /**
     * Retrieves the total number of `Customer` records in the database.
     * @returns {Promise<number>} A promise that resolves to the total count of customers.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getCustomerCount() {
        try {
            return await this.#customerRepository.getCustomerCount();
        } catch (error) {
            console.error(`[CustomerService] Error in getCustomerCount: ${error.message}`);
            throw new Error('Failed to retrieve customer count.');
        }
    }

    // Note: The original Java analysis mentioned "delete is missing".
    // If a delete operation were needed, it would look similar to this:
    /*
    async deleteCustomerById(id) {
        try {
            if (typeof id !== 'number' || id <= 0) {
                throw new Error('Invalid customer ID provided for deletion.');
            }
            // Assuming the repository has a delete method
            const deletedCount = await this.#customerRepository.deleteById(id);
            if (deletedCount === 0) {
                console.warn(`[CustomerService] No customer found with ID ${id} for deletion.`);
                return false; // Or throw a specific "NotFound" error
            }
            return true;
        } catch (error) {
            console.error(`[CustomerService] Error in deleteCustomerById for ID '${id}': ${error.message}`);
            throw new Error(`Failed to delete customer with ID: ${id}.`);
        }
    }
    */
}

export default CustomerService;
```