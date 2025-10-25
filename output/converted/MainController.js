```javascript
/**
 * @file This is the main entry point for the Node.js Express application.
 * It sets up the Express server, configures middleware, defines routes,
 * and handles global error management.
 */

// Import necessary modules
const express = require('express');
const path = require('path');
const mainRoutes = require('./routes/mainRoutes'); // Import the main routes

// Initialize the Express application
const app = express();

/**
 * @constant {number} PORT - The port number on which the server will listen.
 * Defaults to 3000 if not specified in environment variables.
 */
const PORT = process.env.PORT || 3000;

// --- Middleware Configuration ---

/**
 * Configure the view engine.
 * We'll use EJS (Embedded JavaScript) as the templating engine,
 * similar to how Spring's View Resolver finds templates.
 * Views will be located in the 'views' directory.
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Middleware to parse incoming JSON requests.
 * This is useful for API endpoints, though not strictly needed for this
 * view-serving controller, it's a common best practice.
 */
app.use(express.json());

/**
 * Middleware to parse incoming URL-encoded requests.
 * `extended: true` allows for rich objects and arrays to be encoded into the URL-encoded format.
 * This is useful for handling form submissions.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware to serve static files (e.g., CSS, JavaScript, images).
 * Files in the 'public' directory will be accessible directly.
 * Example: `http://localhost:3000/css/style.css` would serve `public/css/style.css`.
 */
app.use(express.static(path.join(__dirname, 'public')));

// --- Route Handling ---

/**
 * Mount the main routes.
 * All routes defined in `mainRoutes.js` will be prefixed with '/'.
 * In this case, the routes are defined directly as '/', '/login', '/account',
 * so they will be accessible at those paths.
 */
app.use('/', mainRoutes);

// --- Global Error Handling Middleware ---

/**
 * @function globalErrorHandler
 * @description Express error handling middleware. This function catches any errors
 * passed via `next(error)` from route handlers or other middleware.
 * It sends a standardized error response to the client.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack); // Log the error stack for debugging

    // Determine the status code (default to 500 Internal Server Error)
    const statusCode = err.statusCode || 500;

    // Send an error response. For view-serving, we might render an error page.
    // For simplicity, we'll send a JSON response or render a generic error view.
    if (req.accepts('html')) {
        // If the client prefers HTML, render an error page
        res.status(statusCode).render('error', {
            title: 'Error',
            message: err.message || 'Something went wrong!',
            statusCode: statusCode
        });
    } else {
        // Otherwise, send a JSON response
        res.status(statusCode).json({
            status: 'error',
            message: err.message || 'Something went wrong!',
            statusCode: statusCode
        });
    }
});

// --- Server Start ---

/**
 * Start the Express server and listen for incoming requests on the specified port.
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server.');
});

// --- Create a simple 'views/error.ejs' file for the error handler ---
// You would typically have this file in your 'views' directory:
/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; text-align: center; padding: 50px; }
        .container { background-color: #fff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
        h1 { color: #d9534f; }
        p { font-size: 1.1em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Error <%= statusCode %></h1>
        <p><%= message %></p>
        <p>Please try again later or contact support.</p>
        <a href="/">Go to Home</a>
    </div>
</body>
</html>
*/
```

```javascript
/**
 * @file This module defines the main routes for the web application,
 * mirroring the functionality of the Java MainController.
 * It handles requests for the home page, login page, and account page.
 */

const express = require('express');
const router = express.Router();

/**
 * @function homeController
 * @description Handles GET requests to the root URL (`/`).
 * Corresponds to the `home()` method in the Java controller.
 * It renders the 'home' view.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the view is rendered or an error occurs.
 */
router.get('/', async (req, res, next) => {
    try {
        // Simulate a potential asynchronous operation if needed, e.g., fetching data
        // await someAsyncOperation();

        /**
         * Renders the 'home.ejs' view.
         * The `res.render()` method looks for 'home.ejs' in the configured 'views' directory.
         * We can pass an object with data to the view if needed, e.g., `{ title: 'Welcome Home' }`.
         */
        res.render('home', { title: 'Home Page' });
    } catch (error) {
        // If an error occurs, pass it to the global error handling middleware
        console.error('Error rendering home page:', error);
        next(error);
    }
});

/**
 * @function loginController
 * @description Handles GET requests to the `/login` URL.
 * Corresponds to the `login()` method in the Java controller.
 * It renders the 'login' view.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the view is rendered or an error occurs.
 */
router.get('/login', async (req, res, next) => {
    try {
        // Simulate a potential asynchronous operation
        // await someAsyncOperation();

        res.render('login', { title: 'Login Page' });
    } catch (error) {
        console.error('Error rendering login page:', error);
        next(error);
    }
});

/**
 * @function accountController
 * @description Handles GET requests to the `/account` URL.
 * Corresponds to the `account()` method in the Java controller.
 * It renders the 'account' view.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 * @returns {Promise<void>} A promise that resolves when the view is rendered or an error occurs.
 */
router.get('/account', async (req, res, next) => {
    try {
        // Simulate a potential asynchronous operation
        // await someAsyncOperation();

        res.render('account', { title: 'Account Page' });
    } catch (error) {
        console.error('Error rendering account page:', error);
        next(error);
    }
});

/**
 * @module mainRoutes
 * @description Exports the configured Express router for use in the main application file.
 */
module.exports = router;
```

To make this code runnable, you'll need to set up the project structure and create the view files:

**1. Project Structure:**

```
your-express-app/
├── server.js
├── routes/
│   └── mainRoutes.js
└── views/
    ├── home.ejs
    ├── login.ejs
    ├── account.ejs
    └── error.ejs (for global error handling)
```

**2. `package.json` (create this file in `your-express-app/`):**

```json
{
  "name": "your-express-app",
  "version": "1.0.0",
  "description": "A Node.js Express application mirroring a Spring Boot controller.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": [
    "node",
    "express",
    "mvc",
    "controller",
    "ejs"
  ],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "ejs": "^3.1.9",
    "express": "^4.18.2"
  }
}
```

**3. Install Dependencies:**
Navigate to `your-express-app/` in your terminal and run:
`npm install`

**4. Create View Files (e.g., `views/home.ejs`):**

**`views/home.ejs`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <link rel="stylesheet" href="/css/style.css"> <!-- Example for static file -->
</head>
<body>
    <h1>Welcome to the Home Page!</h1>
    <p>This is the content for the home view.</p>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/login">Login</a></li>
        <li><a href="/account">Account</a></li>
    </ul>
</body>
</html>
```

**`views/login.ejs`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
</head>
<body>
    <h1>Login Page</h1>
    <p>Please enter your credentials.</p>
    <form action="/login" method="POST">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"><br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password"><br><br>
        <button type="submit">Login</button>
    </form>
    <p><a href="/">Go to Home</a></p>
</body>
</html>
```

**`views/account.ejs`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
</head>
<body>
    <h1>Account Details</h1>
    <p>This is your personal account information.</p>
    <p>Welcome, User!</p>
    <p><a href="/">Go to Home</a></p>
</body>
</html>
```

**`views/error.ejs`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; text-align: center; padding: 50px; }
        .container { background-color: #fff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
        h1 { color: #d9534f; }
        p { font-size: 1.1em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Error <%= statusCode %></h1>
        <p><%= message %></p>
        <p>Please try again later or contact support.</p>
        <a href="/">Go to Home</a>
    </div>
</body>
</html>
```

**5. Run the Application:**
In your terminal, from the `your-express-app/` directory:
`npm start`

Now, you can access `http://localhost:3000/`, `http://localhost:3000/login`, and `http://localhost:3000/account` in your web browser.