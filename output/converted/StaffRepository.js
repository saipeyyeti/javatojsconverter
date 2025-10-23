Here is the complete, production-ready Node.js code, structured into three files as per best practices, then combined into a single output.

---

### File 1: `config/db.config.js`
(Database connection and Sequelize instance)

```javascript
/**
 * @file Manages the Sequelize database connection.
 * @module config/db.config
 */

const { Sequelize } = require('sequelize');

// Load environment variables (e.g., from a .env file)
require('dotenv').config();

/**
 * Sequelize instance for database connection.
 * Configured using environment variables for flexibility.
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sakila',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql', // Assuming MySQL based on Sakila
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log queries in dev
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false, // Sakila tables often don't use createdAt/updatedAt
      freezeTableName: true // Prevent Sequelize from pluralizing table names
    }
  }
);

/**
 * Establishes and tests the database connection.
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves if the connection is successful,
 *   or rejects with an error if it fails.
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // In a real application, you might want to exit the process or retry
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};
```

---

### File 2: `models/staff.model.js`
(Sequelize Staff Model Definition)

```javascript
/**
 * @file Defines the Staff Sequelize model.
 * @module models/staff.model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

/**
 * Represents the 'staff' table in the Sakila database.
 * @typedef {object} Staff
 * @property {number} staff_id - Primary key, auto-incremented.
 * @property {string} first_name - Staff member's first name.
 * @property {string} last_name - Staff member's last name.
 * @property {number} address_id - Foreign key to the 'address' table.
 * @property {Buffer|null} picture - Staff member's picture (BLOB).
 * @property {string|null} email - Staff member's email address.
 * @property {number} store_id - Foreign key to the 'store' table.
 * @property {boolean} active - Whether the staff member is active.
 * @property {string} username - Staff member's username.
 * @property {string|null} password - Staff member's password (hashed).
 * @property {Date} last_update - Timestamp of the last update.
 */

/**
 * Sequelize model for the Staff entity.
 * @type {import('sequelize').ModelCtor<import('sequelize').Model<Staff, Staff>>}
 */
const Staff = sequelize.define('staff', {
  staff_id: {
    type: DataTypes.TINYINT.UNSIGNED,
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
  },
  picture: {
    type: DataTypes.BLOB,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  store_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  username: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true // Assuming username should be unique
  },
  password: {
    type: DataTypes.STRING(40), // BINARY in Sakila, but STRING is common for hashes
    allowNull: true
  },
  last_update: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'staff', // Ensure Sequelize uses the exact table name
  timestamps: false // Sakila tables typically manage their own timestamps
});

module.exports = Staff;
```

---

### File 3: `dao/staff.dao.js`
(Staff Data Access Object - Repository Equivalent)

