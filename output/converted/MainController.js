```javascript
/**
 * @file This file defines the main Express.js application, mirroring the functionality
 *       of the Java MainController by handling incoming HTTP GET requests and
 *       rendering corresponding view templates. It uses Express.js for routing,
 *       EJS as the templating engine, and incorporates asynchronous operations,
 *       comprehensive JSDoc comments, and robust error handling.
 * @module app
 */

// Import necessary modules
const express = require('express');
const path = require('path'); // Node.js built-in module for working with file and directory paths

// Create an Express application instance
const app = express();

// Define the port for the server to listen on.
// It first tries to use the PORT environment variable (common in hosting environments),
// otherwise, it defaults to 3000 for local development.
const PORT = process.env.PORT || 3000;

// --- Configuration ---

/**
 * Configures the view engine for the Express application.
 * EJS (Embedded JavaScript) is chosen as the templating engine, which allows for
 * dynamic content rendering within HTML-like templates.
 *
 * @property {string} 'view engine' - Specifies 'ejs' as the templating engine.
 * @property {string} 'views' - Sets the directory where view templates are located.
 *                               `path.join(__dirname, 'views')` ensures a platform-independent
 *                               path to the 'views' folder relative to this script.
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middleware ---

/**
 * Global middleware for logging incoming HTTP requests.
 * This helps in debugging and monitoring server activity.
 *
 * @function
 * @param {object} req - The Express request object, containing details about the incoming request.
 * @param {object} res - The Express response object, used to send responses back to the client.
 * @param {function} next - A callback function to pass control to the next middleware function
 *                          in the stack.
 */
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next(); // Call next to proceed to the next middleware or route handler
});

// --- Routes ---

/**
 * Handles HTTP GET requests to the application's root URL (`/`).
 * This route mirrors the `home()` method in the Java `MainController`.
 * It renders the 'home' view template, typically serving as the application's landing page.
 *
 * @async
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function, used for passing errors.
 * @returns {Promise<void>} A promise that resolves when the view is successfully rendered.
 * @throws {Error} If an error occurs during view rendering or any asynchronous operation.
 */
app.get('/', async (req, res, next) => {
    try {
        // In a more complex application, this is where you might fetch data
        // from a database or an external API using 'await'.
        // Example: const data = await someService.getHomePageData();
        res.render('home', { title: 'Welcome Home' }); // Renders 'views/home.ejs'
    } catch (error) {
        // If any error occurs (e.g., during data fetching or rendering),
        // pass it to the error handling middleware.
        next(error);
    }
});

/**
 * Handles HTTP GET requests to the `/login` URL.
 * This route mirrors the `login()` method in the Java `MainController`.
 * It renders the 'login' view template, typically displaying a login form.
 *
 * @async
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function, used for passing errors.
 * @returns {Promise<void>} A promise that resolves when the view is successfully rendered.
 * @throws {Error} If an error occurs during view rendering or any asynchronous operation.
 */
app.get('/login', async (req, res, next) => {
    try {
        res.render('login', { title: 'User Login' }); // Renders 'views/login.ejs'
    } catch (error) {
        next(error);
    }
});

/**
 * Handles HTTP GET requests to the `/account` URL.
 * This route mirrors the `account()` method in the Java `MainController`.
 * It renders the 'account' view template, intended for a user's account dashboard or profile page.
 *
 * @async
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function, used for passing errors.
 * @returns {Promise<void>} A promise that resolves when the view is successfully rendered.
 * @throws {Error} If an error occurs during view rendering or any asynchronous operation.
 */
app.get('/account', async (req, res, next) => {
    try {
        res.render('account', { title: 'My Account' }); // Renders 'views/account.ejs'
    } catch (error) {
        next(error);
    }
});

// --- Error Handling Middleware ---

/**
 * Middleware to handle 404 Not Found errors.
 * This middleware should be placed after all defined routes. If a request reaches
 * this point, it means no preceding route handler has responded.
 *
 * @function
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function (not typically called here for 404).
 */
app.use((req, res, next) => {
    // Set the status to 404 and render a custom 404 page.
    res.status(404).render('404', {
        title: 'Page Not Found',
        message: `The page you are looking for at "${req.originalUrl}" does not exist.`
    });
});

/**
 * Global error handling middleware.
 * This is the final error handler in the middleware chain. It catches any errors
 * passed via `next(error)` from route handlers or other middleware.
 *
 * @function
 * @param {Error} err - The error object passed from a preceding middleware or route.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function (not typically called here as it's a final handler).
 */
app.use((err, req, res, next) => {
    console.error('An unhandled error occurred:', err.stack); // Log the full error stack for debugging

    // Determine the HTTP status code. Default to 500 (Internal Server Error).
    const statusCode = err.statusCode || 500;

    // Render a generic error page.
    // In development mode, provide more error details; in production, keep it minimal for security.
    res.status(statusCode).render('error', {
        title: 'Error',
        message: 'Something went wrong on our server. Please try again later.',
        // Only expose error details in development environment
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// --- Server Start ---

/**
 * Starts the Express server and listens for incoming HTTP requests on the configured port.
 *
 * @function
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('To stop the server, press Ctrl+C.');
});

// Export the app for testing purposes (optional, but good practice for modularity)
module.exports = app;

/*
To run this application:

1.  **Initialize your project:**
    Create a new directory (e.g., `my-express-app`).
    Navigate into it: `cd my-express-app`
    Initialize npm: `npm init -y`

2.  **Install dependencies:**
    `npm install express ejs`

3.  **Create the main application file:**
    Save the code above as `app.js` (or `server.js`) in your project root.

4.  **Create a `views` directory and template files:**
    Create a folder named `views` in the same directory as `app.js`.
    Inside `views`, create the following files:

    *   **`views/home.ejs`:**
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><%= title %></title>
        </head>
        <body>
            <h1>Welcome to the Home Page!</h1>
            <p>This is the landing page of your application.</p>
            <nav>
                <ul>
                    <li><a href="/login">Login</a></li>
                    <li><a href="/account">Account</a></li>
                </ul>
            </nav>
        </body>
        </html>
        ```

    *   **`views/login.ejs`:**
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><%= title %></title>
        </head>
        <body>
            <h1><%= title %></h1>
            <p>This is the login page.</p>
            <form action="/login" method="POST">
                <label for="username">Username:</label><br>
                <input type="text" id="username" name="username"><br>
                <label for="password">Password:</label><br>
                <input type="password" id="password" name="password"><br><br>
                <button type="submit">Login</button>
            </form>
            <p><a href="/">Back to Home</a></p>
        </body>
        </html>
        ```

    *   **`views/account.ejs`:**
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><%= title %></title>
        </head>
        <body>
            <h1><%= title %></h1>
            <p>Welcome to your account dashboard!</p>
            <p>This page would typically show user-specific information.</p>
            <p><a href="/">Back to Home</a></p>
        </body>
        </html>
        ```

    *   **`views/404.ejs`:**
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><%= title %></title>
        </head>
        <body>
            <h1><%= title %></h1>
            <p><%= message %></p>
            <p><a href="/">Go to Home</a></p>
        </body>
        </html>
        ```

    *   **`views/error.ejs`:**
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><%= title %></title>
        </head>
        <body>
            <h1><%= message %></h1>
            <% if (error.stack) { %>
                <h2>Error Details:</h2>
                <pre><%= error.stack %></pre>
            <% } %>
            <p><a href="/">Go to Home</a></p>
        </body>
        </html>
        ```

5.  **Run the application:**
    `node app.js`

    You should see output like:
    `Server is running on http://localhost:3000`
    `To stop the server, press Ctrl+C.`

6.  **Access in browser:**
    Open your web browser and navigate to:
    *   `http://localhost:3000/` (for the home page)
    *   `http://localhost:3000/login` (for the login page)
    *   `http://localhost:3000/account` (for the account page)
    *   `http://localhost:3000/nonexistent` (to test the 404 error page)
*/
```