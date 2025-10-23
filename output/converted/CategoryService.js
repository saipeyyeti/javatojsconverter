```javascript
// category.service.js

/**
 * @typedef {object} Category
 * @property {number} categoryId - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {Date} lastUpdate - The timestamp of the last update.
 * // Add any other properties of the Category entity as defined in your Java Category class.
 */

/**
 * Represents a base error specifically from the CategoryService.
 * This class extends the native Error object and adds a statusCode property.
 * @extends Error
 */
class CategoryServiceError extends Error {
  /**
   * Creates an instance of CategoryServiceError.
   * @param {string} message - The error message.
   * @param {number} [statusCode=500] - The HTTP status code associated with the error.
   *   Defaults to 500 (Internal Server Error) if not specified.
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'CategoryServiceError';
    this.statusCode = statusCode;
    // Capturing the stack trace helps with debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CategoryServiceError);
    }
  }
}

/**
 * Represents an error when a requested category is not found.
 * This error typically corresponds to an HTTP 404 Not Found status.
 * @extends CategoryServiceError
 */
class CategoryNotFoundError extends CategoryServiceError {
  /**
   * Creates an instance of CategoryNotFoundError.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super(message, 404);
    this.name = 'CategoryNotFoundError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CategoryNotFoundError);
    }
  }
}

/**
 * CategoryService handles business logic related to Category entities.
 * It acts as an intermediary layer between higher-level components (e.g., controllers)
 * and the data access layer (CategoryRepository). This service encapsulates
 * business rules, validation, and orchestrates data retrieval operations.
 */
class CategoryService {
  /**
   * Creates an instance of CategoryService.
   * This constructor uses Dependency Injection to receive a CategoryRepository instance.
   * @param {object} categoryRepository - An instance of a repository class
   *   that provides methods for interacting with Category data. It is expected
   *   to have asynchronous methods like `findAll()` and `findById(id)`.
   * @throws {CategoryServiceError} If the categoryRepository dependency is missing.
   */
  constructor(categoryRepository) {
    if (!categoryRepository) {
      throw new CategoryServiceError('CategoryRepository dependency is missing. Cannot initialize CategoryService.', 500);
    }
    // Ensure the repository has expected methods for better robustness
    if (typeof categoryRepository.findAll !== 'function' || typeof categoryRepository.findById !== 'function') {
      console.warn('CategoryRepository might be missing expected methods (findAll, findById).');
    }
    this.categoryRepository = categoryRepository;
  }

  /**
   * Retrieves a list of all Category entities from the database.
   * This method delegates the data retrieval to the injected CategoryRepository.
   * @returns {Promise<Category[]>} A promise that resolves to an array of Category objects.
   * @throws {CategoryServiceError} If an underlying error occurs during data retrieval
   *   (e.g., database connection issues, repository errors).
   */
  async getAllCategories() {
    try {
      const categories = await this.categoryRepository.findAll();
      // In a real application, you might add business logic here,
      // e.g., filtering, sorting, or transforming the data before returning.
      return categories;
    } catch (error) {
      // Log the original error for debugging purposes
      console.error(`[CategoryService] Error fetching all categories: ${error.message}`, error);
      // Re-throw a service-specific error to abstract repository details
      throw new CategoryServiceError('Failed to retrieve all categories due to an internal error.', 500);
    }
  }

  /**
   * Retrieves a single Category entity based on its unique categoryId.
   * This method performs input validation and delegates to the CategoryRepository.
   * @param {number} id - The unique identifier of the category to retrieve.
   * @returns {Promise<Category>} A promise that resolves to a Category object.
   * @throws {CategoryServiceError} If the provided ID is invalid (e.g., not a number).
   * @throws {CategoryNotFoundError} If no category is found with the given ID.
   * @throws {CategoryServiceError} If an underlying error occurs during data retrieval.
   */
  async getByCategoryId(id) {
    // Input validation
    if (id === null || id === undefined || typeof id !== 'number' || isNaN(id) || id <= 0) {
      throw new CategoryServiceError('Invalid category ID provided. ID must be a positive number.', 400);
    }

    try {
      // Delegate to the repository to find the category by ID
      const category = await this.categoryRepository.findById(id);

      // If no category is found, throw a specific Not Found error
      if (!category) {
        throw new CategoryNotFoundError(`Category with ID ${id} not found.`);
      }

      // In a real application, you might add business logic here,
      // e.g., checking user permissions for this specific category.
      return category;
    } catch (error) {
      // Re-throw specific errors (like Not Found) without wrapping them
      if (error instanceof CategoryNotFoundError) {
        throw error;
      }
      // Log the original error for debugging purposes
      console.error(`[CategoryService] Error fetching category with ID ${id}: ${error.message}`, error);
      // Re-throw a generic service error for other issues
      throw new CategoryServiceError(`Failed to retrieve category with ID ${id} due to an internal error.`, 500);
    }
  }
}

// Export the service and custom error classes for use in other modules
export { CategoryService, CategoryServiceError, CategoryNotFoundError };
```