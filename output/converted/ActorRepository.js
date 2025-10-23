Here's the complete, production-ready Node.js code for the `ActorRepository` using Sequelize ORM, including the necessary `Actor` model definition and a basic database configuration.

---

First, ensure you have Sequelize and a database driver installed:
`npm install sequelize mysql2` (or `pg`, `sqlite3`, etc., depending on your database)

---

### File Structure:

```
src/
├── config/
│   └── database.js
├── models/
│   └── Actor.js
└── repositories/
    └── ActorRepository.js
```

---

### 1. `src/config/database.js`

This file sets up the Sequelize instance and handles the database connection.

```javascript
// src/config/database.js
const { Sequelize } = require('sequelize');

/**
 * Initializes and configures the Sequelize ORM instance.
 * Replace 'sakila', 'root', 'password', and 'localhost' with your actual database credentials.
 * @type {Sequelize}
 */
const sequelize = new Sequelize('sakila', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql', // e.g., 'mysql', 'postgres', 'sqlite', 'mssql'
    logging: false, // Set to true to see SQL queries in the console
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
    //         rejectUnauthorized: false // For self-signed certificates
    //     }
    // }
});

/**
 * Establishes and tests the database connection.
 * @returns {Promise<void>} A promise that resolves if the connection is successful,
 *                          or rejects if an error occurs.
 */
async function connectDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // Optional: Synchronize all models with the database.
        // Use { alter: true } to make safe changes, { force: true } to drop and re-create tables (DANGER: data loss).
        // await sequelize.sync({ alter: true });
        // console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // In a production environment, you might want to throw the error
        // or handle it more gracefully than exiting the process.
        process.exit(1); // Exit the process if database connection fails
    }
}

module.exports = {
    sequelize,
    connectDb
};
```

---

### 2. `src/models/Actor.js`

This file defines the `Actor` model, mapping it to the `actor` table in the database.

```javascript
// src/models/Actor.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @typedef {object} Actor
 * @property {number} actorId - The unique identifier for the actor (primary key).
 * @property {string} firstName - The first name of the actor.
 * @property {string} lastName - The last name of the actor.
 * @property {Date} lastUpdate - The timestamp of the last update.
 */

/**
 * Defines the Actor model for Sequelize.
 * This model corresponds to the 'actor' table in the database.
 * @type {import('sequelize').ModelCtor<import('sequelize').Model<Actor, Partial<Actor>>>}
 */
const Actor = sequelize.define('Actor', {
    actorId: {
        type: DataTypes.SMALLINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field: 'actor_id', // Maps to the 'actor_id' column in the database
        comment: 'Primary key for the actor table.'
    },
    firstName: {
        type: DataTypes.STRING(45),
        allowNull: false,
        field: 'first_name', // Maps to the 'first_name' column
        comment: 'First name of the actor.'
    },
    lastName: {
        type: DataTypes.STRING(45),
        allowNull: false,
        field: 'last_name', // Maps to the 'last_name' column
        comment: 'Last name of the actor.'
    },
    lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Sets default value to current timestamp
        field: 'last_update', // Maps to the 'last_update' column
        comment: 'Timestamp of the last update to the actor record.'
    }
}, {
    tableName: 'actor', // Explicitly sets the table name to 'actor'
    timestamps: false, // Disables Sequelize's default createdAt and updatedAt columns
    // If you want Sequelize to manage 'last_update' as its 'updatedAt' timestamp:
    // timestamps: true,
    // updatedAt: 'last_update',
    // createdAt: false, // Assuming no 'createdAt' column in the original schema
    comment: 'Table containing information about film actors.'
});

module.exports = Actor;
```

---

### 3. `src/repositories/ActorRepository.js`

This file contains the `ActorRepository` class, implementing all the required data access methods.

