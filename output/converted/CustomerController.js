/**
 * @file CustomerController - Handles web requests related to customer information and rental history.
 * @module controllers/customerController
 * @requires express
 * @description This module provides an Express.js router that mimics the functionality of the
 *              original Java Spring MVC `CustomerController`. It handles various customer-related
 *              endpoints, including displaying current user's rental history, listing all customers
 *              for an owner/admin, and showing a specific customer's rental history.
 *              It uses async/await for asynchronous operations and includes comprehensive JSDoc comments
 *              and error handling.
 *
 *              **Note:** In a real-world Node.js application, the `services` and `entities` (models)
 *              would be imported from separate, dedicated modules. For the purpose of this conversion,
 *              mock implementations of these services and entity classes are included directly
 *              within this file to make it self-contained and runnable.
 */

const express = require('express');
const router = express.Router();

// --- Mock Services and Entities (In a real application, these would be imported from separate files) ---

/**
 * Represents a Customer entity.
 * @typedef {object} Customer
 * @property {number} customerId - The unique ID of the customer.
 * @property {string} firstName - The first name of the customer.
 * @property {string} lastName - The last name of the customer.
 * @property {string} email - The email address of the customer.
 */

/**
 * Represents a Film entity.
 * @typedef {object} Film
 * @property {number} filmId - The unique ID of the film.
 * @property {string} title - The title of the film.
 * @property {string} description - The description of the film.
 */

/**
 * Represents an Inventory entity.
 * @typedef {object} Inventory
 * @property {number} inventoryId - The unique ID of the inventory item.
 * @property {number} filmId - The ID of the film associated with this inventory item.
 * @property {number} storeId - The ID of the store where the inventory is located.
 */

/**
 * Represents a Rental entity.
 * @typedef {object} Rental
 * @property {number} rentalId - The unique ID of the rental.
 * @property {number} customerId - The ID of the customer who rented the item.
 * @property {number} inventoryId - The ID of the inventory item rented.
 * @property {Date} rentalDate - The date the item was rented.
 * @property {Date|null} returnDate - The date the item was returned, or null if not yet returned.
 */

/**
 * Represents an aggregated Order object for view display.
 * This acts as a Data Transfer Object (DTO) combining customer, film, and rental details.
 * @class
 */
class Order {
    /**
     * Creates an instance of Order.
     * @param {Customer} customer - The customer associated with the order.
     * @param {Film} film - The film associated with the order.
     * @param {Rental} rental - The rental details.
     */
    constructor(customer, film, rental) {
        this.customer = customer;
        this.film = film;
        this.rental = rental;
    }
}

