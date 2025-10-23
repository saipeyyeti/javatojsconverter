```javascript
// --- db.config.js (Sequelize Initialization) ---
// This file sets up the Sequelize instance and database connection.
// In a real application, connection details would come from environment variables.

const { Sequelize } = require('sequelize');

/**
 * Initializes and returns a Sequelize instance.
 * @returns {Sequelize} The initialized Sequelize instance.
 */
const sequelize = new Sequelize({
    dialect: 'sqlite', // Or 'mysql', 'postgres', 'mssql', etc.
    storage: './sakila.sqlite', // Path to your SQLite database file
    logging: false, // Set to true to see SQL queries in console
    define: {
        timestamps: false, // Disable timestamps (createdAt, updatedAt) by default
        freezeTableName: true // Prevent Sequelize from pluralizing table names
    }
});

/**
 * Authenticates the connection to the database.
 * @async
 * @returns {Promise<void>} A promise that resolves if authentication is successful.
 * @throws {Error} If the connection cannot be established.
 */
async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error('Failed to connect to the database.');
    }
}

module.exports = {
    sequelize,
    connectToDatabase
};

// --- category.model.js (Category Entity Definition) ---
// This file defines the Sequelize model for the Category entity.

const { DataTypes } = require('sequelize');
const { sequelize } = require('./db.config'); // Assuming db.config.js is in the same directory

/**
 * Represents the Category entity in the database.
 * @typedef {object} Category
 * @property {number} categoryId - The primary key of the category.
 * @property {string} name - The name of the category.
 * @property {Date} lastUpdate - The timestamp of the last update.
 */

/**
 * Defines the Category Sequelize model.
 * @param {Sequelize} sequelizeInstance - The Sequelize instance.
 * @returns {Model<Category>} The Category Sequelize model.
 */
const CategoryModel = sequelize.define('category', {
    categoryId: {
        type: DataTypes.SMALLINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        field: 'category_id' // Maps to 'category_id' column in the database
    },
    name: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'last_update' // Maps to 'last_update' column in the database
    }
}, {
    tableName: 'category', // Explicitly specify table name
    timestamps: false // Disable Sequelize's default createdAt/updatedAt
});

module.exports = CategoryModel;

// --- category.repository.js (Category Repository) ---
// This file implements the data access logic for the Category entity.

const CategoryModel = require('./category.model'); // Assuming category.model.js is in the same directory
const { Op } = require('sequelize'); // For advanced query operators if needed

/**
 * @typedef {object} SortOption
 * @property {string} field - The field to sort by.
 * @property {'ASC'|'DESC'} direction - The sort direction.
 */

/**
 * @typedef {object} Pageable
 * @property {number} page - The page number (0-indexed).
 * @property {number} size - The number of items per page.
 * @property {SortOption[]} [sort] - Optional array of sort options.
 */

/**
 * @typedef {object} PageResult<T>
 * @property {T[]} content - The list of entities for the current page.
 * @property {number} totalElements - The total number of elements across all pages.
 * @property {number} totalPages - The total number of pages.
 * @property {number} currentPage - The current page number (0-indexed).
 * @property {number} pageSize - The number of items per page.
 */

/**
 * CategoryRepository provides data access operations for the Category entity.
 * It encapsulates CRUD operations and custom queries using Sequelize ORM.
 */
class CategoryRepository {

    /**
     * Persists a new Category entity or updates an existing one.
     * If the category object has a `categoryId`, it attempts to update.
     * Otherwise, it creates a new category.
     *
     * @async
     * @param {Category} category - The category object to save.
     * @returns {Promise<Category>} The saved or updated category entity.
     * @throws {Error} If the save operation fails.
     */
    async save(category) {
        try {
            if (category.categoryId) {
                // Attempt to update an existing category
                const [rowsAffected, [updatedCategory]] = await CategoryModel.update(category, {
                    where: { categoryId: category.categoryId },
                    returning: true // Return the updated object (PostgreSQL, MSSQL, not SQLite/MySQL)
                });

                if (rowsAffected === 0) {
                    // If no rows were affected, it means the categoryId didn't exist.
                    // In Spring Data JPA, `save` would create if not found.
                    // For Sequelize, we'll explicitly create if update fails.
                    // Alternatively, one could use `upsert` if the primary key is guaranteed unique.
                    const newCategory = await CategoryModel.create(category);
                    return newCategory.toJSON();
                }
                // For SQLite/MySQL, `update` doesn't return the updated object directly.
                // We need to fetch it again.
                const fetchedCategory = await CategoryModel.findByPk(category.categoryId);
                return fetchedCategory ? fetchedCategory.toJSON() : null;

            } else {
                // Create a new category
                const newCategory = await CategoryModel.create(category);
                return newCategory.toJSON();
            }
        } catch (error) {
            console.error(`Error saving category: ${error.message}`, error);
            throw new Error(`Failed to save category: ${error.message}`);
        }
    }

    /**
     * Retrieves a Category entity by its primary key (`categoryId`).
     *
     * @async
     * @param {number} id - The primary key of the category.
     * @returns {Promise<Category|null>} The Category entity if found, otherwise null.
     * @throws {Error} If the retrieval operation fails.
     */
    async findById(id) {
        try {
            const category = await CategoryModel.findByPk(id);
            return category ? category.toJSON() : null;
        } catch (error) {
            console.error(`Error finding category by ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to find category by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves all Category entities from the database.
     *
     * @async
     * @returns {Promise<Category[]>} A list of all Category entities.
     * @throws {Error} If the retrieval operation fails.
     */
    async findAll() {
        try {
            const categories = await CategoryModel.findAll();
            return categories.map(cat => cat.toJSON());
        } catch (error) {
            console.error(`Error finding all categories: ${error.message}`, error);
            throw new Error(`Failed to find all categories: ${error.message}`);
        }
    }

    /**
     * Deletes a given Category entity.
     *
     * @async
     * @param {Category} category - The category entity to delete. Must have `categoryId`.
     * @returns {Promise<number>} The number of rows deleted (should be 1 if successful).
     * @throws {Error} If the deletion operation fails or categoryId is missing.
     */
    async delete(category) {
        if (!category || !category.categoryId) {
            throw new Error('Category object with categoryId is required for deletion.');
        }
        try {
            const rowsDeleted = await CategoryModel.destroy({
                where: { categoryId: category.categoryId }
            });
            return rowsDeleted;
        } catch (error) {
            console.error(`Error deleting category with ID ${category.categoryId}: ${error.message}`, error);
            throw new Error(`Failed to delete category with ID ${category.categoryId}: ${error.message}`);
        }
    }

    /**
     * Deletes a Category entity by its primary key.
     *
     * @async
     * @param {number} id - The primary key of the category to delete.
     * @returns {Promise<number>} The number of rows deleted (should be 1 if successful).
     * @throws {Error} If the deletion operation fails.
     */
    async deleteById(id) {
        try {
            const rowsDeleted = await CategoryModel.destroy({
                where: { categoryId: id }
            });
            return rowsDeleted;
        } catch (error) {
            console.error(`Error deleting category by ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to delete category by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Returns the total number of Category entities.
     *
     * @async
     * @returns {Promise<number>} The total count of categories.
     * @throws {Error} If the count operation fails.
     */
    async count() {
        try {
            const totalCount = await CategoryModel.count();
            return totalCount;
        } catch (error) {
            console.error(`Error counting categories: ${error.message}`, error);
            throw new Error(`Failed to count categories: ${error.message}`);
        }
    }

    /**
     * Checks if a Category entity with the given primary key exists.
     *
     * @async
     * @param {number} id - The primary key of the category.
     * @returns {Promise<boolean>} True if the category exists, false otherwise.
     * @throws {Error} If the existence check fails.
     */
    async existsById(id) {
        try {
            const count = await CategoryModel.count({
                where: { categoryId: id }
            });
            return count > 0;
        } catch (error) {
            console.error(`Error checking existence for category ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to check existence for category ID ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves all Category entities, sorted according to the provided `SortOption` array.
     *
     * @async
     * @param {SortOption[]} sortOptions - An array of objects defining sort fields and directions.
     *   Example: `[{ field: 'name', direction: 'ASC' }, { field: 'lastUpdate', direction: 'DESC' }]`
     * @returns {Promise<Category[]>} A list of sorted Category entities.
     * @throws {Error} If the retrieval operation fails.
     */
    async findAllSorted(sortOptions) {
        try {
            const order = sortOptions.map(s => [s.field, s.direction]);
            const categories = await CategoryModel.findAll({ order });
            return categories.map(cat => cat.toJSON());
        } catch (error) {
            console.error(`Error finding all categories with sort: ${error.message}`, error);
            throw new Error(`Failed to find all categories with sort: ${error.message}`);
        }
    }

    /**
     * Retrieves Category entities in a paginated and potentially sorted manner.
     *
     * @async
     * @param {Pageable} pageable - An object containing pagination and sorting parameters.
     *   Example: `{ page: 0, size: 10, sort: [{ field: 'name', direction: 'ASC' }] }`
     * @returns {Promise<PageResult<Category>>} A page object containing content, total elements, and page info.
     * @throws {Error} If the retrieval operation fails.
     */
    async findAllPaginated(pageable) {
        const { page, size, sort } = pageable;
        const offset = page * size;
        const order = sort ? sort.map(s => [s.field, s.direction]) : [];

        try {
            const { count, rows } = await CategoryModel.findAndCountAll({
                limit: size,
                offset: offset,
                order: order
            });

            return {
                content: rows.map(cat => cat.toJSON()),
                totalElements: count,
                totalPages: Math.ceil(count / size),
                currentPage: page,
                pageSize: size
            };
        } catch (error) {
            console.error(`Error finding all categories paginated: ${error.message}`, error);
            throw new Error(`Failed to find all categories paginated: ${error.message}`);
        }
    }

    /**
     * Retrieves a Category entity by its `categoryId`.
     * This method is equivalent to `findById` as `categoryId` is assumed to be the primary key.
     *
     * @async
     * @param {number} id - The `categoryId` of the category to retrieve.
     * @returns {Promise<Category|null>} The Category entity if found, otherwise null.
     * @throws {Error} If the retrieval operation fails.
     */
    async getCategoryByCategoryId(id) {
        // Assuming categoryId is the primary key, this is equivalent to findByPk
        return this.findById(id);
    }
}

module.exports = new CategoryRepository(); // Export an instance of the repository

// --- Example Usage (Optional - for demonstration purposes) ---
/*
// In your main application file (e.g., app.js or index.js)

const { connectToDatabase, sequelize } = require('./db.config');
const categoryRepository = require('./category.repository');
const CategoryModel = require('./category.model'); // Import model to sync

async function runExample() {
    await connectToDatabase();

    // Sync models (creates tables if they don't exist)
    // In production, use migrations instead of `sync({ force: true })`
    await CategoryModel.sync(); // Or `await sequelize.sync({ force: true });` for all models

    try {
        console.log('\n--- Creating a new category ---');
        const newCategory = await categoryRepository.save({ name: 'Horror', lastUpdate: new Date() });
        console.log('Created category:', newCategory);

        console.log('\n--- Finding category by ID ---');
        const foundCategory = await categoryRepository.findById(newCategory.categoryId);
        console.log('Found category:', foundCategory);

        console.log('\n--- Updating a category ---');
        foundCategory.name = 'Sci-Fi';
        const updatedCategory = await categoryRepository.save(foundCategory);
        console.log('Updated category:', updatedCategory);

        console.log('\n--- Finding all categories ---');
        const allCategories = await categoryRepository.findAll();
        console.log('All categories:', allCategories);

        console.log('\n--- Counting categories ---');
        const count = await categoryRepository.count();
        console.log('Total categories:', count);

        console.log('\n--- Checking existence by ID ---');
        const exists = await categoryRepository.existsById(updatedCategory.categoryId);
        console.log(`Category with ID ${updatedCategory.categoryId} exists:`, exists);

        console.log('\n--- Finding all categories sorted by name DESC ---');
        const sortedCategories = await categoryRepository.findAllSorted([{ field: 'name', direction: 'DESC' }]);
        console.log('Sorted categories:', sortedCategories);

        console.log('\n--- Finding categories paginated (page 0, size 10, sorted by name ASC) ---');
        const paginatedCategories = await categoryRepository.findAllPaginated({
            page: 0,
            size: 10,
            sort: [{ field: 'name', direction: 'ASC' }]
        });
        console.log('Paginated categories:', paginatedCategories);

        console.log('\n--- Deleting a category by ID ---');
        const rowsDeleted = await categoryRepository.deleteById(newCategory.categoryId);
        console.log(`Rows deleted: ${rowsDeleted}`);

        console.log('\n--- Verifying deletion ---');
        const deletedCategory = await categoryRepository.findById(newCategory.categoryId);
        console.log('Category after deletion:', deletedCategory);

    } catch (error) {
        console.error('An error occurred during example execution:', error.message);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Uncomment to run the example
// runExample();
*/
```