```javascript
// --- Custom Error Definitions ---

/**
 * @class NotFoundError
 * @extends Error
 * @description Custom error class for when a requested resource is not found.
 *              It includes a `statusCode` property for easier handling in HTTP contexts.
 */
class NotFoundError extends Error {
  /**
   * Creates an instance of NotFoundError.
   * @param {string} message - The error message describing what was not found.
   */
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404; // Standard HTTP status code for Not Found
  }
}

/**
 * @class ValidationError
 * @extends Error
 * @description Custom error class for when input validation fails.
 *              It includes a `statusCode` property for easier handling in HTTP contexts.
 */
class ValidationError extends Error {
  /**
   * Creates an instance of ValidationError.
   * @param {string} message - The error message describing the validation failure.
   */
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400; // Standard HTTP status code for Bad Request
  }
}

// --- Actor Entity Type Definition (for JSDoc clarity) ---

/**
 * @typedef {object} Actor
 * @property {number} actorId - The unique identifier for the actor.
 * @property {string} firstName - The first name of the actor.
 * @property {string} lastName - The last name of the actor.
 * @property {Date} [lastUpdate] - The timestamp of the last update (optional, depending on ORM).
 */

// --- ActorRepository Interface (for JSDoc clarity and dependency expectation) ---
// This section defines the expected interface for the ActorRepository dependency.
// In a real application, this would be an actual class (e.g., using an ORM like Sequelize or TypeORM)
// that implements these methods, returning Promises.

/**
 * @interface ActorRepository
 * @description Represents the data access layer for Actor entities.
 *              Methods are expected to return Promises, reflecting asynchronous database operations.
 */
/**
 * @function ActorRepository#findAll
 * @returns {Promise<Actor[]>} A promise that resolves to a list of all Actor entities.
 */
/**
 * @function ActorRepository#findByActorId
 * @param {number} id - The ID of the actor to find.
 * @returns {Promise<Actor|null>} A promise that resolves to the Actor entity or `null` if not found.
 */
/**
 * @function ActorRepository#findByFirstNameAndLastName
 * @param {string} firstName - The first name to search for.
 * @param {string} lastName - The last name to search for.
 * @returns {Promise<Actor[]>} A promise that resolves to a list of Actor entities matching both names.
 */
/**
 * @function ActorRepository#findByFirstName
 * @param {string} firstName - The first name to search for.
 * @returns {Promise<Actor[]>} A promise that resolves to a list of Actor entities matching the first name.
 */
/**
 * @function ActorRepository#findByLastName
 * @param {string} lastName - The last name to search for.
 * @returns {Promise<Actor[]>} A promise that resolves to a list of Actor entities matching the last name.
 */


// --- ActorService Class ---

/**
 * @class ActorService
 * @description A service layer component designed to handle business logic and data retrieval for Actor entities.
 *              It acts as an intermediary between the presentation layer (e.g., a REST controller)
 *              and the data access layer (ActorRepository). This class embodies the Service Layer pattern,
 *              Dependency Injection, and implicitly acts as a Facade over the repository.
 */
class ActorService {
  /**
   * @private
   * @type {ActorRepository}
   * @description The data access layer for Actor entities, injected via the constructor.
   */
  #actorRepository; // Using private class fields (ES2019+) for encapsulation

  /**
   * Creates an instance of ActorService.
   * This constructor uses Dependency Injection to receive its data access layer.
   * @param {ActorRepository} actorRepository - An instance of the ActorRepository for data access.
   *                                            This is a required dependency.
   * @throws {Error} If `actorRepository` is not provided.
   */
  constructor(actorRepository) {
    if (!actorRepository) {
      throw new Error('ActorRepository must be provided to ActorService during instantiation.');
    }
    this.#actorRepository = actorRepository;
  }

  /**
   * Retrieves all Actor entities from the database.
   * @returns {Promise<Actor[]>} A promise that resolves to a list of all Actor entities.
   *                              Returns an empty array if no actors are found.
   * @throws {Error} If an unexpected error occurs during data retrieval from the repository.
   */
  async getAllActors() {
    try {
      return await this.#actorRepository.findAll();
    } catch (error) {
      console.error('Error in ActorService.getAllActors:', error);
      // Re-throw a generic error to the caller, hiding internal repository details
      throw new Error('Failed to retrieve all actors due to a server error.');
    }
  }

  /**
   * Retrieves a single Actor entity based on its unique `actorId`.
   * @param {number} id - The unique identifier of the actor. Must be a positive number.
   * @returns {Promise<Actor>} A promise that resolves to the found Actor entity.
   * @throws {ValidationError} If the provided `id` is invalid.
   * @throws {NotFoundError} If no actor is found with the given ID.
   * @throws {Error} If an unexpected error occurs during data retrieval from the repository.
   */
  async getActorByID(id) {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid actor ID provided. ID must be a positive integer.');
    }
    try {
      const actor = await this.#actorRepository.findByActorId(id);
      if (!actor) {
        throw new NotFoundError(`Actor with ID ${id} not found.`);
      }
      return actor;
    } catch (error) {
      // Re-throw specific errors (ValidationError, NotFoundError) directly
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error(`Error in ActorService.getActorByID for ID ${id}:`, error);
      // Re-throw a generic error for other issues
      throw new Error(`Failed to retrieve actor with ID ${id} due to a server error.`);
    }
  }

  /**
   * Retrieves a list of Actor entities that match both the given first name and last name.
   * @param {string} firstName - The first name to search for. Must be a non-empty string.
   * @param {string} lastName - The last name to search for. Must be a non-empty string.
   * @returns {Promise<Actor[]>} A promise that resolves to a list of matching Actor entities.
   *                              Returns an empty array if no actors match.
   * @throws {ValidationError} If `firstName` or `lastName` are invalid.
   * @throws {Error} If an unexpected error occurs during data retrieval from the repository.
   */
  async getActorsByFullName(firstName, lastName) {
    if (typeof firstName !== 'string' || firstName.trim() === '') {
      throw new ValidationError('Invalid first name provided. First name cannot be empty.');
    }
    if (typeof lastName !== 'string' || lastName.trim() === '') {
      throw new ValidationError('Invalid last name provided. Last name cannot be empty.');
    }
    try {
      return await this.#actorRepository.findByFirstNameAndLastName(firstName, lastName);
    } catch (error) {
      // Re-throw ValidationError directly
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error(`Error in ActorService.getActorsByFullName for ${firstName} ${lastName}:`, error);
      throw new Error(`Failed to retrieve actors by full name '${firstName} ${lastName}' due to a server error.`);
    }
  }

  /**
   * Retrieves a list of Actor entities that match the given first name.
   * @param {string} firstName - The first name to search for. Must be a non-empty string.
   * @returns {Promise<Actor[]>} A promise that resolves to a list of matching Actor entities.
   *                              Returns an empty array if no actors match.
   * @throws {ValidationError} If `firstName` is invalid.
   * @throws {Error} If an unexpected error occurs during data retrieval from the repository.
   */
  async getActorsByFirstName(firstName) {
    if (typeof firstName !== 'string' || firstName.trim() === '') {
      throw new ValidationError('Invalid first name provided. First name cannot be empty.');
    }
    try {
      return await this.#actorRepository.findByFirstName(firstName);
    } catch (error) {
      // Re-throw ValidationError directly
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error(`Error in ActorService.getActorsByFirstName for '${firstName}':`, error);
      throw new Error(`Failed to retrieve actors by first name '${firstName}' due to a server error.`);
    }
  }

  /**
   * Retrieves a list of Actor entities that match the given last name.
   * @param {string} lastName - The last name to search for. Must be a non-empty string.
   * @returns {Promise<Actor[]>} A promise that resolves to a list of matching Actor entities.
   *                              Returns an empty array if no actors match.
   * @throws {ValidationError} If `lastName` is invalid.
   * @throws {Error} If an unexpected error occurs during data retrieval from the repository.
   */
  async getActorsByLastName(lastName) {
    if (typeof lastName !== 'string' || lastName.trim() === '') {
      throw new ValidationError('Invalid last name provided. Last name cannot be empty.');
    }
    try {
      return await this.#actorRepository.findByLastName(lastName);
    } catch (error) {
      // Re-throw ValidationError directly
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error(`Error in ActorService.getActorsByLastName for '${lastName}':`, error);
      throw new Error(`Failed to retrieve actors by last name '${lastName}' due to a server error.`);
    }
  }

  /**
   * Retrieves an Actor by ID and constructs their full name.
   * This method demonstrates a simple business operation by combining first and last names,
   * reusing existing service logic (`getActorByID`).
   * @param {number} id - The unique identifier of the actor. Must be a positive number.
   * @returns {Promise<string>} A promise that resolves to the full name of the actor (e.g., "John Doe").
   * @throws {ValidationError} If the provided `id` is invalid.
   * @throws {NotFoundError} If no actor is found with the given ID (propagated from `getActorByID`).
   * @throws {Error} If an unexpected error occurs during data retrieval or name construction.
   */
  async getActorFullNameFromID(id) {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid actor ID provided. ID must be a positive integer.');
    }
    try {
      // Reusing existing service logic to get the actor, promoting code reusability
      const actor = await this.getActorByID(id);
      return `${actor.firstName} ${actor.lastName}`;
    } catch (error) {
      // Re-throw specific errors (ValidationError, NotFoundError) directly
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error(`Error in ActorService.getActorFullNameFromID for ID ${id}:`, error);
      throw new Error(`Failed to get full name for actor with ID ${id} due to a server error.`);
    }
  }
}

// Export the service and custom error classes for use in other modules
module.exports = { ActorService, NotFoundError, ValidationError };
```