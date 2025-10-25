```javascript
// app.js
/**
 * @file app.js
 * @description The main entry point for the Node.js Sakila Project Application.
 *              This file initiates the application startup process by calling the
 *              orchestrator function from the utility framework.
 *              It serves the same purpose as the `main` method in the original
 *              Java `SakilaProjectApplication` class.
 */

import { startApplication } from './utils/appStarter.js';

/**
 * Immediately invoked function expression (IIFE) to start the application.
 * This pattern ensures that the application startup logic is executed as soon as
 * the script runs, similar to how `public static void main` is invoked by the JVM.
 */
(async () => {
    await startApplication();
})();
```

```javascript
// utils/appStarter.js
/**
 * @module AppStarter
 * @description Provides the core functionality to bootstrap and run the Node.js application.
 *              This module acts as the central orchestrator, mimicking the responsibilities
 *              of `SpringApplication.run()` in Spring Boot by initializing configuration,
 *              database connections, web server, and component registration.
 */

import { loadConfig } from './configLoader.js';
import { connectDatabase, disconnectDatabase } from './databaseConnector.js';
import { createWebServer, startWebServer } from './webServer.js';
import { registerRoutes } from './routeRegistry.js';
import { setupGracefulShutdown } from './shutdownHandler.js';
import { initializeLogger } from './logger.js';

/**
 * The main function to start the Node.js application.
 * This function orchestrates the initialization of configuration, database, web server,
 * component registration, and graceful shutdown, acting as the application's entry point.
 * It leverages async/await for sequential and error-handled execution of startup tasks.
 *
 * @async
 * @function startApplication
 * @returns {Promise<void>} A promise that resolves when the application has started successfully.
 * @throws {Error} If any critical step during application startup fails, the process will exit.
 */
export async function startApplication() {
    // Initialize a basic logger early for consistent output
    const logger = initializeLogger();
    logger.info('🚀 Starting Node.js Sakila Project Application...');

    let server = null;
    let dbClient = null;

    try {
        // 1. Initialize Configuration (mimics @Configuration and part of @EnableAutoConfiguration)
        /** @type {import('./configLoader').AppConfig} */
        const config = loadConfig();
        logger.info('✅ Configuration loaded.');

        // 2. Setup Database (mimics auto-configuration for database based on config)
        if (config.database && config.database.enabled) {
            dbClient = await connectDatabase(config.database);
            logger.info('✅ Database connected successfully.');
        } else {
            logger.warn('⚠️ Database connection skipped: not enabled in configuration.');
        }

        // 3. Setup Web Server (mimics embedded server and web-related auto-configuration)
        const app = createWebServer();
        logger.info('✅ Web server initialized.');

        // 4. Register Components/Routes (mimics @ComponentScan for web components)
        // This step dynamically loads and registers API routes. In a more complex app,
        // this would also involve loading services, controllers, and setting up DI.
        registerRoutes(app, dbClient, logger); // Pass dbClient and logger if routes/controllers need them
        logger.info('✅ API routes registered.');

        // 5. Start Web Server
        server = await startWebServer(app, config.server.port);
        logger.info(`✅ Web server listening on port ${config.server.port}.`);

        // 6. Setup Graceful Shutdown
        setupGracefulShutdown(server, dbClient, logger);
        logger.info('✅ Graceful shutdown configured.');

        logger.info('🎉 Node.js Sakila Project Application started successfully!');
    } catch (error) {
        logger.error('❌ Failed to start application:', error.message);
        logger.error(error.stack);

        // Attempt to clean up resources before exiting
        if (server) {
            logger.warn('Attempting to close web server due to startup failure...');
            await new Promise(resolve => server.close(resolve)).catch(e => logger.error('Error closing server during failure:', e.message));
        }
        if (dbClient) {
            logger.warn('Attempting to disconnect database due to startup failure...');
            await disconnectDatabase(dbClient).catch(e => logger.error('Error disconnecting database during failure:', e.message));
        }

        process.exit(1); // Exit with a failure code
    }
}
```

```javascript
// utils/configLoader.js
/**
 * @module ConfigLoader
 * @description Handles loading and providing application configuration.
 *              It loads environment variables and merges them with default settings,
 *              mimicking the configuration capabilities of Spring Boot.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * @typedef {object} DatabaseConfig
 * @property {boolean} enabled - Whether the database connection is enabled.
 * @property {string} host - The database host.
 * @property {number} port - The database port.
 * @property {string} user - The database user.
 * @property {string} password - The database password.
 * @property {string} database - The database name.
 * @property {number} connectionTimeoutMillis - The database connection timeout in milliseconds.
 */

/**
 * @typedef {object} ServerConfig
 * @property {number} port - The port on which the web server will listen.
 */

/**
 * @typedef {object} AppConfig
 * @property {ServerConfig} server - Configuration for the web server.
 * @property {DatabaseConfig} database - Configuration for the database connection.
 * @property {string} env - The current application environment (e.g., 'development', 'production').
 */

/**
 * Loads and returns the application configuration.
 * It prioritizes environment variables over default values.
 *
 * @function loadConfig
 * @returns {AppConfig} The complete application configuration object.
 * @throws {Error} If critical environment variables are missing (e.g., DB credentials when enabled).
 */
export function loadConfig() {
    const config = {
        env: process.env.NODE_ENV || 'development',
        server: {
            port: parseInt(process.env.PORT || '8080', 10),
        },
        database: {
            enabled: process.env.DB_ENABLED === 'true',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: process.env.DB_USER || 'sakila_user',
            password: process.env.DB_PASSWORD || 'sakila_password',
            database: process.env.DB_NAME || 'sakila',
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MILLIS || '5000', 10),
        },
        // Add other configuration sections as needed
    };

    // Basic validation for critical database settings if enabled
    if (config.database.enabled) {
        const requiredDbVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        const missingVars = requiredDbVars.filter(key => !process.env[key]);
        if (missingVars.length > 0) {
            throw new Error(`Missing critical database environment variables: ${missingVars.join(', ')}. Please check your .env file or environment settings.`);
        }
    }

    return config;
}
```