```javascript
/**
 * @file Implements the Data Access Object (DAO) for the Staff entity,
 *       mirroring the functionality of the Java StaffRepository.
 * @module dao/staff.dao
 */

const Staff = require('../models/staff.model');
const { Op } = require('sequelize'); // For advanced query operators

/**
 * Custom error class for DAO operations.
 */
class DaoError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DaoError';
    this.originalError = originalError;
    // Capture the stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DaoError);
    }
  }
}

/**
 * `StaffDAO` provides an abstraction layer for data access operations
 * related to the `Staff` entity using Sequelize ORM.
 * It encapsulates CRUD operations and custom queries.
 */
class StaffDAO {

  /**
   * Creates a new Staff entity in the database.
   * Corresponds to `JpaRepository.save(Staff entity)` for new entities.
   * @async
   * @param {object} staffData - The data for the new staff member.
   * @returns {Promise<Staff>} The created Staff entity.
   * @throws {DaoError} If the creation fails.
   */
  async create(staffData) {
    try {
      const staff = await Staff.create(staffData);
      return staff;
    } catch (error) {
      console.error(`Error creating staff: ${error.message}`, error);
      throw new DaoError(`Failed to create staff member.`, error);
    }
  }

  /**
   * Retrieves a Staff entity by its primary key (staff_id).
   * Corresponds to `JpaRepository.findById(Integer id)`.
   * @async
   * @param {number} id - The primary key (staff_id) of the staff member.
   * @returns {Promise<Staff|null>} The Staff entity if found, otherwise null.
   * @throws {DaoError} If the retrieval fails.
   */
  async findById(id) {
    try {
      const staff = await Staff.findByPk(id);
      return staff;
    } catch (error) {
      console.error(`Error finding staff by ID ${id}: ${error.message}`, error);
      throw new DaoError(`Failed to retrieve staff member with ID ${id}.`, error);
    }
  }

  /**
   * Retrieves all Staff entities from the database.
   * Corresponds to `JpaRepository.findAll()`.
   * @async
   * @returns {Promise<Staff[]>} An array of all Staff entities.
   * @throws {DaoError} If the retrieval fails.
   */
  async findAll() {
    try {
      const staffList = await Staff.findAll();
      return staffList;
    } catch (error) {
      console.error(`Error finding all staff: ${error.message}`, error);
      throw new DaoError(`Failed to retrieve all staff members.`, error);
    }
  }

  /**
   * Retrieves all Staff entities with pagination and optional sorting.
   * Corresponds to `JpaRepository.findAll(Pageable pageable)` and `JpaRepository.findAll(Sort sort)`.
   * @async
   * @param {object} [options={}] - Options for pagination and sorting.
   * @param {number} [options.page=1] - The page number (1-indexed).
   * @param {number} [options.limit=10] - The maximum number of items per page.
   * @param {Array<Array<string>>} [options.sort=[['staff_id', 'ASC']]] - An array of arrays for sorting, e.g., `[['first_name', 'ASC'], ['last_name', 'DESC']]`.
   * @returns {Promise<{rows: Staff[], count: number}>} An object containing the paginated staff list and total count.
   * @throws {DaoError} If the retrieval fails.
   */
  async findAllPaginated({ page = 1, limit = 10, sort = [['staff_id', 'ASC']] } = {}) {
    try {
      const offset = (page - 1) * limit;
      const result = await Staff.findAndCountAll({
        limit: limit,
        offset: offset,
        order: sort
      });
      return {
        rows: result.rows,
        count: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit)
      };
    } catch (error) {
      console.error(`Error finding all staff paginated: ${error.message}`, error);
      throw new DaoError(`Failed to retrieve paginated staff members.`, error);
    }
  }

  /**
   * Updates an existing Staff entity in the database.
   * Corresponds to `JpaRepository.save(Staff entity)` for existing entities.
   * @async
   * @param {number} id - The primary key (staff_id) of the staff member to update.
   * @param {object} staffData - The data to update.
   * @returns {Promise<Staff|null>} The updated Staff entity if found and updated, otherwise null.
   * @throws {DaoError} If the update fails.
   */
  async update(id, staffData) {
    try {
      const [affectedRows] = await Staff.update(staffData, {
        where: { staff_id: id }
      });

      if (affectedRows === 0) {
        return null; // No staff found with the given ID
      }
      // Retrieve the updated staff to return the full object
      const updatedStaff = await this.findById(id);
      return updatedStaff;
    } catch (error) {
      console.error(`Error updating staff with ID ${id}: ${error.message}`, error);
      throw new DaoError(`Failed to update staff member with ID ${id}.`, error);
    }
  }

  /**
   * Deletes a Staff entity by its primary key (staff_id).
   * Corresponds to `JpaRepository.deleteById(Integer id)`.
   * @async
   * @param {number} id - The primary key (staff_id) of the staff member to delete.
   * @returns {Promise<number>} The number of rows deleted (0 or 1).
   * @throws {DaoError} If the deletion fails.
   */
  async delete(id) {
    try {
      const deletedRows = await Staff.destroy({
        where: { staff_id: id }
      });
      return deletedRows;
    } catch (error) {
      console.error(`Error deleting staff with ID ${id}: ${error.message}`, error);
      throw new DaoError(`Failed to delete staff member with ID ${id}.`, error);
    }
  }

  /**
   * Retrieves a single Staff entity based on their username.
   * This is the custom query method from the Java `StaffRepository`.
   * Corresponds to `Staff getStaffByUsername(String username)`.
   * @async
   * @param {string} username - The username of the staff member.
   * @returns {Promise<Staff|null>} The Staff entity if found, otherwise null.
   * @throws {DaoError} If the retrieval fails.
   */
  async getStaffByUsername(username) {
    try {
      const staff = await Staff.findOne({
        where: { username: username }
      });
      return staff;
    } catch (error) {
      console.error(`Error finding staff by username '${username}': ${error.message}`, error);
      throw new DaoError(`Failed to retrieve staff member by username '${username}'.`, error);
    }
  }

  /**
   * Returns the total number of Staff entities in the database.
   * Corresponds to `JpaRepository.count()`.
   * @async
   * @returns {Promise<number>} The total count of Staff entities.
   * @throws {DaoError} If the count operation fails.
   */
  async count() {
    try {
      const totalCount = await Staff.count();
      return totalCount;
    } catch (error) {
      console.error(`Error counting staff: ${error.message}`, error);
      throw new DaoError(`Failed to count staff members.`, error);
    }
  }

  /**
   * Checks if a Staff entity with the given ID exists.
   * Corresponds to `JpaRepository.existsById(Integer id)`.
   * @async
   * @param {number} id - The primary key (staff_id) to check.
   * @returns {Promise<boolean>} True if a staff member with the ID exists, false otherwise.
   * @throws {DaoError} If the existence check fails.
   */
  async existsById(id) {
    try {
      const count = await Staff.count({
        where: { staff_id: id }
      });
      return count > 0;
    } catch (error) {
      console.error(`Error checking existence for staff ID ${id}: ${error.message}`, error);
      throw new DaoError(`Failed to check existence for staff member with ID ${id}.`, error);
    }
  }
}

module.exports = new StaffDAO(); // Export an instance of the DAO
```