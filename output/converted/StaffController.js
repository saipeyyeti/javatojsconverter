// Filename: routes/staffRoutes.js (or controllers/staffController.js)

const express = require('express');

/**
 * @typedef {object} Staff
 * @property {number} id - The staff ID.
 * @property {string} firstName - The staff's first name.
 * @property {string} lastName - The staff's last name.
 * @property {string} username - The staff's username.
 * @property {string} email - The staff's email address.
 * @property {string} role - The staff's role.
 * // Add other staff properties as per your entity definition
 */

/**
 * Creates and configures an Express router for staff-related operations,
 * specifically for the owner's dashboard.
 *
 * This module serves as the Node.js/Express equivalent of the Java Spring `StaffController`.
 * It is responsible for handling web requests, orchestrating business logic by delegating
 * to service layers, preparing data for presentation, and selecting the appropriate view
 * to be rendered.
 *
 * @param {object} dependencies - An object containing service dependencies, mimicking Spring's Dependency Injection.
 * @param {object} dependencies.staffService - An instance of the StaffService, providing methods for staff-related business logic.
 * @param {function(string): Promise<Staff|null>} dependencies.staffService.getStaffByUsername - Asynchronous function to retrieve staff details by username.
 * @param {object} dependencies.customerService - An instance of the CustomerService, providing methods for customer-related business logic.
 * @param {function(): Promise<number>} dependencies.customerService.getCustomerCount - Asynchronous function to retrieve the total customer count.
 * @param {object} dependencies.inventoryService - An instance of the InventoryService, providing methods for inventory-related business logic.
 * @param {function(): Promise<number>} dependencies.inventoryService.getInventoryCount - Asynchronous function to retrieve the total inventory count.
 * @returns {express.Router} An Express router instance configured with the `/owner` route.
 */
module.exports = function staffController({ staffService, customerService, inventoryService }) {
    const router = express.Router();

    /**
     * @route GET /owner
     * @summary Renders the owner's dashboard with staff details, customer count, and inventory count.
     * @description This route handles HTTP GET requests to the `/owner` URL path.
     * It performs the following actions:
     * 1. Identifies the currently authenticated user's username from `req.user`.
     * 2. Fetches the `Staff` object corresponding to the logged-in user using `staffService`.
     * 3. Retrieves aggregate counts for customers and inventory using `customerService` and `inventoryService`.
     * 4. Populates a data object (analogous to Spring's `ModelMap`) with the retrieved information.
     * 5. Renders the `owner/owner` view template, passing the prepared data.
     *
     * @param {express.Request} req - The Express request object.
     *   - **Assumption:** `req.user` is populated by an authentication middleware (e.g., Passport.js, JWT middleware)
     *     and contains a `username` property, analogous to Java's `HttpServletRequest.getRemoteUser()`.
     * @param {express.Response} res - The Express response object, used for sending responses and rendering views.
     * @param {express.NextFunction} next - The Express next middleware function, used for error propagation.
     * @returns {void}
     */
    router.get('/owner', async (req, res, next) => {
        try {
            // 1. Identify the Current User
            // In a production application, `req.user` would be reliably populated by an authentication middleware.
            const username = req.user ? req.user.username : null;

            if (!username) {
                // If no user is authenticated or the username is missing, respond with 401 Unauthorized.
                // Renders a generic 'error' view, assuming it's configured in your Express app.
                return res.status(401).render('error', {
                    title: 'Unauthorized Access',
                    message: 'Authentication required to access the owner dashboard. Please log in.'
                });
            }

            // 2. Fetch User-Specific Data
            // Delegates to the StaffService, awaiting the asynchronous result.
            const staff = await staffService.getStaffByUsername(username);

            if (!staff) {
                // If staff details are not found for the authenticated username, respond with 404 Not Found.
                // Renders a generic 'error' view.
                return res.status(404).render('error', {
                    title: 'Staff Not Found',
                    message: `Staff details for user '${username}' could not be found. Please contact support.`
                });
            }

            // 3. Fetch Aggregate Data
            // Delegates to CustomerService and InventoryService, awaiting their asynchronous results.
            const customerCount = await customerService.getCustomerCount();
            const inventoryCount = await inventoryService.getInventoryCount();

            // 4. Prepare Data for Presentation and Select View
            // The data object passed to `res.render()` serves the same purpose as Spring's `ModelMap`.
            // The string 'owner/owner' is the logical view name. Your Express view engine (e.g., EJS, Pug, Handlebars)
            // will resolve this to a physical template file (e.g., `views/owner/owner.ejs`).
            res.render('owner/owner', {
                title: 'Owner Dashboard', // A common practice to pass a page title to the view
                staff: staff,
                customers: customerCount,
                inventory: inventoryCount
            });

        } catch (error) {
            // 5. Error Handling
            // Log the error for debugging and operational monitoring.
            console.error(`Error processing /owner request for user '${req.user ? req.user.username : 'N/A'}':`, error);
            // Pass the error to Express's global error handling middleware.
            // This ensures that unexpected errors are caught and handled gracefully,
            // preventing the application from crashing and providing a consistent error response.
            next(error);
        }
    });

    return router;
};

/*
 * To use this controller in a complete Node.js/Express application:
 *
 * 1.  **Create Service Modules:**
 *     You would have `services/staffService.js`, `services/customerService.js`, and `services/inventoryService.js`
 *     Each service would export functions (e.g., `getStaffByUsername`, `getCustomerCount`) that perform
 *     asynchronous operations (e.g., database queries, API calls) and return Promises.
 *
 *     Example `services/staffService.js`:
 *