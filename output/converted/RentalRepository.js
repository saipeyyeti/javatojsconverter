```javascript
/**
 * @file RentalRepository.js
 * @description This module provides a Data Access Object (DAO) for the Rental entity,
 *              leveraging Sequelize ORM for database interactions. It mirrors the
 *              functionality of the Java Spring Data JPA RentalRepository interface.
 *              It encapsulates the logic for accessing and persisting Rental data.
 */

/**
 * Represents a custom error for repository operations.
 * @class RepositoryError
 * @extends Error
 */
class RepositoryError extends Error {
  /**
   * Creates an instance of RepositoryError.
   * @param {string} message - The error message.
   * @param {Error} [originalError] - The original error that caused this error.
   */
  constructor(message, originalError) {
    super(message);
    this.name = 'RepositoryError';
    this.originalError = originalError;
    // Capturing stack trace, excluding constructor call from it.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RepositoryError);
    }
  }
}

/**
 * `RentalRepository` serves as a Data Access Object (DAO) for the `Rental` entity.
 * It provides methods for performing CRUD operations and custom queries on `Rental` records
 * using Sequelize ORM.
 *
 * This class is designed to be instantiated with a Sequelize `Rental` model,
 * allowing for dependency injection and easier testing.
 */
class RentalRepository {
  /**
   * Creates an instance of RentalRepository.
   * @param {object} RentalModel - The Sequelize model for the Rental entity.
   *                               This model should be properly defined and associated.
   * @param {object} [CustomerModel] - The Sequelize model for the Customer entity,
   *                                   required if associations are used for complex queries.
   *                                   (Though for `getRentalByCustomerId`, it's not strictly
   *                                   needed if `Rental` has `customer_id` directly).
   */
  constructor(RentalModel, CustomerModel) {
    if (!RentalModel) {
      throw new RepositoryError('RentalModel must be provided to RentalRepository.');
    }
    this.Rental = RentalModel;
    this.Customer = CustomerModel; // Keep for potential future use or explicit association queries
  }

  /**
   * Persists a Rental entity to the database.
   * If the entity has a primary key, it attempts to update an existing record.
   * Otherwise, it inserts a new record.
   * This method mimics Spring Data JPA's `save` behavior (upsert).
   *
   * @async
   * @param {object} rentalData - An object containing the Rental entity data.
   *                              If `rentalId` is present, it attempts an update.
   * @returns {Promise<object>} A promise that resolves with the persisted Rental entity.
   * @throws {RepositoryError} If the operation fails.
   */
  async save(rentalData) {
    try {
      if (rentalData.rentalId) {
        // Attempt to update if rentalId is provided
        const [updatedRowsCount, updatedRentals] = await this.Rental.update(rentalData, {
          where: { rentalId: rentalData.rentalId },
          returning: true, // Return the updated object(s)
        });
        if (updatedRowsCount > 0) {
          return updatedRentals[0]; // Return the first updated object
        }
        // If no rows were updated, it might be a new entity or an ID that doesn't exist.
        // For Spring Data JPA's `save`, if an ID is provided but doesn't exist, it inserts.
        // Sequelize's `upsert` is a better match for this behavior.
        const [rental, created] = await this.Rental.upsert(rentalData, {
          returning: true,
        });
        return rental;
      } else {
        // Insert a new record
        return await this.Rental.create(rentalData);
      }
    } catch (error) {
      throw new RepositoryError(`Failed to save rental: ${error.message}`, error);
    }
  }

  /**
   * Retrieves a single Rental entity by its primary key (`rentalId`).
   *
   * @async
   * @param {number} id - The `rentalId` (primary key) of the Rental entity to retrieve.
   * @returns {Promise<object|null>} A promise that resolves with the Rental entity if found,
   *                                  otherwise `null`.
   * @throws {RepositoryError} If the database query fails.
   */
  async findById(id) {
    try {
      return await this.Rental.findByPk(id);
    } catch (error) {
      throw new RepositoryError(`Failed to find rental by ID ${id}: ${error.message}`, error);
    }
  }

  /**
   * Retrieves a single Rental entity by its `rentalId`.
   * This method is functionally identical to `findById` but explicitly named
   * to match the Java `getRentalByRentalId` method.
   *
   * @async
   * @param {number} id - The `rentalId` of the Rental entity to retrieve.
   * @returns {Promise<object|null>} A promise that resolves with the Rental entity if found,
   *                                  otherwise `null`.
   * @throws {RepositoryError} If the database query fails.
   */
  async getRentalByRentalId(id) {
    try {
      return await this.Rental.findByPk(id);
    } catch (error) {
      throw new RepositoryError(`Failed to get rental by rentalId ${id}: ${error.message}`, error);
    }
  }

  /**
   * Retrieves all Rental entities from the database.
   *
   * @async
   * @returns {Promise<Array<object>>} A promise that resolves with a list of all Rental entities.
   * @throws {RepositoryError} If the database query fails.
   */
  async findAll() {
    try {
      return await this.Rental.findAll();
    } catch (error) {
      throw new RepositoryError(`Failed to retrieve all rentals: ${error.message}`, error);
    }
  }

  /**
   * Deletes a Rental entity from the database by its primary key (`rentalId`).
   *
   * @async
   * @param {number} id - The `rentalId` of the Rental entity to delete.
   * @returns {Promise<number>} A promise that resolves with the number of deleted rows (0 or 1).
   * @throws {RepositoryError} If the deletion operation fails.
   */
  async deleteById(id) {
    try {
      return await this.Rental.destroy({
        where: { rentalId: id },
      });
    } catch (error) {
      throw new RepositoryError(`Failed to delete rental by ID ${id}: ${error.message}`, error);
    }
  }

  /**
   * Deletes a given Rental entity from the database.
   *
   * @async
   * @param {object} rental - The Rental entity object to delete. It must contain `rentalId`.
   * @returns {Promise<number>} A promise that resolves with the number of deleted rows (0 or 1).
   * @throws {RepositoryError} If the deletion operation fails or `rentalId` is missing.
   */
  async delete(rental) {
    if (!rental || !rental.rentalId) {
      throw new RepositoryError('Rental object with rentalId is required for deletion.');
    }
    return this.deleteById(rental.rentalId);
  }

  /**
   * Retrieves a list of Rental entities associated with a specific Customer ID.
   * This method translates the native SQL query from the Java repository.
   * It assumes the `Rental` model has a `customer_id` foreign key column.
   *
   * @async
   * @param {number} customerId - The ID of the customer to retrieve rentals for.
   * @returns {Promise<Array<object>>} A promise that resolves with a list of Rental entities.
   * @throws {RepositoryError} If the database query fails.
   */
  async getRentalByCustomerId(customerId) {
    try {
      // The original Java query was `SELECT * FROM rental r INNER JOIN customer c ON r.customer_id = c.customer_id WHERE c.customer_id = :customerId`
      // This query only selects columns from the `rental` table and uses the join purely for filtering.
      // If the `Rental` model has a `customer_id` column (which is standard for foreign keys),
      // a simple `where` clause on the `Rental` model is the most idiomatic and efficient Sequelize equivalent.
      return await this.Rental.findAll({
        where: { customerId: customerId }, // Assuming 'customerId' is the attribute name for 'customer_id' column
      });
    } catch (error) {
      throw new RepositoryError(`Failed to get rentals by customer ID ${customerId}: ${error.message}`, error);
    }
  }
}

// --- Example Usage (assuming setup in a separate file like `db.js` and `models/`) ---
/*
// db.js (example setup)
const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config/config.json'); // Or process.env for production

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false, // Set to console.log for debugging
});

// Define Rental Model (models/rental.js)
const RentalModel = sequelize.define('Rental', {
  rentalId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'rental_id'
  },
  rentalDate: { type: DataTypes.DATE, allowNull: false, field: 'rental_date' },
  inventoryId: { type: DataTypes.INTEGER, allowNull: false, field: 'inventory_id' },
  customerId: { type: DataTypes.INTEGER, allowNull: false, field: 'customer_id' }, // Foreign key
  returnDate: { type: DataTypes.DATE, field: 'return_date' },
  staffId: { type: DataTypes.INTEGER, allowNull: false, field: 'staff_id' },
  lastUpdate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'last_update' }
}, {
  tableName: 'rental',
  timestamps: false
});

// Define Customer Model (models/customer.js) - simplified for association context
const CustomerModel = sequelize.define('Customer', {
  customerId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'customer_id'
  },
  firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },
  lastName: { type: DataTypes.STRING, allowNull: false, field: 'last_name' }
}, {
  tableName: 'customer',
  timestamps: false
});

// Define associations (important for ORM queries, though not strictly needed for getRentalByCustomerId if Rental has customerId column)
RentalModel.belongsTo(CustomerModel, { foreignKey: 'customer_id', targetKey: 'customer_id' });
CustomerModel.hasMany(RentalModel, { foreignKey: 'customer_id', sourceKey: 'customer_id' });

module.exports = {
  sequelize,
  RentalModel,
  CustomerModel
};

// --- In your application's entry point (e.g., app.js or service layer) ---
const { RentalModel, CustomerModel, sequelize } = require('./db');
const rentalRepository = new RentalRepository(RentalModel, CustomerModel);

async function runExample() {
  try {
    await sequelize.sync(); // Sync models with database (for development, use migrations in production)
    console.log('Database synced.');

    // Example: Save a new rental
    const newRental = await rentalRepository.save({
      rentalDate: new Date(),
      inventoryId: 1,
      customerId: 101,
      staffId: 1,
    });
    console.log('New rental saved:', newRental.toJSON());

    // Example: Find rental by ID
    const foundRental = await rentalRepository.findById(newRental.rentalId);
    console.log('Found rental by ID:', foundRental ? foundRental.toJSON() : 'Not found');

    // Example: Get rental by rentalId (same as findById)
    const rentalById = await rentalRepository.getRentalByRentalId(newRental.rentalId);
    console.log('Get rental by rentalId:', rentalById ? rentalById.toJSON() : 'Not found');

    // Example: Get rentals by customer ID
    const customerRentals = await rentalRepository.getRentalByCustomerId(101);
    console.log('Rentals for customer 101:', customerRentals.map(r => r.toJSON()));

    // Example: Find all rentals
    const allRentals = await rentalRepository.findAll();
    console.log('All rentals:', allRentals.map(r => r.toJSON()));

    // Example: Delete a rental
    const deletedCount = await rentalRepository.deleteById(newRental.rentalId);
    console.log(`Deleted ${deletedCount} rental(s) with ID ${newRental.rentalId}`);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await sequelize.close();
  }
}

// runExample();
*/

module.exports = RentalRepository;
```