To convert the Java `StaffRepository` to Node.js/JavaScript using Sequelize, we'll create a Sequelize model for `Staff` and then a repository module that encapsulates the data access logic.

Here's the complete, production-ready Node.js code:

---

### 1. Sequelize Configuration (e.g., `config/database.js`)

This file sets up your Sequelize instance and database connection.

```javascript
// config/database.js
const { Sequelize, DataTypes } = require('sequelize');

/**
 * Initializes the Sequelize instance for database connection.
 * Replace with your actual database credentials and connection details.
 * @type {Sequelize}
 */
const sequelize = new Sequelize('sakila', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql', // Or 'postgres', 'sqlite', 'mssql'
    logging: false, // Set to true to see SQL queries in console
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

/**
 * Authenticates the database connection and optionally synchronizes models.
 * @async
 * @returns {Promise<void>} A promise that resolves when the database is connected.
 * @throws {Error} If the database connection fails.
 */
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // Uncomment the line below if you want Sequelize to create/alter tables based on models.
        // For existing databases like Sakila, you usually don't need this or use { alter: true }.
        // await sequelize.sync({ alter: true });
        // console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database or synchronize models:', error);
        // In a real application, you might want to handle this more gracefully,
        // but for critical services, exiting is often appropriate.
        process.exit(1);
    }
}

module.exports = {
    sequelize,
    DataTypes,
    initializeDatabase
};
```

### 2. Staff Model Definition (e.g., `models/staff.js`)

This file defines the `Staff` entity as a Sequelize model, mapping it to the `staff` table in your database.

```javascript
// models/staff.js
const { sequelize, DataTypes } = require('../config/database');

/**
 * @typedef {object} Staff
 * @property {number} staff_id - Primary key, auto-increment.
 * @property {string} first_name - Staff's first name.
 * @property {string} last_name - Staff's last name.
 * @property {number} address_id - Foreign key to address table.
 * @property {Buffer|null} [picture] - Staff's picture (binary data).
 * @property {string|null} [email] - Staff's email address.
 * @property {number} store_id - Foreign key to store table.
 * @property {boolean} active - Whether the staff member is active.
 * @property {string} username - Staff's username.
 * @property {string|null} [password] - Staff's password (hashed).
 * @property {Date} last_update - Timestamp of the last update.
 */

/**
 * Defines the Staff model for Sequelize.
 * @type {import('sequelize').ModelCtor<import('sequelize').Model<Staff, Staff>>}
 */
const Staff = sequelize.define('Staff', {
    staff_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    address_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false
        // You can define associations here if you have an Address model:
        // references: { model: 'Address', key: 'address_id' }
    },
    picture: {
        type: DataTypes.BLOB, // Use BLOB for binary data, or STRING for a file path
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    store_id: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false
        // You can define associations here if you have a Store model:
        // references: { model: 'Store', key: 'store_id' }
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    username: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(40), // Adjust length based on your hashing algorithm
        allowNull: true
    },
    last_update: {