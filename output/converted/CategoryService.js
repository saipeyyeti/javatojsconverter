/**
 * @module services/CategoryService
 * @description This module provides the CategoryService class, a business logic layer for Category entities.
 */

/**
 * @typedef {object} Category
 * @property {number} categoryId - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {Date} lastUpdate - The timestamp of the last update.
 * // Add other properties of your Category entity as needed
 */

/**
 * @interface CategoryRepository
 * @description Defines the contract for data access operations related to Category entities.
 *              This interface is conceptual; in a real application, it would be implemented
 *              by a class interacting with a database (e.g., using an ORM like Sequelize, TypeORM, Mongoose).
 */
/**
 * @function findAll
 * @memberof CategoryRepository
 * @returns {Promise<Array<Category>>} A promise that resolves to a list of all categories.
 */
/**
 * @function getCategoryByCategoryId
 * @memberof CategoryRepository
 * @param {number} id - The unique identifier of the category.
 * @returns {Promise<Category|null>} A promise that resolves to the category with the given ID, or null if not found.
 */

/**
 * @class CategoryService
 * @description
 * Represents a service layer component for handling business logic related to `Category` entities.
 * This class acts as an intermediary between the presentation/controller layer and the data access layer,
 * encapsulating business operations, orchestrating data retrieval, and providing a clean API.
 *
 * It adheres to the Service Layer pattern, promoting separation of concerns and maintainability.
 * Dependency Injection is used to provide the `CategoryRepository` instance.
 */
class CategoryService {
    /**
     * @private
     * @type {CategoryRepository}
     * @description The repository instance responsible for data access operations for `Category` entities.
     *              It is initialized via constructor dependency injection and is immutable.
     */
    _categoryRepository;

    /**
     * Creates an instance of `CategoryService`.
     * This constructor is used for Dependency Injection, where Spring's IoC container (or a similar
     * mechanism in Node.js) would automatically provide an instance of `CategoryRepository`.
     *
     * @param {CategoryRepository} categoryRepository - An instance of the `CategoryRepository`
     *                                                  that the service will use for data access.
     * @throws {Error} If `categoryRepository` is not provided, indicating a misconfiguration.
     */
    constructor(categoryRepository) {
        if (!categoryRepository) {
            throw new Error('CategoryService requires a CategoryRepository instance.');
        }
        this._categoryRepository = categoryRepository;
    }

    /**
     * Retrieves all `Category` entities available in the data store.
     * This method delegates the data retrieval operation directly to the `categoryRepository.findAll()` method.
     *
     * @returns {Promise<Array<Category>>} A promise that resolves to a list of all `Category` entities.
     * @throws {Error} If an error occurs during the data retrieval process, providing a user-friendly message.
     */
    async getAllCategories() {
        try {
            // Delegate to the repository to fetch all categories
            const categories = await this._categoryRepository.findAll();
            return categories;
        } catch (error) {
            console.error(`[CategoryService] Error fetching all categories: ${error.message}`);
            // Re-throw a new error with a generic message to avoid exposing internal database errors
            throw new Error('Failed to retrieve all categories due to a server error.');
        }
    }

    /**
     * Retrieves a single `Category` entity based on its unique `categoryId`.
     * This method delegates the operation to a custom method `categoryRepository.getCategoryByCategoryId(id)`.
     *
     * @param {number} id - The unique identifier (`categoryId`) of the category to retrieve.
     * @returns {Promise<Category|null>} A promise that resolves to the `Category` entity if found,
     *                                    otherwise `null` if no category matches the given ID.
     * @throws {Error} If the provided `id` is invalid (not a positive number).
     * @throws {Error} If an error occurs during the data retrieval process, providing a user-friendly message.
     */
    async getByCategoryId(id) {
        // Basic input validation for the ID
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid category ID provided. ID must be a positive integer.');
        }

        try {
            // Delegate to the repository to fetch a category by its ID
            const category = await this._categoryRepository.getCategoryByCategoryId(id);
            return category;
        } catch (error) {
            console.error(`[CategoryService] Error fetching category by ID ${id}: ${error.message}`);
            // Re-throw a new error with a generic message to avoid exposing internal database errors
            throw new Error(`Failed to retrieve category with ID ${id} due to a server error.`);
        }
    }
}

export default CategoryService;