```javascript
/**
 * @file CategoryService
 * @module services/CategoryService
 * @description Provides business logic and orchestration for Category entities.
 * This service acts as an intermediary between the presentation/controller layer
 * and the data access layer (`CategoryRepository`).
 */

/**
 * Represents a Category entity.
 * @typedef {object} Category
 * @property {number} category_id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {Date} last_update - The timestamp of the last update.
 */

/**
 * @interface ICategoryRepository
 * @description Defines the expected interface for a Category data access repository.
 * This interface ensures that any injected repository provides the necessary methods
 * for Category data operations.
 */
/**
 * @function ICategoryRepository#findAll
 * @returns {Promise<Array<Category>>} A promise that resolves to a list of Category objects.
 */
/**
 * @function ICategoryRepository#getCategoryByCategoryId
 * @param {number} id - The unique identifier of the category.
 * @returns {Promise<Category|null>} A promise that resolves to the Category object if found, otherwise null.
 */

/**
 * `CategoryService` is a typical example of a Node.js service layer component
 * designed to handle business logic related to `Category` entities.
 *
 * It encapsulates business rules, validations, and orchestrates data access
 * operations through the `CategoryRepository`.
 *
 * @class
 */
class CategoryService {
    /**
     * @private
     * @type {ICategoryRepository}
     * @description The injected CategoryRepository instance for data access.
     *   Using a private class field (`#`) for encapsulation, similar to `private final` in Java.
     */
    #categoryRepository;

    /**
     * Creates an instance of `CategoryService`.
     * This constructor is used for **Dependency Injection**.
     * Spring's IoC container equivalent in Node.js would be a custom DI container
     * or simply passing the dependency during instantiation.
     *
     * @param {ICategoryRepository} categoryRepository - The repository for Category data access.
     *   It is expected to implement `findAll()` and `getCategoryByCategoryId(id)` methods.
     * @throws {Error} If `categoryRepository` is not provided or does not implement required methods,
     *   adhering to Node.js best practices for robust dependency handling.
     */
    constructor(categoryRepository) {
        if (!categoryRepository) {
            throw new Error('CategoryService: CategoryRepository is required. Please provide a valid repository instance.');
        }
        // Validate that the injected repository has the expected methods.
        // This ensures the service can rely on its dependencies' contracts.
        if (typeof categoryRepository.findAll !== 'function' || typeof categoryRepository.getCategoryByCategoryId !== 'function') {
            throw new Error('CategoryService: Injected CategoryRepository must implement `findAll` and `getCategoryByCategoryId` methods.');
        }
        this.#categoryRepository = categoryRepository;
    }

    /**
     * Retrieves all `Category` entities available in the data store.
     * It delegates this operation directly to the `findAll()` method of the injected `CategoryRepository`.
     *
     * @returns {Promise<Array<Category>>} A promise that resolves to a list of `Category` objects.
     * @throws {Error} If there is an issue retrieving categories from the repository.
     *   Errors are caught, logged, and re-thrown as application-specific errors for better
     *   error handling at higher layers.
     */
    async getAllCategories() {
        try {
            const categories = await this.#categoryRepository.findAll();
            return categories;
        } catch (error) {
            // Log the original error for debugging purposes
            console.error(`[CategoryService] Error in getAllCategories: ${error.message}`, error);
            // Re-throw a more generic, application-level error to avoid exposing
            // internal data access details to the client.
            throw new Error('Failed to retrieve all categories due to a data access error.');
        }
    }

    /**
     * Retrieves a single `Category` entity based on its unique identifier (`id`).
     * It delegates this operation to the `getCategoryByCategoryId(id)` method of the `CategoryRepository`.
     *
     * @param {number} id - The unique identifier (primary key) of the category.
     * @returns {Promise<Category|null>} A promise that resolves to the `Category` object if found, otherwise `null`.
     * @throws {Error} If an invalid ID is provided or if there is an issue retrieving the category from the repository.
     *   Includes input validation for the `id` parameter as a best practice.
     */
    async getByCategoryId(id) {
        // Input validation: Ensure ID is a positive integer.
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid category ID provided. ID must be a positive integer.');
        }

        try {
            const category = await this.#categoryRepository.getCategoryByCategoryId(id);
            return category;
        } catch (error) {
            // Log the original error for debugging purposes
            console.error(`[CategoryService] Error in getByCategoryId for ID ${id}: ${error.message}`, error);
            // Re-throw a more generic, application-level error.
            throw new Error(`Failed to retrieve category with ID ${id} due to a data access error.`);
        }
    }
}

// Export the service class for use in other modules (e.g., controllers).
// Using ES Modules syntax (export default) is a common Node.js best practice for modern applications.
export default CategoryService;
```