To convert the Java Spring MVC Controller to Node.js/JavaScript using Express.js, we'll create a modular application structure.

**File Structure:**

```
sakila-nodejs/
├── app.js
├── package.json
├── routes/
│   └── customerRoutes.js
├── services/
│   ├── customerService.js
│   ├── filmService.js
│   ├── inventoryService.js
│   └── rentalService.js
├── models/
│   ├── entities.js  (Mock data for Customer, Film, Inventory, Rental)
│   └── Order.js     (DTO for combined data)
└── views/
    ├── customer/
    │   └── customer.ejs
    ├── owner/
    │   ├── customerDetails.ejs
    │   └── customers.ejs
    └── error.ejs
```

---

**1. `package.json`**

```json
{
  "name": "sakila-nodejs",
  "version": "1.0.0",
  "description": "Node.js conversion of Sakila Customer Controller",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "ejs": "^3.1.9",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

**2. `app.js` (Main Application File)**

This file sets up the Express application, configures the view engine, and mounts the routes.

```javascript
const express = require('express');
const path = require('path');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up view engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files (e.g., CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Mount the customer routes
// All routes defined in customerRoutes will be accessible directly (e.g., /customer, /owner/customers)
app.use('/', customerRoutes);

/**
 * @route GET /
 * @description Home page route.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @returns {void} Sends a welcome message.
 */
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Sakila Project (Node.js Conversion)!</h1><p>Try navigating to <a href="/customer">/customer</a> or <a href="/owner/customers">/owner/customers</a></p>');
});

/**
 * @middleware 404 Not Found Handler
 * @description Catches any requests that don't match existing routes and sends a 404 response.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {void} Renders the 'error' view with a 404 message.
 */
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page Not Found', error: {} });
});

/**
 * @middleware Global Error Handling
 * @description Catches errors passed from route handlers or other middleware.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {void} Renders the 'error' view with error details.
 */
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).render('error', { message: 'Something went wrong!', error: err });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

**3. `routes/customerRoutes.js` (Controller Logic)**

This file contains the Express router with the converted controller methods.

```javascript
const express = require('express');
const router = express.Router();

// Import services
const customerService = require('../services/customerService');
const rentalService = require('../services/rentalService');
const inventoryService = require('../services/inventoryService');
const filmService = require('../services/filmService');

// Import DTO
const Order = require('../models/Order');

/**
 * @middleware Mock Authentication Middleware
 * @description Simulates `HttpServletRequest.getRemoteUser()` by attaching a mock user email to `req.remoteUser`.
 *              In a production environment, this would be replaced by a robust authentication system
 *              (e.g., Passport.js, JWT middleware) that populates `req.user` or a similar property.
 *              For demonstration, 'mary.smith@example.com' is used for the '/customer' path.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 * @returns {void} Calls the next middleware or route handler.
 */
router.use((req, res, next) => {
    // Simulate a logged-in user for the /customer path
    if (req.path === '/customer') {
        req.remoteUser = 'mary.smith@example.com'; // Mock email for the current user
    }
    // For owner paths, you would typically have role-based authorization checks here.
    // For this conversion, we assume owner access is granted for demonstration.
    next();
});

/**
 * @route GET /customer
 * @description Displays the profile and rental history of the currently logged-in customer.
 *              Corresponds to the `currentUser` method in the Java controller.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {void} Renders the 'customer/customer' view with customer and order data.
 */
router.get('/customer', async (req, res, next) => {
    try {
        // In a real application, req.remoteUser would be populated by an authentication middleware.
        const email = req.remoteUser; // Simulating HttpServletRequest.getRemoteUser()
        if (!email) {
            // If no user is authenticated, redirect to login or show an error
            return res.status(401).render('error', { message: 'Unauthorized: No user logged in.' });
        }

        const customer = await customerService.getCustomerByEmail(email);
        const ordersList = [];

        if (customer) {
            const customersRentals = await rentalService.getRentalsByCustomer(customer.customerId);
            for (const rental of customersRentals) {
                const inventory = await inventoryService.getInventoriesById(rental.inventoryId);
                if (inventory) {
                    const film = await filmService.getFilmByID(inventory.filmId);
                    if (film) {
                        const order = new Order(customer, film, rental);
                        ordersList.push(order);
                    }
                }
            }
        }

        // Render the view, passing data similar to Spring's ModelMap
        res.render('customer/customer', {
            orders: ordersList,
            customer: customer
        });
    } catch (error) {
        console.error('Error in currentUser (GET /customer):', error);
        next(error); // Pass error to the global error handling middleware
    }
});

/**
 * @route GET /owner/customers
 * @description Displays a list of all customers, with optional filtering by first name and/or last name.
 *              This endpoint is intended for an "owner" or administrative role.
 *              Corresponds to the `getCustomers` method in the Java controller.
 * @param {object} req - The Express request object (contains query parameters).