// --- Mock Data Store (Simulating a database) ---
const mockCustomers = [
    { customerId: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    { customerId: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
    { customerId: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com' },
    { customerId: 4, firstName: 'Bob', lastName: 'Williams', email: 'bob.w@example.com' },
    { customerId: 5, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com' },
];

const mockFilms = [
    { filmId: 101, title: 'Film A: The Beginning', description: 'Description for Film A' },
    { filmId: 102, title: 'Film B: The Sequel', description: 'Description for Film B' },
    { filmId: 103, title: 'Film C: The Finale', description: 'Description for Film C' },
    { filmId: 104, title: 'Film D: A New Hope', description: 'Description for Film D' },
];

const mockInventories = [
    { inventoryId: 201, filmId: 101, storeId: 1 },
    { inventoryId: 202, filmId: 102, storeId: 1 },
    { inventoryId: 203, filmId: 101, storeId: 2 },
    { inventoryId: 204, filmId: 103, storeId: 1 },
    { inventoryId: 205, filmId: 104, storeId: 2 },
    { inventoryId: 206, filmId: 102, storeId: 2 },
];

const mockRentals = [
    { rentalId: 301, customerId: 1, inventoryId: 201, rentalDate: new Date('2023-01-01'), returnDate: new Date('2023-01-05') },
    { rentalId: 302, customerId: 1, inventoryId: 202, rentalDate: new Date('2023-02-10'), returnDate: null },
    { rentalId: 303, customerId: 2, inventoryId: 204, rentalDate: new Date('2023-03-15'), returnDate: new Date('2023-03-20') },
    { rentalId: 304, customerId: 1, inventoryId: 203, rentalDate: new Date('2023-04-01'), returnDate: null },
    { rentalId: 305, customerId: 3, inventoryId: 205, rentalDate: new Date('2023-05-01'), returnDate: new Date('2023-05-07') },
    { rentalId: 306, customerId: 2, inventoryId: 206, rentalDate: new Date('2023-06-01'), returnDate: null },
];

/**
 * Mock Customer Service.
 * Simulates asynchronous data retrieval for customer-related operations.
 */
const customerService = {
    /**
     * Retrieves a customer by their email address.
     * @param {string} email - The email of the customer.
     * @returns {Promise<Customer|null>} A promise that resolves to the customer object or null if not found.
     */
    async getCustomerByEmail(email) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockCustomers.find(c => c.email.toLowerCase() === email.toLowerCase()) || null);
        }, 50)); // Simulate network delay
    },

    /**
     * Retrieves a customer by their ID.
     * @param {number} id - The ID of the customer.
     * @returns {Promise<Customer|null>} A promise that resolves to the customer object or null if not found.
     */
    async getCustomerByID(id) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockCustomers.find(c => c.customerId === id) || null);
        }, 50));
    },

    /**
     * Retrieves all customers.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of all customers.
     */
    async getAllCustomers() {
        return new Promise(resolve => setTimeout(() => {
            resolve([...mockCustomers]); // Return a copy to prevent external modification
        }, 50));
    },

    /**
     * Retrieves customers by first name.
     * @param {string} firstName - The first name to filter by.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of customers.
     */
    async getCustomersByFirstName(firstName) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockCustomers.filter(c => c.firstName.toLowerCase() === firstName.toLowerCase()));
        }, 50));
    },

    /**
     * Retrieves customers by last name.
     * @param {string} lastName - The last name to filter by.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of customers.
     */
    async getCustomersByLastName(lastName) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockCustomers.filter(c => c.lastName.toLowerCase() === lastName.toLowerCase()));
        }, 50));
    },

    /**
     * Retrieves customers by full name.
     * @param {string} firstName - The first name to filter by.
     * @param {string} lastName - The last name to filter by.
     * @returns {Promise<Customer[]>} A promise that resolves to a list of customers.
     */
    async getCustomersByFullName(firstName, lastName) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockCustomers.filter(c =>
                c.firstName.toLowerCase() === firstName.toLowerCase() &&
                c.lastName.toLowerCase() === lastName.toLowerCase()
            ));
        }, 50));
    },
};

/**
 * Mock Rental Service.
 * Simulates asynchronous data retrieval for rental-related operations.
 */
const rentalService = {
    /**
     * Retrieves rentals for a specific customer.
     * @param {number} customerId - The ID of the customer.
     * @returns {Promise<Rental[]>} A promise that resolves to a list of rentals.
     */
    async getRentalsByCustomer(customerId) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockRentals.filter(r => r.customerId === customerId));
        }, 50));
    },
};

/**
 * Mock Inventory Service.
 * Simulates asynchronous data retrieval for inventory-related operations.
 */
const inventoryService = {
    /**
     * Retrieves an inventory item by its ID.
     * @param {number} inventoryId - The ID of the inventory item.
     * @returns {Promise<Inventory|null>} A promise that resolves to the inventory object or null.
     */
    async getInventoriesById(inventoryId) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockInventories.find(i => i.inventoryId === inventoryId) || null);
        }, 50));
    },
};

/**
 * Mock Film Service.
 * Simulates asynchronous data retrieval for film-related operations.
 */
const filmService = {
    /**
     * Retrieves a film by its ID.
     * @param {number} filmId - The ID of the film.
     * @returns {Promise<Film|null>} A promise that resolves to the film object or null.
     */
    async getFilmByID(filmId) {
        return new Promise(resolve => setTimeout(() => {
            resolve(mockFilms.find(f => f.filmId === filmId) || null);
        }, 50));
    },
};

// --- Controller Routes ---

/**
 * GET /customer
 * Displays the rental history and details for the currently logged-in customer.
 * This endpoint assumes that an authentication middleware (e.g., Passport.js) has
 * populated `req.user` with the authenticated user's details, including their email.
 *
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 * @returns {Promise<void>} Renders the 'customer/customer' view with the customer's orders.
 */
