/**
 * @file CategoryRepository.js
 * @description This module provides data access operations for the Category entity
 *              using Sequelize ORM, mirroring the functionality of a Spring Data JPA
 *              CategoryRepository interface.
 */

const { Sequelize, DataTypes, Op } = require('sequelize');

// --- Database Connection Setup (Typically in a separate config/db.js file) ---
/**
 * Initializes and exports the Sequelize instance.
 * Replace with your actual database credentials and configuration.
 * In a real application, this would be managed by a dedicated database configuration module.
 */
const sequelize = new Sequelize('sakila', 'user', 'password', {
    host: 'localhost',
    dialect: 'mysql', // e.g., 'mysql', 'postgres', 'sqlite', 'mssql'
    logging: false,   // Set to true to see SQL queries in console
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    // Optional: Define a custom error for repository operations
    // class RepositoryError extends Error {
    //     constructor(message, originalError) {
    //         super(message);
    //         this.name = 'RepositoryError';
    //         this.originalError = originalError;
    //     }
    // }
});

/**
 * Authenticates the connection to the database.
 * @async
 * @returns {Promise<void>} A promise that resolves if connection is successful,
 *                          rejects otherwise.
 */
async function authenticateDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // In a production environment, you might want to exit the process or
        // implement a more robust retry mechanism.
        throw new Error('Failed to connect to the database.', { cause: error });
    }
}

// Call this function once at application startup
// authenticateDatabase();

// --- Category Model Definition (Typically in a separate models/Category.js file) ---
/**
 * @typedef {object} CategoryAttributes
 * @property {number} [categoryId] - The unique identifier for the category. Auto-incremented.
 * @property {string} name - The name of the category.
 * @property {Date} [lastUpdate] - The timestamp of the last update. Defaults to current time.
 */

/**
 * @typedef {import('sequelize').Model<CategoryAttributes, CategoryAttributes>} CategoryModelInstance
 */

/**
 * Defines the Sequelize model for the 'category' table.
 * This model represents the `Category` entity.
 * @type {import('sequelize').ModelCtor<CategoryModelInstance>}
 */
const Category = sequelize.define('Category', {
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'category_id' // Maps to the actual column name in the database
    },
    name: {
        type: DataTypes.STRING(25), // Assuming a max length for category names
        allowNull: false
    },
    lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'last_update', // Maps to the actual column name in the database
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'category', // Explicitly define the table name
    timestamps: false      // Sakila tables usually manage timestamps manually
});

// --- CategoryRepository Implementation ---

/**
 * @class CategoryRepository
 * @description Provides data access operations for the `Category` entity.
 *              This class encapsulates Sequelize interactions, offering a clean
 *              API similar to a Spring Data JPA repository.
 */
class CategoryRepository {

    /**
     * Creates a new Category entity in the database.
     * Maps to `save(Category entity)` for new entities.
     * @async
     * @param {CategoryAttributes} categoryData - The data for the new category.
     * @returns {Promise<CategoryModelInstance>} The created Category instance.
     * @throws {Error} If there is a database error during creation.
     */
    async create(categoryData) {
        try {
            const category = await Category.create(categoryData);
            return category;
        } catch (error) {
            console.error(`Error creating category: ${error.message}`, error);
            throw new Error(`Failed to create category.`, { cause: error });
        }
    }

    /**
     * Retrieves a Category entity by its primary key (categoryId).
     * Maps to `findById(Integer id)` and `getCategoryByCategoryId(Integer id)`.
     * @async
     * @param {number} id - The primary key (categoryId) of the category to retrieve.
     * @returns {Promise<CategoryModelInstance | null>} The Category instance if found, otherwise `null`.
     * @throws {Error} If there is a database error during retrieval.
     */
    async findById(id) {
        try {
            const category = await Category.findByPk(id);
            return category;
        } catch (error) {
            console.error(`Error finding category by ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to find category by ID ${id}.`, { cause: error });
        }
    }

    /**
     * Retrieves all Category entities from the database.
     * Maps to `findAll()`.
     * @async
     * @param {object} [options] - Optional query options (e.g., `order`, `limit`, `offset`).
     * @returns {Promise<CategoryModelInstance[]>} An array of Category instances.
     * @throws {Error} If there is a database error during retrieval.
     */
    async findAll(options = {}) {
        try {
            const categories = await Category.findAll(options);
            return categories;
        } catch (error) {
            console.error(`Error retrieving all categories: ${error.message}`, error);
            throw new Error(`Failed to retrieve all categories.`, { cause: error });
        }
    }

