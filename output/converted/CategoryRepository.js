```javascript
// This file assumes you have a Sequelize instance initialized and exported from a configuration file.
// For example, if you have a file like `src/config/database.js` that looks like this:
//
//   const { Sequelize, DataTypes } = require('sequelize');
//   const sequelize = new Sequelize('sakila', 'user', 'password', {
//       host: 'localhost',
//       dialect: 'mysql', // Or 'postgres', 'sqlite', etc.
//       logging: false, // Disable logging SQL queries to console
//   });
//   module.exports = sequelize;
//
// Then the `require` path for `sequelize` below should be adjusted accordingly.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this path based on your project structure

/**
 * @typedef {object} Category
 * @property {number} categoryId - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {Date} [lastUpdate] - The timestamp of the last update.
 */

/**
 * Defines the Category model for Sequelize.
 * This model represents the 'category' table in the database, mapping its columns
 * to JavaScript properties.
 * @type {import('sequelize').ModelCtor<import('sequelize').Model<Category, Omit<Category, 'categoryId'>>>}
 */
const CategoryModel = sequelize.define('Category', {
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Assuming categoryId is an auto-incrementing primary key
        field: 'category_id' // Maps to the 'category_id' column in the database
    },
    name: {
        type: DataTypes.STRING(25), // Assuming a max length for category names, common in Sakila
        allowNull: false,
        unique: true, // Category names should typically be unique
        field: 'name' // Maps to the 'name' column in the database
    },
    lastUpdate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Default to current timestamp on creation
        field: 'last_update' // Maps to the 'last_update' column in the database
    }
}, {
    tableName: 'category', // Explicitly set the table name if it differs from the model name
    timestamps: false // Disable Sequelize's default `createdAt` and `updatedAt` columns
});

/**
 * @class CategoryRepository
 * @description Provides data access operations for the `Category` entity using Sequelize.
 * This class serves as a Data Access Object (DAO) for the `Category` entity,
 * mimicking the functionality of a Spring Data JPA `JpaRepository` interface.
 * It encapsulates CRUD (Create, Read, Update, Delete) operations and custom queries
 * for `Category` entities, abstracting the underlying database interactions.
 */
class CategoryRepository {

    /**
     * Retrieves a `Category` entity by its primary key (`categoryId`).
     * This method is a direct equivalent to the custom `getCategoryByCategoryId(Integer id)`
     * method defined in the Java `CategoryRepository`. It also provides similar functionality
     * to the inherited `findById(Integer id)` when `categoryId` is the primary key.
     * @param {number} id - The primary key (`categoryId`) of the category to retrieve.
     * @returns {Promise<Category|null>} A promise that resolves to the `Category` object if found, otherwise `null`.
     * @throws {Error} If the provided ID is invalid or a database error occurs during retrieval.
     */
    async getCategoryByCategoryId(id) {
        try {
            if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
                throw new Error('Validation Error: Invalid category ID provided. Must be a positive integer.');
            }
            const category = await CategoryModel.findByPk(id);
            return category ? category.toJSON() : null; // Return plain JSON object for consistency
        } catch (error) {
            console.error(`[CategoryRepository] Error in getCategoryByCategoryId for ID ${id}:`, error.message);
            // Re-throw a more generic error for the caller to handle
            throw new Error(`Failed to retrieve category by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Persists a new `Category` entity or updates an existing one.
     * This method combines the functionality of `save()` from `JpaRepository`.
     * If `categoryData.categoryId` is provided and corresponds to an existing record, it updates that record.
     * If `categoryData.categoryId` is not provided, or if it's provided but the entity doesn't exist
     * (and `categoryId` is auto-increment), it creates a new category.
     * @param {object} categoryData - The data for the category to save.
     * @param {number} [categoryData.categoryId] - The ID of the category if updating an existing one.
     * @param {string} categoryData.name - The name of the category.
     * @returns {Promise<Category>} A promise that resolves to the saved (created or updated) `Category` object.
     * @throws {Error} If the provided category data is invalid or a database error occurs during save/update.
     */
    async save(categoryData) {
        try {
            if (!categoryData || typeof categoryData.name !== 'string' || categoryData.name.trim() === '') {
                throw new Error('Validation Error: Invalid category data provided. Category name is required.');
            }

            let category;
            if (categoryData.categoryId) {
                // Attempt to find and update an existing category
                category = await CategoryModel.findByPk(categoryData.categoryId);
                if (category) {
                    await category.update(categoryData);
                    return category.toJSON();
                } else {
                    // If categoryId is provided but no existing category is found,
                    // and categoryId is auto-increment, we should not attempt to insert with this ID.
                    // Instead, we treat this as an error for an update operation.
                    throw new Error(`Validation Error: Category with ID ${