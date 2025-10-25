// my-node-app/src/index.js
/**
 * @module index
 * @description This is the main entry point for the Sakila Project Node.js application.
 *              It bootstraps the Express server, loads configuration, and sets up global error handling.
 *              This serves as the Node.js equivalent to the Java Spring Boot `SakilaProjectApplication` class,
 *              fulfilling the role of the application's bootstrap and entry point within the Node.js ecosystem.
 */

const app = require('./app'); // The configured Express application instance
const config = require('./config'); // Application configuration
const logger = require('./utils/logger'); // Logging utility
const { handleUncaughtException, handleUnhandledRejection } = require('./utils/errorHandler');

/**
 * @typedef {object} ServerInfo
 * @property {string} url - The URL where the server is listening.
 * @property {number} port - The port number the server is listening on.
 * @property {string} env - The environment the server is running in.
 */

/**
 * Asynchronously initializes and starts the Node.js application server.
 * This function encapsulates the entire application bootstrap process,
 * including setting up global error handlers and starting the HTTP server.
 *
 * @async
 * @function bootstrapApplication
 * @returns {Promise<ServerInfo>} A promise that resolves with server information once the server is successfully started.
 * @throws {Error} If the server fails to start or encounters a critical error during initialization.
 */
async function bootstrapApplication() {
  // --- Global Process-Level Error Handling ---
  // These handlers catch errors that are not caught by try/catch blocks or promise .catch() methods.
  // It's crucial for preventing the Node.js process from crashing unexpectedly and for logging critical errors.
  process.on('uncaughtException', handleUncaughtException);
  process.on('unhandledRejection', handleUnhandledRejection);

  try {
    const port = config.port;
    const env = config.env;

    // Start the Express server to listen for incoming requests.
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${env} mode.`);
      logger.info(`Access the application at: http://localhost:${port}`);
    });

    // Register a listener for the 'close' event on the server.
    // This is useful for logging when the server gracefully shuts down.
    server.on('close', () => {
      logger.info('Server closed.');
    });

    // Register a listener for 'error' events on the server.
    // This catches errors that occur during the server's operation (e.g., port already in use).
    server.on('error', (error) => {
      logger.error(`Server encountered a critical error: ${error.message}`, error);
      // Re-throw the error to be caught by the outer try-catch block,
      // which will then trigger a process exit.
      throw error;
    });

    // Return information about the started server.
    return {
      url: `http://localhost:${port}`,
      port,
      env,
    };

  } catch (error) {
    // Catch any errors that occur during the synchronous part of bootstrapApplication
    // or re-thrown errors from server.on('error').
    logger.error(`Failed to bootstrap application: ${error.message}`, error);
    // Exit the process with a failure code (1) to indicate an abnormal termination.
    process.exit(1);
  }
}

// --- Application Entry Point Execution ---
// This block ensures that `bootstrapApplication` is called only when this script is executed directly
// (e.g., `node src/index.js`), not when it's imported as a module.
if (require.main === module) {
  bootstrapApplication()
    .then((info) => {
      logger.info('Application successfully started and ready to accept connections.', info);
    })
    .catch((error) => {
      // This catch block handles any promise rejections from `bootstrapApplication`
      // that might not have been caught internally, ensuring a clean exit.
      logger.error('Application failed to start due to an unhandled error during bootstrap.', error);
      process.exit(1);
    });
}

// my-node-app/src/app.js
/**
 * @module app
 * @description Configures and exports the Express application instance.
 *              This file sets up essential middleware, defines application routes,
 *              and integrates global error handling, acting as the core web application setup.
 */

const express = require('express');
const helmet = require('helmet'); // Security middleware for setting various HTTP headers
const cors = require('cors');     // Middleware for enabling Cross-Origin Resource Sharing
const morgan = require('morgan'); // HTTP request logger middleware

const { expressErrorHandler } = require('./utils/errorHandler'); // Custom Express error handler
const logger = require('./utils/logger'); // Custom logging utility