    /**
     * Updates an existing Category entity in the database.
     * Maps to `save(Category entity)` for existing entities.
     * @async
     * @param {number} id - The primary key (categoryId) of the category to update.
     * @param {Partial<CategoryAttributes>} categoryData - The data to update.
     * @returns {Promise<[number, CategoryModelInstance[]]>} A tuple where the first element is the number of affected rows
     *                                                        and the second is an array of the updated instances (if `returning: true` is used).
     *                                                        Returns `[0, []]` if no category found with the given ID.
     * @throws {Error} If there is a database error during update.
     */
    async update(id, categoryData) {
        try {
            // Sequelize's update returns [affectedRows, affectedRowsInstances]
            // For MySQL, affectedRowsInstances is not supported by default, so it's usually [affectedRows].
            // To get the updated instance, you might need to fetch it separately or use `returning: true`
            // which is not supported by all dialects (e.g., MySQL < 8.0).
            const [affectedRows] = await Category.update(categoryData, {
                where: { categoryId: id }
            });

            if (affectedRows > 0) {
                // Fetch the updated category to return it, similar to how JPA might return the saved entity
                const updatedCategory = await this.findById(id);
                return updatedCategory;
            }
            return null; // Or throw an error if not found
        } catch (error) {
            console.error(`Error updating category with ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to update category with ID ${id}.`, { cause: error });
        }
    }

    /**
     * Deletes a Category entity from the database by its primary key.
     * Maps to `delete(Category entity)` or `deleteById(Integer id)`.
     * @async
     * @param {number} id - The primary key (categoryId) of the category to delete.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If there is a database error during deletion.
     */
    async delete(id) {
        try {
            const deletedRows = await Category.destroy({
                where: { categoryId: id }
            });
            return deletedRows;
        } catch (error) {
            console.error(`Error deleting category with ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to delete category with ID ${id}.`, { cause: error });
        }
    }

    /**
     * Returns the total number of Category entities in the database.
     * Maps to `count()`.
     * @async
     * @returns {Promise<number>} The total count of categories.
     * @throws {Error} If there is a database error during counting.
     */
    async count() {
        try {
            const totalCount = await Category.count();
            return totalCount;
        } catch (error) {
            console.error(`Error counting categories: ${error.message}`, error);
            throw new Error(`Failed to count categories.`, { cause: error });
        }
    }

    /**
     * Retrieves a single Category entity specifically by its `categoryId` field.
     * This is the custom query method from the original Java interface.
     * Maps to `Category getCategoryByCategoryId(Integer id);`.
     * @async
     * @param {number} id - The `categoryId` to search for.
     * @returns {Promise<CategoryModelInstance | null>} The Category instance if found, otherwise `null`.
     * @throws {Error} If there is a database error during retrieval.
     */
    async getCategoryByCategoryId(id) {
        // In Sequelize, findByPk is the most efficient way to find by primary key.
        // It directly maps to the custom method's intent.
        return this.findById(id);
    }

    // --- Additional methods to cover more JpaRepository functionality ---

    /**
     * Saves multiple Category entities.
     * Maps to `saveAll(Iterable<Category> entities)`.
     * @async
     * @param {CategoryAttributes[]} categoriesData - An array of category data objects.
     * @returns {Promise<CategoryModelInstance[]>} An array of the created Category instances.
     * @throws {Error} If there is a database error during bulk creation.
     */
    async saveAll(categoriesData) {
        try {
            const createdCategories = await Category.bulkCreate(categoriesData);
            return createdCategories;
        } catch (error) {
            console.error(`Error saving all categories: ${error.message}`, error);
            throw new Error(`Failed to save all categories.`, { cause: error });
        }
    }

    /**
     * Deletes all Category entities from the database.
     * Maps to `deleteAll()`.
     * @async
     * @returns {Promise<number>} The number of rows deleted.
     * @throws {Error} If there is a database error during deletion.
     */
    async deleteAll() {
        try {
            const deletedRows = await Category.destroy({
                where: {}, // Empty where clause deletes all records
                truncate: true // For some dialects, this is more efficient
            });
            return deletedRows;
        } catch (error) {
            console.error(`Error deleting all categories: ${error.message}`, error);
            throw new Error(`Failed to delete all categories.`, { cause: error });
        }
    }

    /**
     * Retrieves all entities with pagination and sorting.
     * Maps to `findAll(Pageable pageable)` and `findAll(Sort sort)`.
     * @async
     * @param {object} [paginationOptions] - Options for pagination and sorting.
     * @param {number} [paginationOptions.limit] - The maximum number of results to return.
     * @param {number} [paginationOptions.offset] - The number of results to skip.
     * @param {Array<Array<string>>} [paginationOptions.order] - An array of arrays, e.g., `[['name', 'ASC'], ['lastUpdate', 'DESC']]`.
     * @returns {Promise<{rows: CategoryModelInstance[], count: number}>} An object containing the paginated results and total count.
     * @throws {Error} If there is a database error during retrieval.
     */
    async findAllPaginatedAndSorted({ limit, offset, order } = {}) {
        try {
            const result = await Category.findAndCountAll({
                limit,
                offset,
                order
            });
            return result; // { rows: [...], count: N }
        } catch (error) {
            console.error(`Error retrieving paginated/sorted categories: ${error.message}`, error);
            throw new Error(`Failed to retrieve paginated/sorted categories.`, { cause: error });
        }
    }
}

// Export an instance of the repository for use in other modules
module.exports = new CategoryRepository();

// Optionally, export the Category model and sequelize instance if needed elsewhere
// module.exports.CategoryModel = Category;
// module.exports.sequelize = sequelize;
// module.exports.authenticateDatabase = authenticateDatabase;