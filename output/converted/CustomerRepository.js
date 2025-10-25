Here is the complete Node.js/JavaScript implementation of the `CustomerRepository` using Sequelize ORM, following all specified requirements.

This solution assumes a standard Sakila database schema for the `customer` table.

---

### File Structure:

```
src/
├── config/
│   └── db.config.js
├── models/
│   └── customer.model.js
├── repositories/
│   └── customer.repository.js
└── index.js (Sequelize initialization)
```

---

### 1. `src/config/db.config.js`

This file holds your database connection configuration. **Remember to replace placeholder values with your actual database credentials.**

```javascript
// src/config/db.config.js

/**
 * Database configuration settings.
 * @module dbConfig
 */
module.exports = {
  /** The database host. */
  HOST: "localhost", // e.g., "localhost", "127.0.0.1", or your cloud database host
  /** The database user. */
  USER: "root",      // e.g., "root", "your_db_user"
  /** The database password. */
  PASSWORD: "password", // e.g., "password", "your_db_password"
  /** The database name. */
  DB: "sakila",      // e.g., "sakila", "your_database_name"
  /** The database dialect (e.g., "mysql", "postgres", "sqlite", "mssql"). */
  DIALECT: "mysql",
  /** Sequelize connection pool configuration. */
  pool: {
    /** Maximum number of connections in pool. */
    max: 5,
    /** Minimum number of connections in pool. */
    min: 0,
    /** The maximum time, in milliseconds, that a connection can be idle before being released. */
    acquire: 30000,
    /** The maximum time, in milliseconds, that a connection can be idle before being released. */
    idle: 10000
  }
};
```

---

### 2. `src/models/customer.model.js`

This file defines the Sequelize model for the `Customer` entity, mapping it to the `customer` table in your database.

```javascript
// src/models/customer.model.js
const { DataTypes } = require('sequelize');

/**
 * Defines the Customer model for Sequelize.
 * This model represents the 'customer' table in the database.
 *
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance.
 * @returns {import('sequelize').Model} The Customer model.
 */
module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    customer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'customer_id', // Explicitly map to database column name
      comment: 'Primary key for the customer table.'
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'store_id',
      comment: 'Foreign key to the store table.'
    },
    first_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'first_name',
      comment: 'Customer\'s first name.'
    },
    last_name: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'last_name',
      comment: 'Customer\'s last name.'
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true, // Email can be null in Sakila schema
      unique: true,
      field: 'email',
      comment: 'Customer\'s email address, unique if present.'
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'address_id',
      comment: 'Foreign key to the address table.'
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'active',
      comment: 'Indicates if the customer is active (1) or inactive (0).'
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'create_date',
      comment: 'The date and time the customer record was created.'
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_update',
      comment: 'The date and time the customer record was last updated.'
    }
  }, {
    tableName: 'customer', // Explicitly define table name
    timestamps: false,     // Sakila tables usually don't use Sequelize's default timestamps
    underscored: true,     // Use underscored column names (e.g., customer_id)
    comment: 'Represents a customer in the Sakila database.'
  });

  return Customer;
};
```

---

### 3. `src/index.js`

This file initializes Sequelize and exports the `db` object containing the configured Sequelize instance and models.

```javascript
// src/index.js
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/db.config');

/**
 * Initializes and configures the Sequelize ORM.
 * @module db
 */

// Create a new Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false // Set to true to see SQL queries in the console
});

/**
 * The database object containing the Sequelize instance and models.
 * @property {import('sequelize').Sequelize} Sequelize - The Sequelize constructor.
 * @property {import('sequelize').Sequelize} sequelize - The initialized Sequelize instance.
 * @property {import('sequelize').Model} Customer - The Customer model.
 */
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import and initialize models
db.Customer = require('./models/customer.model')(sequelize);

// Optional: Synchronize all models with the database.
// Use `force: true` to drop existing tables and recreate them (USE WITH CAUTION IN PRODUCTION).
// db.sequelize.sync({ force: false })
//   .then(() => {
//     console.log("Database & tables created/synced successfully!");
//   })
//   .catch(err => {
//     console.error("Error syncing database:", err);
//   });

module.exports = db;
```

---

### 4. `src/repositories/customer.repository.js`

This file contains the `CustomerRepository` class, which implements all the methods from the original Java `CustomerRepository` using Sequelize.

```javascript
// src/repositories/customer.repository.js
const db = require('../index'); // Import the initialized Sequelize instance and models
const Customer = db.Customer;
const { Op } = db.Sequelize; // Import Sequelize operators for advanced queries

/**
 * @typedef {object} CustomerData
 * @property {number} [customer_id] - The unique ID of the customer (primary key).
 * @property {number} store_id - The ID of the store the customer belongs to.
 * @property {string} first_name - The first name of the customer.
 * @property {string} last_name - The last name of the customer.
 * @property {string} [email] - The email address of the customer.
 * @property {number} address_