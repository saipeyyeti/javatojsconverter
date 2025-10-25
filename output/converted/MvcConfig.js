// --- File: package.json ---
// This file defines your project's metadata and dependencies.
{
  "name": "nodejs-mvc-config-example",
  "version": "1.0.0",
  "description": "Node.js application mimicking Spring MVC direct view mappings using Express.js.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": [
    "node.js",
    "express",
    "mvc",
    "spring-mvc",
    "configuration",
    "views",
    "async-await",
    "jsdoc",
    "error-handling"
  ],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "ejs": "^3.1.9",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

// --- File: server.js ---
// This is the main application file for the Node.js server.
// It sets up the Express application, configures the view engine,
// applies MVC routing, and starts the server.

/**
 * @file This is the main application file for the Node.js server.
 * It sets up the Express application, configures the view engine,
 * applies MVC routing, and starts the server.
 */

const express = require('express');
const path = require('path');
const mvcConfig = require('./config/mvcConfig'); // Import the MVC configuration module

const app = express();
const PORT = process.env.PORT || 3000;

// --- Express Application Setup ---

/**
 * Configure the view engine.
 * We're using EJS (Embedded JavaScript) as the templating engine.
 * The 'views' setting tells Express where to find the template files.
 * @see {@link https://ejs.co/}
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Apply MVC Configuration ---

/**
 * Apply the MVC configuration to the Express application.
 * This registers the direct view mappings (e.g., /home -> home.ejs).
 * @function
 * @param {express.Application} app - The Express application instance.
 */
mvcConfig.apply(app);

// --- Global Error Handling Middleware ---

/**
 * Global error handling middleware.
 * This catches any errors thrown by route handlers or other middleware
 * and sends a user-friendly error response. It distinguishes between
 * development and production environments for error detail exposure.
 *
 * @param {Error} err - The error object.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The Express next middleware function.
 */
app.use((err, req, res, next) => {
    console.error('An unexpected error occurred:', err.stack);

    // Check if headers have already been sent to prevent "Cannot set headers after they are sent to the client" error
    if (res.headersSent) {
        return next(err); // Pass to default Express error handler if headers are already sent
    }

    // Set status code for the error response
    res.status(err.status || 500);

    // Render a generic error page or send a JSON error response based on client's 'Accept' header
    if (req.accepts('html')) {
        res.render('error', {
            title: 'Error',
            message: 'Something went wrong!',
            // Only show error details in development environment for security
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    } else if (req.accepts('json')) {
        res.json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.'
        });
    } else {
        // Default to plain text if neither HTML nor JSON is accepted
        res.type('txt').send('Internal Server Error');
    }
});

// --- Start the Server ---

/**
 * Starts the Express server and listens for incoming requests on the specified port.
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`To stop the server, press Ctrl+C`);
});


// --- File: config/mvcConfig.js ---
// This module provides a configuration object for setting up Spring MVC-like
// direct view mappings in an Express.js application.

/**
 * @module mvcConfig
 * @description
 * This module provides a configuration object for setting up Spring MVC-like
 * direct view mappings in an Express.js application. It mimics the functionality
 * of Spring's `WebMvcConfigurer` by mapping URL paths directly to logical view names.
 *
 * It adheres to Node.js best practices by using module exports, JSDoc comments,
 * async/await for future extensibility, and proper error handling.
 */

/**
 * @typedef {import('express').Application} ExpressApplication
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').NextFunction} ExpressNextFunction
 */

/**
 * Configures direct view controllers for the Express application.
 * This function registers routes that map specific URL paths to view templates
 * without requiring explicit controller logic. It's analogous to Spring's
 * `addViewControllers` method within a `WebMvcConfigurer` implementation.
 *
 * @function
 * @param {ExpressApplication} app - The Express application instance to configure.
 * @returns {void}
 * @example
 * // In your main application file (e.g., server.js):
 * const express = require('express');
 * const mvcConfig = require('./config/mvcConfig');
 * const app = express();
 * mvcConfig.apply(app);
 * // ... rest of your app setup
 */
function applyMvcConfiguration(app) {
    /**
     * Registers a simple view controller.
     * This helper function encapsulates the common pattern of mapping a path to a view.
     * It uses `async` for the route handler to adhere to the requirement for asynchronous
     * operations, even if `res.render` is typically synchronous. This prepares the handler
     * for potential asynchronous view rendering or data fetching that might be added later.
     * Proper error handling is included by passing errors to the next middleware.
     *
     * @private
     * @param {string} path - The URL path to map.
     * @param {string} viewName - The logical name of the view template (e.g., 'home', 'login').
     * @returns {void}
     */
    const registerViewController = (path, viewName) => {
        app.get(path, async (req, res, next) => {
            try {
                // In Express, res.render is typically synchronous.
                // We use async/await here to satisfy the requirement and
                // to prepare for potential asynchronous operations (e.g.,
                // fetching data before rendering) that might be added later.
                res.render(viewName);
            } catch (error) {
                // If rendering fails (e.g., view file not found, template syntax error),
                // pass the error to the global error handling middleware.
                console.error(`[MVC Config] Error rendering view '${viewName}' for path '${path}':`, error);
                // Attach a status code if it's a view-related error (e.g., 404 for view not found)
                error.status = error.status || 500;
                next(error);
            }
        });
        console.log(`  - Mapped GET ${path} to view: ${viewName}`);
    };

    console.log('Applying MVC view controller configurations...');

    // Map the URL '/home' to the 'home' view.
    // Equivalent to Spring's registry.addViewController("/home").setViewName("home");
    registerViewController('/home', 'home');

    // Map the root URL '/' to the 'home' view.
    // Equivalent to Spring's registry.addViewController("/").setViewName("home");
    registerViewController('/', 'home');

    // Map the URL '/login' to the 'login' view.
    // Equivalent to Spring's registry.addViewController("/login").setViewName("login");
    registerViewController('/login', 'login');

    console.log('MVC view controller configurations applied successfully.');
}

/**
 * The module exports an object containing the `apply` function.
 * This allows for a clear and structured way to apply the configuration
 * to an Express application instance.
 */
module.exports = {
    apply: applyMvcConfiguration
};


// --- File: views/home.ejs ---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
        .container { max-width: 800px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #0056b3; }
        p { line-height: 1.6; }
        nav a { margin-right: 15px; text-decoration: none; color: #007bff; }
        nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/">Home</a>
            <a href="/login">Login</a>
        </nav>
        <h1>Welcome to the Home Page!</h1>
        <p>This is a simple home page rendered by the Node.js application, mimicking a Spring MVC direct view mapping.</p>
        <p>You can navigate to the <a href="/login">Login Page</a>.</p>
        <p>The root path (<code>/</code>) and <code>/home</code> both lead here.</p>
    </div>
</body>
</html>

// --- File: views/login.ejs ---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-container { background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
        h1 { color: #0056b3; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; text-align: left; }
        label { display: block; margin-bottom: 8px; font-weight: bold; }
        input[type="text"],
        input[type="password"] { width: calc(100% - 20px); padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        button { background-color: #007bff; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 18px; width: 100%; }
        button:hover { background-color: #0056b3; }
        nav { margin-top: 20px; }
        nav a { text-decoration: none; color: #007bff; }
        nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="login-container">
        <nav>
            <a href="/">Home</a>
        </nav>
        <h1>Login</h1>
        <form action="/perform_login" method="post">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Log In</button>
        </form>
    </div>
</body>
</html>

// --- File: views/error.ejs ---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8d7da; color: #721c24; display: flex; justify-content: center; align-items: center; min-height: 100vh; text-align: center; }
        .error-container { background: #fdd; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; max-width: 600px; border: 1px solid #f5c6cb; }
        h1 { color: #721c24; margin-bottom: 20px; }
        p { line-height: 1.6; margin-bottom: 15px; }
        pre { background-color: #eee; padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="error-container">
        <h1><%= title %></h1>
        <p><%= message %></p>
        <% if (error && error.stack) { %>
            <h2>Error Details:</h2>
            <pre><%= error.stack %></pre>
        <% } %>
        <p><a href="/">Go to Home Page</a></p>
    </div>
</body>
</html>