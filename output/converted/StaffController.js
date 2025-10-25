To convert the Java Spring Controller to Node.js/JavaScript with Express.js, we'll create a modular structure including the main Express application, the controller (as a router module), and placeholder service modules.

Here's the complete, production-ready Node.js code:

---

**1. `app.js` (Main Express Application Setup)**

This file sets up the Express server, configures the view engine, includes the routes, and defines global error handling.

```javascript
/**
 * @file app.js
 * @description
 * Main entry point for the Node.js Express application.
 * Configures the Express server, view engine, routes, and global error handling.
 */

const express = require('express');
const path = require('path');
const staffRoutes = require('./routes/staffRoutes'); // Import the staff controller/router

const app = express();
const PORT = process.env.PORT || 3000;

// --- Express Configuration ---

// Set up view engine (e.g., EJS)
// Assuming views are in a 'views' directory at the root
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // You can use 'pug', 'hbs', etc., instead of 'ejs'

// Serve static files (e.g., CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware for handling JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Authentication Middleware (Placeholder) ---
/**
 * @description
 * This middleware simulates an authentication mechanism that populates `req.user`
 * with the authenticated user's details. In a real application, this would be
 * handled by a robust authentication library like Passport.js, which would
 * verify user credentials (e.g., from a session, JWT, or API key) and attach
 * the user object to the request.
 *
 * For demonstration purposes, it hardcodes a user.
 * To test the unauthenticated case, set `req.user = null;` or comment out the assignment.
 */
app.use((req, res, next) => {
    // Simulate an authenticated user for testing purposes
    req.user = {
        username: 'john.doe', // This username will be used by the StaffController
        id: 123,
        roles: ['OWNER']
    };
    // To test the unauthenticated case:
    // req.user = null;
    next();
});

// --- Routes ---
// Mount the staff routes. All routes defined in staffRoutes.js will be accessible.
app.use('/', staffRoutes);

// --- Global Error Handling Middleware ---
/**
 * Global error handling middleware.
 * This catches any errors thrown or passed via `next(err)` from route handlers
 * or other middleware. It provides a centralized way to handle application errors.
 *
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function (not used here as it's the last handler).
 */
app.use((err, req, res, next) => {
    console.error(`Global Error Handler: ${err.stack}`);

    // Determine status code (default to 500 Internal Server Error)
    const statusCode = err.statusCode || 500;

    // Render an error page or send JSON response based on client's `Accept` header
    if (req.accepts('html')) {
        res.status(statusCode).render('error', {
            title: 'Error',
            message: err.message,
            statusCode: statusCode,
            // In production, avoid sending stack traces to the client for security reasons
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } else if (req.accepts('json')) {
        res.status(statusCode).json({
            message: err.message,
            statusCode: statusCode,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } else {
        res.status(statusCode).send(`Error: ${err.message}`);
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Try navigating to http://localhost:${PORT}/owner`);
});

module.exports = app; // Export app for testing purposes
```

---

**2. `routes/staffRoutes.js` (Controller Module)**

This module acts as the `StaffController`, defining the `/owner` route and its handler.

```javascript
/**
 * @module StaffController
 * @description
 * This module defines the Express.js router for handling staff-related web requests,
 * specifically the owner's dashboard. It orchestrates data retrieval from various
 * service layers and prepares it for rendering a view.
 */

const express = require('express');
const router = express.Router();

// Import service modules (assuming they are in a 'services' directory relative to this file)
const staffService = require('../services/staffService');
const customerService = require('../services/customerService');
const inventoryService = require('../services/inventoryService');

/**
 * GET /owner
 * @summary Renders the owner's dashboard with staff details, customer count, and inventory count.
 * @description
 * This request handler method processes the incoming GET request for the `/owner` endpoint.
 * It performs the following steps:
 * 1. **User Context Management:** Retrieves the username of the currently authenticated user
 *    from `req.user` (populated by an authentication middleware). If no user is found,
 *    it throws an `Unauthorized` error.
 * 2. **Orchestrate Data Retrieval:** Delegates to `StaffService`, `CustomerService`, and
 *    `InventoryService` to fetch the staff entity, total customer count, and total inventory count,
 *    respectively. These operations are asynchronous and use `async/await`.
 * 3. **Error Handling:** Catches potential errors during service calls (e.g., staff not found,
 *    database issues) and passes them to the global error handling middleware.
 * 4. **Prepare Data for View & Select View:** Populates an object with the retrieved data
 *    (`staff`, `customers`, `inventory`) and renders the `'/owner/owner'` view using `res.render()`.
 *
 * @param {object} req - The Express request object.
 * @param {object} [req.user] - The authenticated user object (populated by authentication middleware).
 * @param {string} [req.user.username] - The username of the authenticated user.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack, used for error propagation.
 * @returns {void} Renders the '/owner/owner' view with staff, customer count, and inventory count data.
 * @throws {Error} If the user is not authenticated (401), if the staff member is not found (404),
 *                 or if any underlying service call fails (500).
 */
