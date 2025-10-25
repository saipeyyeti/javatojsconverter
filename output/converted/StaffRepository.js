/**
 * @module db.config
 * @description Configures and initializes the Sequelize ORM instance for database connection.
 *              This file should be updated with actual database credentials and settings.
 */

const { Sequelize } = require('sequelize');

// Replace with your actual database connection details
const DB_NAME = process.env.DB_NAME || 'sakila';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql'; // e.g., 'mysql', 'postgres', 'sqlite', 'mssql'

/**
 * Initializes a new Sequelize instance.
 * @type {Sequelize}
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    logging: false, // Set to true to see SQL queries in console
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    // Optional: dialectOptions for specific database configurations
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false // For self-signed certificates, use with caution
    //     }
    // }
});

/**
 * Authenticates the database connection.
 * @async
 * @function authenticateDb
 * @returns {Promise<void>} A promise that resolves if connection is successful, rejects otherwise.
 */
async function authenticateDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error('Failed to connect to the database.');
    }
}

// Export the sequelize instance and the authentication function
module.exports = {
    sequelize,
    authenticateDb
};