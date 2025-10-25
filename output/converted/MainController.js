/**
 * @file This is the main entry point for the Node.js Express application.
 *       It sets up the Express server, configures the view engine,
 *       mounts the main routes, and includes global error handling.
 *       It acts as the "Front Controller" and orchestrator for the application,
 *       similar to Spring's DispatcherServlet.
 */

const express = require('express');
const path = require('path');
const mainRoutes = require('./routes/mainRoutes'); // Import the main router

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * @description
 * Configures the Express application.
 *
 * **View Engine Setup:**
 * - Sets 'views' directory to `path.join(__dirname, 'views')`.
 * - Sets 'view engine' to 'ejs'. (EJS is a common choice, but can be replaced with Pug, Handlebars, etc.)
 *   Ensure your chosen view engine is installed (e.g., `npm install ejs`).
 *
 * **Middleware:**
 * - `express.json()`: Parses incoming requests with JSON payloads.
 * - `express.urlencoded({ extended: true })`: Parses incoming requests with URL-encoded payloads.
 * - `express.static()`: Serves static files (CSS, JS, images) from the 'public' directory.
 *
 * **Routing:**
 * - Mounts `mainRoutes` to the root path (`/`).
 *
 * **Error Handling:**
 * - Defines a global error handling middleware to catch and process errors.
 */

// --- Application Configuration ---

// Set the directory for view templates
app.set('views', path.join(__dirname, 'views'));
// Set the view engine. EJS is used here; install with `npm install ejs`.
app.set('view engine', 'ejs');

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory (e.g., CSS, JavaScript, images)
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
// Mount the mainRoutes router. All routes defined in mainRoutes.js
// will be handled by this application.
app.use('/', mainRoutes);

// --- Error Handling Middleware ---
/**
 * Global error handling middleware.
 * This middleware catches any errors passed via `next(error)` from route handlers
 * or other middleware. It logs the error and renders a generic error page.
 *
 * @param {Error} err - The error object caught from previous middleware or route handlers.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack (not typically called here).
 */
app.use((err, req, res, next) => {
    console.error('An unexpected error occurred:', err.stack); // Log the error stack for debugging
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong on our end!',
        // Provide error details only in development environment for security
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});

module.exports = app; // Export the app instance for testing purposes