router.get('/customer', async (req, res, next) => {
    try {
        // In a real application, req.user would be populated by authentication middleware.
        // For this mock, we'll use a hardcoded email if req.user is not available.
        const email = req.user && req.user.email ? req.user.email : 'john.doe@example.com'; // Mock authenticated user email

        const customer = await customerService.getCustomerByEmail(email);
        const ordersList = [];

        if (!customer) {
            console.warn(`Customer not found for authenticated email: ${email}. Rendering with empty data.`);
            // Depending on requirements, could redirect to login, error page, or just show empty state.
            return res.render('customer/customer', { orders: ordersList, customer: null });
        }

        const customersRentals = await rentalService.getRentalsByCustomer(customer.customerId);

        for (const rental of customersRentals) {
            const inventory = await inventoryService.getInventoriesById(rental.inventoryId);
            if (!inventory) {
                console.warn(`Inventory not found for ID: ${rental.inventoryId}. Skipping this rental.`);
                continue; // Skip this rental if associated inventory is missing
            }
            const film = await filmService.getFilmByID(inventory.filmId);
            if (!film) {
                console.warn(`Film not found for ID: ${inventory.filmId}. Skipping this rental.`);
                continue; // Skip this rental if associated film is missing
            }
            const order = new Order(customer, film, rental);
            ordersList.push(order);
        }

        res.render('customer/customer', { orders: ordersList, customer: customer });
    } catch (error) {
        console.error('Error fetching current user rental history:', error);
        // Pass the error to the next middleware, typically an error-handling middleware
        next(error);
    }
});

/**
 * GET /owner/customers
 * Provides a list of all customers, with optional filtering capabilities by first name and/or last name.
 * This endpoint is intended for an owner/admin view.
 *
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 * @param {string} [req.query.firstName="ALL CUSTOMERS"] - Optional first name filter from query parameters.
 * @param {string} [req.query.lastName="ALL CUSTOMERS"] - Optional last name filter from query parameters.
 * @returns {Promise<void>} Renders the 'owner/customers' view with filtered and all customers.
 */
router.get('/owner/customers', async (req, res, next) => {
    try {
        const firstNameFilter = req.query.firstName || 'ALL CUSTOMERS';
        const lastNameFilter = req.query.lastName || 'ALL CUSTOMERS';

        let customers;
        if (firstNameFilter === 'ALL CUSTOMERS' && lastNameFilter === 'ALL CUSTOMERS') {
            customers = await customerService.getAllCustomers();
        } else if (lastNameFilter === 'ALL CUSTOMERS') {
            customers = await customerService.getCustomersByFirstName(firstNameFilter);
        } else if (firstNameFilter === 'ALL CUSTOMERS') {
            customers = await customerService.getCustomersByLastName(lastNameFilter);
        } else {
            customers = await customerService.getCustomersByFullName(firstNameFilter, lastNameFilter);
        }

        const allCustomers = await customerService.getAllCustomers(); // Used for a potential reset or selection dropdown in the UI

        res.render('owner/customers', {
            customers: customers,
            allCustomers: allCustomers,
            firstNameFilter: firstNameFilter, // Pass filters back to view for display/form pre-filling
            lastNameFilter: lastNameFilter
        });
    } catch (error) {
        console.error('Error fetching customers for owner view:', error);
        next(error);
    }
});

/**
 * GET /owner/view/customers/:id
 * Displays the detailed rental history for a specific customer, identified by their ID in the URL path.
 * This endpoint is also intended for an owner/admin view.
 *
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 * @param {string} req.params.id - The ID of the customer to view, extracted from the URL path.
 * @returns {Promise<void>} Renders the 'owner/customerDetails' view with the customer's rental history.
 */
router.get('/owner/view/customers/:id', async (req, res, next) => {
    try {
        const customerId = parseInt(req.params.id, 10);

        // Validate the customer ID from the URL parameter
        if (isNaN(customerId)) {
            console.warn(`Invalid customer ID provided: ${req.params.id}`);
            return res.status(400).render('error', { message: 'Bad Request: Invalid Customer ID provided.' });
        }

        const customer = await customerService.getCustomerByID(customerId);
        const ordersList = [];

        if (!customer) {
            console.warn(`Customer with ID ${customerId} not found.`);
            return res.status(404).render('error', { message: `Not Found: Customer with ID ${customerId} not found.` });
        }

        const customersRentals = await rentalService.getRentalsByCustomer(customerId);

        for (const rental of customersRentals) {
            const inventory = await inventoryService.getInventoriesById(rental.inventoryId);
            if (!inventory) {
                console.warn(`Inventory not found for ID: ${rental.inventoryId} during customer history lookup for customer ${customerId}. Skipping this rental.`);
                continue;
            }
            const film = await filmService.getFilmByID(inventory.filmId);
            if (!film) {
                console.warn(`Film not found for ID: ${inventory.filmId} during customer history lookup for customer ${customerId}. Skipping this rental.`);
                continue;
            }
            const order = new Order(customer, film, rental);
            ordersList.push(order);
        }

        res.render('owner/customerDetails', { history: ordersList, customer: customer });
    } catch (error) {
        console.error(`Error fetching rental history for customer ID ${req.params.id}:`, error);
        next(error); // Pass the error to the next middleware
    }
});

module.exports = router;