```javascript
// utils/databaseConnector.js
/**
 * @module DatabaseConnector
 * @description Handles establishing and closing the database connection.
 *              This module simulates the auto-configuration of a database
 *              connection in Spring Boot. It uses the 'pg' library for PostgreSQL.
 */

import pg from 'pg';
import { initializeLogger } from './logger.js';

const logger = initializeLogger();

/**
 * Connects to the PostgreSQL database using the provided configuration.
 *
 * @async
 * @function connectDatabase
 * @param {import('./configLoader').DatabaseConfig} dbConfig - The database configuration object.
 * @returns {Promise<pg.Pool>} A promise that resolves with the PostgreSQL connection pool.
 * @throws {Error} If the database connection fails after retries.
 */
export async function connectDatabase(dbConfig) {
    const pool = new pg.Pool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
        max: 10, // Max number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    });

    let retries = 5;
    while (retries > 0) {
        try {
            // Attempt to get a client from the pool to verify connection
            const client = await pool.connect();
            client.release(); // Release the client back to the pool
            logger.info(`Successfully connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
            return pool;
        } catch (error) {
            logger.error(`Failed to connect to database. Retries left: ${retries - 1}. Error: ${error.message}`);
            retries--;
            if (retries === 0) {
                throw new Error(`Exceeded maximum database connection retries. Last error: ${error.message}`);
            }
            await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds before retrying
        }
    }
    // This line should ideally not be reached, but as a fallback
    throw new Error('Failed to connect to database after multiple retries.');
}

/**
 * Disconnects the PostgreSQL database pool.
 *
 * @async
 * @function disconnectDatabase
 * @param {pg.Pool} pool - The PostgreSQL connection pool to disconnect.
 * @returns {Promise<void>} A promise that resolves when the pool has been gracefully shut down.
 * @throws {Error} If an error occurs during pool shutdown.
 */
export async function disconnectDatabase(pool) {
    if (pool) {
        try {
            await pool.end();
            logger.info('Database pool disconnected successfully.');
        } catch (error) {
            logger.error('Error disconnecting database pool:', error.message);
            throw error; // Re-throw to indicate failure
        }
    }
}
```

```javascript
// utils/webServer.js
/**
 * @module WebServer
 * @description Provides utilities for creating and starting an Express.js web server.
 *              This module simulates the embedded web server functionality of Spring Boot.
 */

import express from 'express';
import http from 'http';
import { initializeLogger } from './logger.js';

const logger = initializeLogger();

/**
 * Creates and configures an Express application instance.
 * This includes setting up basic middleware.
 *
 * @function createWebServer
 * @returns {express.Application} The configured Express application instance.
 */
export function createWebServer() {
    const app = express();

    // Basic middleware
    app.use(express.json()); // For parsing application/json
    app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

    // Add a simple health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
    });

    // Global error handling middleware (should be last)
    app.use((err, req, res, next) => {
        logger.error(`Unhandled error: ${err.message}`, err.stack);
        res.status(err.status || 500).json({
            error: {
                message: err.message || 'An unexpected error occurred.',
                code: err.code || 'INTERNAL_SERVER_ERROR',
            },
        });
    });

    return app;
}

/**
 * Starts the Express web server on the specified port.
 *
 * @async
 * @function startWebServer
 * @param {express.Application} app - The Express application instance to start.
 * @param {number} port - The port number on which to listen.
 * @returns {Promise<http.Server>} A promise that resolves with the HTTP server instance once it's listening.
 * @throws {Error} If the server fails to start (e.g., port already in use).
 */
