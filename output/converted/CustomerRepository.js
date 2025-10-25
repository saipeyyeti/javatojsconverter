/**
 * @file db.js
 * @description Initializes the Sequelize ORM and establishes a connection to the database.
 */

const { Sequelize, DataTypes } = require('sequelize');

/**
 * Sequelize instance configuration.
 * Replace 'sakila', 'root', 'password', 'localhost' with your actual database credentials.
 */
const sequelize = new Sequelize('sakila', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql', // Specify your database dialect (e.g., 'mysql', 'postgres', 'sqlite', 'mssql')
  logging: false, // Set to true to see SQL queries in the console
  pool: {
    max: 5,
    min: 0,
    acquire: 30000, // The maximum time, in milliseconds, that pool will try to get a connection before throwing error
    idle: 10000    // The maximum time, in milliseconds, that a connection can be idle in the pool before being released
  }
});

/**
 * Authenticates the connection to the database.
 * @returns {Promise<void>} A promise that resolves if the connection is successful, rejects otherwise.
 * @throws {Error} If unable to connect to the database.
 */
async function connectDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

module.exports = {
  sequelize,
  DataTypes,
  connectDb
};