router.get('/owner', async (req, res, next) => {
    try {
        // 1. User Context Management: Retrieve username from authenticated user
        const username = req.user ? req.user.username : null;

        if (!username) {
            // If no username, the user is not authenticated or session expired.
            const error = new Error('Authentication required. No user found in session.');
            error.statusCode = 401; // HTTP 401 Unauthorized
            throw error;
        }

        // 2. Orchestrate Data Retrieval: Delegate to service layers
        // All service calls are assumed to be asynchronous.
        const staff = await staffService.getStaffByUsername(username);
        const customerCount = await customerService.getCustomerCount();
        const inventoryCount = await inventoryService.getInventoryCount();

        // Handle case where staff might not be found for the given username
        if (!staff) {
            const error = new Error(`Staff member with username '${username}' not found.`);
            error.statusCode = 404; // HTTP 404 Not Found
            throw error;
        }

        // 3. Prepare Data for View & Select View
        // In Express, data is passed as an object to res.render()
        // The keys here correspond to the variables accessible in the EJS/view template.
        res.render('owner/owner', {
            staff: staff,
            customers: customerCount, // Matches the "customers" key in Java's ModelMap
            inventory: inventoryCount // Matches the "inventory" key in Java's ModelMap
        });

    } catch (error) {
        // 4. Error Handling: Pass errors to the next middleware (global error handler)
        console.error(`Error in /owner route for user '${req.user ? req.user.username : 'N/A'}': ${error.message}`);
        next(error); // Pass the error to the Express error handling middleware
    }
});

module.exports = router;
```

---

**3. `services/staffService.js` (Service Module)**

```javascript
/**
 * @module StaffService
 * @description
 * Provides business logic for staff-related operations.
 * In a real application, this would interact with a database (e.g., using an ORM like Sequelize or Mongoose)
 * to fetch actual staff data.
 */

/**
 * Represents a Staff entity.
 * @typedef {object} Staff
 * @property {number} staffId - The unique ID of the staff member.
 * @property {string} firstName - The first name of the staff member.
 * @property {string} lastName - The last name of the staff member.
 * @property {string} username - The username of the staff member.
 * @property {string} email - The email of the staff member.
 * // Add other relevant staff properties as needed
 */

/**
 * Retrieves a staff member by their username.
 * This function simulates an asynchronous database call.
 *
 * @async
 * @param {string} username - The username of the staff member to retrieve.
 * @returns {Promise<Staff|null>} A promise that resolves to the Staff object if found, otherwise `null`.
 */
async function getStaffByUsername(username) {
    // Simulate an asynchronous database call with a delay
    return new Promise(resolve => {
        setTimeout(() => {
            if (username === 'john.doe') {
                resolve({
                    staffId: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    username: 'john.doe',
                    email: 'john.doe@example.com',
                    address: '123 Main St',
                    city: 'Anytown'
                });
            } else if (username === 'mary.smith') {
                 resolve({
                    staffId: 2,
                    firstName: 'Mary',
                    lastName: 'Smith',
                    username: 'mary.smith',
                    email: 'mary.smith@example.com',
                    address: '456 Oak Ave',
                    city: 'Otherville'
                });
            }
            else {
                resolve(null); // Staff not found for the given username
            }
        }, 50); // Simulate network/DB latency
    });
}

module.exports = {
    getStaffByUsername
};
```

---

**4. `services/customerService.js` (Service Module)**

```javascript
/**
 * @module CustomerService
 * @description
 * Provides business logic for customer-related operations.
 * In a real application, this would interact with a database to fetch actual customer counts.
 */

/**
 * Retrieves the total count of customers.
 * This function simulates an asynchronous database call.
 *
 * @async
 * @returns {Promise<number>} A promise that resolves to the total number of customers.
 */
async function getCustomerCount() {
    // Simulate an asynchronous database call with a delay
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(12345); // Example customer count
        }, 50); // Simulate network/DB latency
    });
}

module.exports = {
    getCustomerCount
};
```

---

**5. `services/inventoryService.js` (Service Module)**

```javascript
/**
 * @module InventoryService
 * @description
 * Provides business logic for inventory-related operations.
 * In a real application, this would interact with a database to fetch actual inventory counts.
 */

/**
 * Retrieves the total count of inventory items.
 * This function simulates an asynchronous database call.
 *
 * @async
 * @returns {Promise<number>} A promise that resolves to the total number of inventory items.
 */
async function getInventoryCount() {
    // Simulate an asynchronous database call with a delay
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(54321); // Example inventory count
        }, 50); // Simulate network/DB latency
    });
}

module.exports = {
    getInventoryCount
};
```

---

**6. `views/owner/owner.ejs` (Example View File)**

This EJS template will be rendered by the `StaffController`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Owner Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0;