```javascript
// src/repositories/ActorRepository.js
const Actor = require('../models/Actor');
const { Op } = require('sequelize'); // For advanced query operators if needed

/**
 * @typedef {object} Actor
 * @property {number} actorId - The unique identifier for the actor.
 * @property {string} firstName - The first name of the actor.
 * @property {string} lastName - The last name of the actor.
 * @property {Date} lastUpdate - The timestamp of the last update.
 */

/**
 * @class ActorRepository
 * @description A Data Access Object (DAO) for the Actor entity.
 *              This class provides an abstract layer for interacting with the persistence layer
 *              (database) for `Actor` entities using Sequelize ORM. It encapsulates
 *              standard CRUD operations and custom query methods, mirroring the functionality
 *              of a Spring Data JPA `JpaRepository`.
 */
class ActorRepository {

    /**
     * Persists a new Actor entity or updates an existing one.
     * If `actorData.actorId` is provided and corresponds to an existing record,
     * the record will be updated. Otherwise, a new Actor record will be created.
     * @param {Partial<Actor>} actorData - The actor data to save.
     * @returns {Promise<Actor>} The saved or updated Actor entity.
     * @throws {Error} If there's a database error during the operation or if the update fails.
     */
    async save(actorData) {
        try {
            if (actorData.actorId) {
                // Attempt to update an existing actor
                const [updatedRowsCount] = await Actor.update(actorData, {
                    where: { actorId: actorData.actorId }
                });

                if (updatedRowsCount > 0) {
                    // If updated, retrieve and return the updated actor
                    return await Actor.findByPk(actorData.actorId);
                } else {
                    // If actorId was provided but no rows were updated, it means the actorId didn't exist.
                    // Spring Data JPA's save() would typically create a new record in this scenario
                    // if the ID is not auto-generated. For auto-generated IDs, it would usually
                    // throw an error or ignore the provided ID for creation.
                    // Here, we'll treat it as an update failure if the ID doesn't exist.
                    // If you want to mimic Spring's "create if not found" for provided IDs,
                    // you would need to implement a findOrCreate logic or separate create/update.
                    throw new Error(`Actor with ID ${actorData.actorId} not found for update.`);
                }
            } else {
                // Create a new actor if no actorId is provided
                const newActor = await Actor.create(actorData);
                return newActor;
            }
        } catch (error) {
            console.error(`[ActorRepository] Error saving actor: ${error.message}`);
            throw new Error(`Failed to save actor: ${error.message}`);
        }
    }

    /**
     * Retrieves an Actor entity by its primary key (actorId).
     * @param {number} id - The unique identifier of the actor.
     * @returns {Promise<Actor | null>} The Actor entity if found, otherwise `null`.
     * @throws {Error} If there's a database error during the operation.
     */
    async findById(id) {
        try {
            return await Actor.findByPk(id);
        } catch (error) {
            console.error(`[ActorRepository] Error finding actor by ID ${id}: ${error.message}`);
            throw new Error(`Failed to find actor by ID: ${error.message}`);
        }
    }

    /**
     * Retrieves all Actor entities from the database.
     * @returns {Promise<Actor[]>} A list of all Actor entities.
     * @throws {Error} If there's a database error during the operation.
     */
    async findAll() {
        try {
            return await Actor.findAll();
        } catch (error) {
            console.error(`[ActorRepository] Error finding all actors: ${error.message}`);
            throw new Error(`Failed to find all actors: ${error.message}`);
        }
    }

    /**
     * Deletes an Actor entity from the database by its primary key (actorId).
     * @param {number} id - The unique identifier of the actor to delete.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If there's a database error during the operation.
     */
    async deleteById(id) {
        try {
            return await Actor.destroy({
                where: { actorId: id }
            });
        } catch (error) {
            console.error(`[ActorRepository] Error deleting actor by ID ${id}: ${error.message}`);
            throw new Error(`Failed to delete actor by ID: ${error.message}`);
        }
    }

    /**
     * Deletes a given Actor entity from the database.
     * This method requires the `actor` object to contain its `actorId`.
     * @param {Partial<Actor>} actor - The actor object to delete (must contain `actorId`).
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If the actor object does not contain an `actorId` or if there's a database error.
     */
    async delete(actor) {
        if (!actor || !actor.actorId) {
            throw new Error('Actor object must contain an actorId for deletion.');
        }
        return this.deleteById(actor.actorId);
    }

    /**
     * Returns the total number of Actor entities in the database.
     * @returns {Promise<number>} The total count of actors.
     * @throws {Error} If there's a database error during the operation.
     */
    async count() {
        try {
            return await Actor.count();
        } catch (error) {
            console.error(`[ActorRepository] Error counting actors: ${error.message}`);
            throw new Error(`Failed to count actors: ${error.message}`);
        }
    }

    /**
     * Retrieves Actor entities with pagination and sorting capabilities.
     * This method