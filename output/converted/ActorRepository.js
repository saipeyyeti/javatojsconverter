// config/database.js
const { Sequelize } = require('sequelize');

/**
 * Initializes and exports the Sequelize instance.
 * Configure your database connection details here.
 *
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
    process.env.DB_NAME || 'sakila',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'mysql', // or 'postgres', 'sqlite', 'mssql'
        port: process.env.DB_PORT || 3306, // Default port for MySQL
        logging: false, // Set to true to see SQL queries in console
        define: {
            timestamps: false, // Sakila database tables typically don't have createdAt/updatedAt
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

/**
 * Authenticates the connection to the database.
 * @async
 * @returns {Promise<void>} A promise that resolves if connection is successful, rejects otherwise.
 */
async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Re-throw to indicate a critical failure
    }
}

module.exports = {
    sequelize,
    connectDatabase
};