/**
 * Creates and configures the Express application.
 * This function encapsulates all Express-related setup, including middleware and routes.
 *
 * @returns {import('express').Application} The configured Express application instance.
 */
function createApplication() {
  const app = express();

  // --- Essential Middleware Setup ---
  // Helmet helps secure Express apps by setting various HTTP headers.
  app.use(helmet());

  // CORS middleware enables all origins by default.
  // In a production environment, this should be configured to allow specific origins.
  app.use(cors());

  // express.json() parses incoming requests with JSON payloads.
  // It's a built-in middleware function in Express.
  app.use(express.json());

  // Morgan logs HTTP requests. 'combined' is good for production, 'dev' for development.
  // The output is streamed to our custom logger.
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));

  // --- Application Routes ---
  /**
   * @swagger
   * /:
   *   get:
   *     summary: Returns a simple welcome message for the application.
   *     description: This is the root endpoint, providing a basic confirmation that the server is running.
   *     responses:
   *       200:
   *         description: A successful response with a welcome message.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Welcome to the Sakila Project Node.js Application!
   */
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Sakila Project Node.js Application!' });
  });

  /**
   * @swagger
   * /api/status:
   *   get:
   *     summary: Checks the operational status of the API.
   *     description: Returns the current status of the API and its uptime.
   *     responses:
   *       200:
   *         description: API is running successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: running
   *                 uptime:
   *                   type: number
   *                   example: 123.45
   */
  app.get('/api/status', (req, res) => {
    res.json({ status: 'running', uptime: process.uptime() });
  });

  /**
   * @swagger
   * /api/error-test:
   *   get:
   *     summary: Endpoint to simulate an asynchronous error.
   *     description: This route is for testing the application's error handling mechanism.
   *                  It intentionally throws an error after a short delay.
   *     responses:
   *       500:
   *         description: An internal server error occurred due to the simulated error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: error
   *                 message:
   *                   type: string
   *                   example: This is a simulated error from /api/error-test
   */
  app.get('/api/error-test', (req, res, next) => {
    // Simulate an asynchronous error to test error handling.
    setTimeout(() => {
      try {
        throw new Error('This is a simulated error from /api/error-test');
      } catch (error) {
        // Pass the error to the next middleware (our global error handler).
        next(error);
      }
    }, 100); // A small delay to make it asynchronous
  });

  // --- Error Handling Middleware ---
  // This middleware catches requests that don't match any defined routes (404 Not Found).
  app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404; // Custom property to set HTTP status code
    next(error); // Pass the error to the next error-handling middleware
  });

  // This is the global error handling middleware.
  // It must be the last middleware function added to the Express app.
  app.use(expressErrorHandler);

  return app;
}

module.exports = createApplication();


// my-node-app/src/config/index.js
/**
 * @module config
 * @description Centralized configuration management for the application.
 *              Loads environment variables from a `.env` file and provides default values.
 *              This module ensures that application settings are easily accessible and manageable.
 */

// Load environment variables from .env file into process.env.
// This should be called as early as possible in the application's lifecycle.
require('dotenv').config();

/**
 * @typedef {object} AppConfig
 * @property {number} port - The port number on which the server will listen.
 * @property {string} env - The current environment (e.g., 'development', 'production', 'test').
 * @property {string} [databaseUrl] - An example of a database connection URL (not used in this minimal app).
 */

/**
 * Retrieves the application configuration.
 * Environment variables take precedence over default values.
 *
 * @returns {AppConfig} The application configuration object.
 */
function getConfig() {
  return {
    // Parse PORT from environment variables, default to 3000 if not set.
    port: parseInt(process.env.PORT || '3000', 10),
    // Get NODE_ENV from environment variables, default to 'development'.
    env: process.env.NODE_ENV || 'development',
    // Example of another configuration item:
    // databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/sakila_db',
  };
}

// Export the configuration object directly for easy access throughout the application.
module.exports = getConfig();


