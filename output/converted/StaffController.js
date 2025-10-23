Here's the Node.js/JavaScript equivalent of the Java Spring `StaffController`, adhering to your requirements.

This solution assumes a typical Express.js project structure where services are in a `services` directory and controllers in a `controllers` directory. It also assumes that an authentication middleware (e.g., using Passport.js or JWT) has already run and populated `req.user` with the authenticated user's details.

---

### File: `services/staffService.js` (Stub)

```javascript
/**
 * @module StaffService
 * @description Provides business logic for staff-related operations.
 * In a real application, this would interact with a database or another data source.
 */

/**
 * Retrieves staff details by username.
 * @async
 * @function getStaffByUsername
 * @param {string} username - The username of the staff member.
 * @returns {Promise<object|null>} A promise that resolves to the staff object or null if not found.
 * @throws {Error} If there's an issue fetching staff data.
 */
async function getStaffByUsername(username) {
    // Simulate an asynchronous database call
    return new Promise(resolve => {
        setTimeout(() => {
            if (username === 'ownerUser') {
                resolve({
                    id: 1,
                    username: 'ownerUser',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    role: 'Owner'
                });
            } else {
                resolve(null); // Staff not found
            }
        }, 100); // Simulate network/DB delay
    });
}

module.exports = {
    getStaffByUsername
};
```

### File: `services/customerService.js` (Stub)

```javascript
/**
 * @module CustomerService
 * @description Provides business logic for customer-related operations.
 * In a real application, this would interact with a database or another data source.
 */

/**
 * Retrieves the total count of customers.
 * @async
 * @function getCustomerCount
 * @returns {Promise<number>} A promise that resolves to the total number of customers.
 * @throws {Error} If there's an issue fetching customer count.
 */
async function getCustomerCount() {
    // Simulate an asynchronous database call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(12345); // Example customer count
        }, 50); // Simulate network/DB delay
    });
}

module.exports = {
    getCustomerCount
};
```

### File: `services/inventoryService.js` (Stub)

```javascript
/**
 * @module InventoryService
 * @description Provides business logic for inventory-related operations.
 * In a real application, this would interact with a database or another data source.
 */

/**
 * Retrieves the total count of inventory items.
 * @async
 * @function getInventoryCount
 * @returns {Promise<number>} A promise that resolves to the total number of inventory items.
 * @throws {Error} If there's an issue fetching inventory count.
 */
async function getInventoryCount() {
    // Simulate an asynchronous database call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(54321); // Example inventory count
        }, 75); // Simulate network/DB delay
    });
}

module.exports = {
    getInventoryCount
};
```

---

### File: `controllers/staffController.js`

```javascript
/**
 * @module StaffController
 * @description Handles web requests related to staff and provides an overview for an "owner" role.
 * This controller acts as an intermediary, delegating data fetching to dedicated service layers
 * and preparing data for the view.
 */

const express = require('express');
const router = express.Router();

// Import service dependencies
const staffService = require('../services/staffService');
const customerService = require('../services/customerService');
const inventoryService = require('../services/inventoryService');

/**
 * Handles HTTP GET requests to the `/owner` endpoint.
 * This method retrieves the currently authenticated user's staff details,
 * total customer count, and total inventory count, then renders the owner dashboard view.
 *
 * @async
 * @function getOwnerDashboard
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>} A promise that resolves when the response is sent or an error is passed to next.
 */
router.get('/owner', async (req, res, next) => {
    try {
        // 1. User Context Management: Retrieve the currently authenticated user's username.
        //    Assumes an authentication middleware has populated `req.user`.
        if (!req.user || !req.user.username) {
            // If user is not authenticated or username is missing, send 401 Unauthorized.
            // In a real app, you might redirect to a login page: res.redirect('/login');
            const error = new Error('Unauthorized: User not authenticated or username missing.');
            error.statusCode = 401;
            return next(error);
        }

        const username = req.user.username; // Equivalent to request.getRemoteUser() in Spring

        // 2. Orchestrate Data Retrieval: Delegate to service layers.
        //    Using Promise.all for concurrent fetching to improve performance.
        const [staff, customerCount, inventoryCount] = await Promise.all([
            staffService.getStaffByUsername(username),
            customerService.getCustomerCount(),
            inventoryService.getInventoryCount()
        ]);

        // Handle case where staff might not be found for the authenticated user
        if (!staff) {
            const error = new Error(`Staff details not found for username: ${username}`);
            error.statusCode = 404; // Not Found
            return next(error);
        }

        // 3. Prepare Data for View: Populate an object to pass to the view.
        const modelData = {
            staff: staff,
            customers: customerCount,
            inventory: inventoryCount,
            pageTitle: 'Owner Dashboard' // Optional: Add a page title
        };

        // 4. Select View: Render the appropriate template.
        //    Assumes a view engine (e.g., EJS, Pug, Handlebars) is configured in your Express app.
        //    The path 'owner/owner' typically maps to a file like `views/owner/owner.ejs`
        //    or `views/owner/owner.pug` depending on your view engine setup.
        res.render('owner/owner', modelData);

    } catch (error) {
        // 5. Error Handling: Catch any errors during data retrieval or processing
        //    and pass them to the Express error handling middleware.
        console.error(`Error in StaffController.getOwnerDashboard: ${error.message}`, error.stack);
        next(error); // Pass the error to the next middleware (error handler)
    }
});

module.exports = router;
```

---

### Example `app.js` (for context, not part of the required output)

To make the `StaffController` work, you would integrate it into your main Express application like this:

```javascript
// app.js (Example main application file)
const express = require('express');
const app = express();
const path = require('path');

// Import the StaffController router
const staffController = require('./controllers/staffController');

// --- Middleware Setup ---

// Example: Body parser middleware (if you had POST requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example: Static files
app.use(express.static(path.join(__dirname, 'public')));

// Example: View engine setup (e.g., EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // Or 'pug', 'hbs', etc.

// Example: Authentication Middleware (Crucial for req.user)
// This is a placeholder. In a real app, you'd use Passport.js, JWT, etc.
app.use((req, res, next) => {
    // Simulate a logged-in user
    req.user = {
        id: 1,
        username: 'ownerUser', // This username will be used by StaffController
        email: 'test@example.com'
    };
    // If no user is logged in, you might set req.user = null;
    next();
});

// --- Route Setup ---

// Mount the StaffController router
app.use('/', staffController); // All routes defined in staffController will be prefixed with '/'

// --- Error Handling Middleware ---
// This should be the last middleware added
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Render an error page or send a JSON response
    if (req.accepts('html')) {
        res.status(statusCode).render('error', { message: message, error: err });
    } else if (req.accepts('json')) {
        res.status(statusCode).json({ error: message });
    } else {
        res.status(statusCode).send(message);
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access owner dashboard at http://localhost:${PORT}/owner`);
});

// Example `views/owner/owner.ejs` file:
// <h1>Welcome, <%= staff.firstName %> <%= staff.lastName %>!</h1>
// <p>Your Role: <%= staff.role %></p>
// <p>Total Customers: <%= customers %></p>
// <p>Total Inventory Items: <%= inventory %></p>

// Example `views/error.ejs` file:
// <h1>Error: <%= message %></h1>
// <pre><%= error.stack %></pre>
```