export async function startWebServer(app, port) {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            resolve(server);
        });

        server.on('error', (error) => {
            logger.error(`Web server failed to start on port ${port}: ${error.message}`);
            reject(error);
        });
    });
}
```

```javascript
// utils/routeRegistry.js
/**
 * @module RouteRegistry
 * @description Dynamically registers API routes to the Express application.
 *              This module simulates the component scanning functionality of Spring Boot
 *              for web controllers by loading route definitions from a designated directory.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeLogger } from './logger.js';

const logger = initializeLogger();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dynamically registers all route modules found in the 'routes' directory
 * to the provided Express application instance.
 * Each route module is expected to export a default function that takes
 * the Express app, database client, and logger as arguments to define its routes.
 *
 * @function registerRoutes
 * @param {express.Application} app - The Express application instance.
 * @param {pg.Pool | null} dbClient - The PostgreSQL database client pool (can be null if DB is disabled).
 * @param {object} logger - The application logger instance.
 * @returns {void}
 * @throws {Error} If a route file cannot be imported or its default export is not a function.
 */
export function registerRoutes(app, dbClient, logger) {
    const routesPath = path.join(__dirname, '../routes');

    if (!fs.existsSync(routesPath)) {
        logger.warn(`Routes directory not found at ${routesPath}. No routes will be registered.`);
        return;
    }

    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

    for (const file of routeFiles) {
        const routeFilePath = path.join(routesPath, file);
        try {
            // Dynamic import for ES Modules
            import(routeFilePath)
                .then(module => {
                    if (typeof module.default === 'function') {
                        module.default(app, dbClient, logger);
                        logger.debug(`Registered routes from: ${file}`);
                    } else {
                        logger.warn(`Skipping route file ${file}: Default export is not a function.`);
                    }
                })
                .catch(importError => {
                    logger.error(`Failed to import route file ${file}: ${importError.message}`);
                    throw new Error(`Error importing route file ${file}: ${importError.message}`);
                });
        } catch (error) {
            logger.error(`Error processing route file ${file}: ${error.message}`);
            throw new Error(`Failed to register routes from ${file}: ${error.message}`);
        }
    }
}
```

```javascript
// utils/shutdownHandler.js
/**
 * @module ShutdownHandler
 * @description Provides functionality for gracefully shutting down the application.
 *              This module ensures that resources like the web server and database
 *              connections are properly closed when the application receives termination signals.
 */

import { disconnectDatabase } from './databaseConnector.js';
import { initializeLogger } from './logger.js';

const logger = initializeLogger();

/**
 * Sets up listeners for termination signals (SIGINT, SIGTERM) to perform a graceful shutdown.
 * When a signal is received, it attempts to close the web server and disconnect the database.
 *
 * @function setupGracefulShutdown
 * @param {import('http').Server} server - The HTTP server instance to close.
 * @param {import('pg').Pool | null} dbClient - The PostgreSQL database client pool (can be null).
 * @returns {void}
 */
export function setupGracefulShutdown(server, dbClient) {
    const shutdown = async (signal) => {
        logger.info(`Received ${signal}. Initiating graceful shutdown...`);

        // Close the web server
        if (server) {
            logger.info('Closing HTTP server...');
            await new Promise((resolve) => {
                server.close(() => {
                    logger.info('HTTP server closed.');
                    resolve();
                });
            }).catch(error => logger.error('Error closing HTTP server:', error.message));
        }

        // Disconnect the database
        if (dbClient) {
            logger.info('Disconnecting database...');
            await disconnectDatabase(dbClient).catch(error => logger.error('Error disconnecting database:', error.message));
        }

        logger.info('Application shutdown complete. Exiting process.');
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught exceptions to ensure graceful shutdown attempts
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err.message, err.stack);
        shutdown('uncaughtException').then(() => process.exit(1)); // Exit with failure code
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Optionally, re-throw or exit, depending on application robustness requirements
        // For critical unhandled rejections, it's often safer to exit.
        shutdown('unhandledRejection').then(() => process.exit(1)); // Exit with failure code
    });
}
```

```javascript
// utils/logger.js
/**
 * @module Logger
 * @description Provides a simple, centralized logging utility for the application.
 *              In a production environment, this would typically be replaced by a
 *              more robust logging library like Winston or Pino.
 */

/**
 * A simple logger object that wraps console methods.
 * This allows for easy replacement with a more sophisticated logger later.
 *
 * @typedef {object} AppLogger
 * @property {function(...any): void} info - Logs informational messages.
 * @property {function(...any): void} warn - Logs warning messages.
 * @property {function(...any): void} error - Logs error messages.
 * @property {function(...any): void} debug - Logs debug messages (only in development).
 */

let loggerInstance = null;

/**
 * Initializes and returns a singleton logger instance.
 *
 * @function initializeLogger
 * @returns {AppLogger} The singleton logger instance.
 */
export function initializeLogger() {
    if (loggerInstance) {
        return loggerInstance;
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';

    loggerInstance = {
        info: (...args) => console.log(`[INFO] [${new Date().toISOString()}]`, ...args),
        warn: (...args) => console.warn(`[WARN] [${new Date().toISOString()}]`, ...args),
        error: (...args) => console.error(`[ERROR] [${new Date().toISOString()}]`, ...args),
        debug: (...args) => {
            if (isDevelopment) {
                console.debug(`[DEBUG] [${new Date().toISOString()}]`, ...args);
            }
        },
    };
    return loggerInstance;
}
```

```javascript
// routes/exampleRoute.js
/**
 * @