// my-node-app/src/utils/logger.js
/**
 * @module utils/logger
 * @description A simple, console-based logging utility for the application.
 *              In a real-world production scenario, this would typically integrate
 *              with a more robust logging library like Winston or Pino, which offer
 *              features like log levels, transports (file, remote), and structured logging.
 */

/**
 * Logs an informational message to the console.
 * @param {string} message - The primary message to log.
 * @param {object} [data] - Optional additional data or context to include with the log.
 */
function info(message, data) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? data : '');
}

/**
 * Logs a warning message to the console.
 * @param {string} message - The warning message to log.
 * @param {object} [data] - Optional additional data or context related to the warning.
 */
function warn(message, data) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? data : '');
}

/**
 * Logs an error message to the console.
 * This function is typically used for reporting critical issues or exceptions.
 * @param {string} message - The error message to log.
 * @param {Error|object} [error] - The actual error object or additional data related to the error.
 */
function error(message, error) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
}

/**
 * Logs a debug message to the console.
 * Debug messages are typically verbose and only logged when the application is in 'development' mode.
 * @param {string} message - The debug message to log.
 * @param {object} [data] - Optional additional data or context for debugging.
 */
function debug(message, data) {
  // Only log debug messages if the environment is explicitly set to 'development'.
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? data : '');
  }
}

module.exports = {
  info,
  warn,
  error,
  debug,
};


// my-node-app/src/utils/errorHandler.js
/**
 * @module utils/errorHandler
 * @description Provides comprehensive error handling utilities for the Node.js application.
 *              This includes an Express-specific error handling middleware and global
 *              handlers for uncaught exceptions and unhandled promise rejections.
 */

const logger = require('./logger'); // Import the custom logger utility

/**
 * Express error handling middleware.
 * This middleware should be placed as the very last `app.use()` call in the Express application
 * to catch any errors that occur during request processing.
 *
 * @param {Error} err - The error object passed from previous middleware or route handlers.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function (not typically called here).
 */
function expressErrorHandler(err, req, res, next) {
  // Log the error details using the application's logger.
  logger.error(`Unhandled Express Error: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    // Include original error object for more context if available
    originalError: err,
  });

  // Determine the HTTP status code for the response.
  // Prioritize custom `statusCode` or `status` properties on the error object,
  // otherwise default to 500 (Internal Server Error).
  const statusCode = err.statusCode || err.status || 500;

  // Send a standardized JSON error response to the client.
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred.',
    // In production, avoid sending sensitive details like stack traces to clients.
    // Only include stack trace in development for debugging purposes.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Handles uncaught exceptions in the Node.js process.
 * This catches synchronous errors that were not caught by any `try...catch` block.
 * Such errors indicate a critical flaw in the application, and it's often best
 * to exit the process to prevent it from running in an unstable state.
 *
 * @param {Error} err - The uncaught exception error object.
 * @param {string} origin - A string indicating where the exception originated (e.g., 'uncaughtException').
 */
function handleUncaughtException(err, origin) {
  logger.error(`UNCAUGHT EXCEPTION: ${origin} - ${err.message}`, {
    stack: err.stack,
    details: err,
  });
  // Perform any necessary cleanup (e.g., close database connections, flush logs)
  // before exiting the process. For simplicity, we just log and exit here.
  process.exit(1); // Exit with a failure code
}

/**
 * Handles unhandled promise rejections in the Node.js process.
 * This catches asynchronous errors (promises that reject) that were not caught
 * by a `.catch()` block or `try...catch` in an `async` function.
 * Similar to uncaught exceptions, these often indicate a critical issue.
 *
 * @param {Error} reason - The reason for the unhandled rejection (often an Error object).
 * @param {Promise<any>} promise - The promise that was rejected.
 */
function handleUnhandledRejection(reason, promise) {
  logger.error(`UNHANDLED REJECTION: ${reason.message || reason}`, {
    promise,
    reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // For unhandled rejections, it's also often best to exit the process
  // to avoid potential memory leaks or an inconsistent state.
  process.exit(1); // Exit with a failure code
}

module.exports = {
  expressErrorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
};