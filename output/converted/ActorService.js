// --- Type Definitions (for JSDoc) ---
/**
 * @typedef {object} Actor
 * @property {number} actorId - The unique identifier for the actor.
 * @property {string} firstName - The first name of the actor.
 * @property {string} lastName - The last name of the actor.
 * @property {Date} [lastUpdate] - The timestamp of the last update (optional, depending on schema).
 */

// --- Custom Error Definitions ---
// In a real-world application, these would typically be in a separate file, e.g., `src/utils/errors.js`
/**
 * @class NotFoundError
 * @extends Error
 * @description Custom error class for resources not found (HTTP 404).
 */
class NotFoundError extends Error {
    /**
     * Creates an instance of NotFoundError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404; // Common HTTP status code for Not Found
    }
}

// --- ActorRepository Interface (for JSDoc and dependency clarity) ---
// This is an interface definition for JSDoc. The actual implementation
// of ActorRepository would be a separate class that interacts with a database.
/**
 * @interface ActorRepository
 * @description Defines the contract for data access operations related to Actor entities.
 *              Methods are expected to return Promises.
 */
class ActorRepository {
    /**
     * Finds all actors in the data store.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     */
    async findAll() {
        throw new Error('Method "findAll" must be implemented by ActorRepository.');
    }

    /**
     * Finds an actor by their unique ID.
     * @param {number} id - The ID of the actor.
     * @returns {Promise<Actor|null>} A promise that resolves to an Actor object or null if not found.
     */
    async findById(id) {
        throw new Error('Method "findById" must be implemented by ActorRepository.');
    }

    /**
     * Finds actors by their first and last name.
     * @param {string} firstName - The first name to search for.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     */
    async findByFirstNameAndLastName(firstName, lastName) {
        throw new Error('Method "findByFirstNameAndLastName" must be implemented by ActorRepository.');
    }

    /**
     * Finds actors by their first name.
     * @param {string} firstName - The first name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     */
    async findByFirstName(firstName) {
        throw new Error('Method "findByFirstName" must be implemented by ActorRepository.');
    }

    /**
     * Finds actors by their last name.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     */
    async findByLastName(lastName) {
        throw new Error('Method "findByLastName" must be implemented by ActorRepository.');
    }
}


// --- ActorService Class ---
/**
 * @class ActorService
 * @description Encapsulates business logic related to Actor entities.
 *              It acts as an intermediary between the presentation layer (e.g., a controller)
 *              and the data access layer (ActorRepository).
 */
class ActorService {
    /**
     * @private
     * @type {ActorRepository}
     */
    actorRepository;

    /**
     * Creates an instance of ActorService.
     * This constructor uses Dependency Injection to receive the ActorRepository.
     * @param {ActorRepository} actorRepository - The repository for Actor data access.
     * @throws {Error} If actorRepository is not provided, ensuring proper initialization.
     */
    constructor(actorRepository) {
        if (!actorRepository) {
            throw new Error('ActorRepository must be provided to ActorService.');
        }
        this.actorRepository = actorRepository;
    }

    /**
     * Retrieves a list of all Actor entities from the data store.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getAllActors() {
        try {
            const actors = await this.actorRepository.findAll();
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error retrieving all actors: ${error.message}`);
            // Re-throw a more generic error to the caller, hiding internal details
            throw new Error('Failed to retrieve all actors due to a server error.');
        }
    }

    /**
     * Retrieves a single Actor entity based on its unique `actorId`.
     * @param {number} id - The unique identifier of the actor.
     * @returns {Promise<Actor>} A promise that resolves to an Actor object.
     * @throws {Error} If the provided ID is invalid.
     * @throws {NotFoundError} If no actor is found with the given ID.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorByID(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid actor ID provided. ID must be a positive integer.');
        }

        try {
            // Assuming the repository method is `findById` for Node.js convention
            const actor = await this.actorRepository.findById(id);
            if (!actor) {
                throw new NotFoundError(`Actor with ID ${id} not found.`);
            }
            return actor;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Re-throw specific not found error
            }
            console.error(`[ActorService] Error retrieving actor by ID ${id}: ${error.message}`);
            throw new Error(`Failed to retrieve actor with ID ${id} due to a server error.`);
        }
    }

    /**
     * Retrieves a list of Actor entities that match both the provided first name and last name.
     * @param {string} firstName - The first name to search for.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     * @throws {Error} If first name or last name are invalid.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorsByFullName(firstName, lastName) {
        if (typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('First name must be a non-empty string.');
        }
        if (typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('Last name must be a non-empty string.');
        }

        try {
            // Assuming the repository method is `findByFirstNameAndLastName` for Node.js convention
            const actors = await this.actorRepository.findByFirstNameAndLastName(firstName, lastName);
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error retrieving actors by full name (${firstName} ${lastName}): ${error.message}`);
            throw new Error(`Failed to retrieve actors by full name ${firstName} ${lastName} due to a server error.`);
        }
    }

    /**
     * Retrieves a list of Actor entities that match the provided first name.
     * @param {string} firstName - The first name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     * @throws {Error} If the first name is invalid.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorsByFirstName(firstName) {
        if (typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('First name must be a non-empty string.');
        }

        try {
            // Assuming the repository method is `findByFirstName` for Node.js convention
            const actors = await this.actorRepository.findByFirstName(firstName);
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error retrieving actors by first name (${firstName}): ${error.message}`);
            throw new Error(`Failed to retrieve actors by first name ${firstName} due to a server error.`);
        }
    }

    /**
     * Retrieves a list of Actor entities that match the provided last name.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     * @throws {Error} If the last name is invalid.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorsByLastName(lastName) {
        if (typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('Last name must be a non-empty string.');
        }

        try {
            // Assuming the repository method is `findByLastName` for Node.js convention
            const actors = await this.actorRepository.findByLastName(lastName);
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error retrieving actors by last name (${lastName}): ${error.message}`);
            throw new Error(`Failed to retrieve actors by last name ${lastName} due to a server error.`);
        }
    }

    /**
     * Retrieves the full name of an Actor based on their unique `actorId`.
     * This method demonstrates a simple business operation by combining data from an existing method.
     * @param {number} id - The unique identifier of the actor.
     * @returns {Promise<string>} A promise that resolves to the full name (e.g., "John Doe").
     * @throws {Error} If the provided ID is invalid.
     * @throws {NotFoundError} If no actor is found with the given ID.
     * @throws {Error} If an unexpected error occurs during data retrieval or name construction.
     */
    async getActorFullNameFromID(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid actor ID provided. ID must be a positive integer.');
        }

        try {
            // Reusing the service's own method to retrieve the actor
            const actor = await this.getActorByID(id); // This method already handles NotFoundError

            // Assuming actor properties are directly accessible (e.g., actor.firstName)
            // If Actor was a class with getters, it would be actor.getFirstName()
            return `${actor.firstName} ${actor.lastName}`;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Re-throw specific not found error from getActorByID
            }
            console.error(`[ActorService] Error getting full name for actor ID ${id}: ${error.message}`);
            throw new Error(`Failed to get full name for actor with ID ${id} due to a server error.`);
        }
    }
}

// Export the service and custom error for use in other modules
// In a real project, NotFoundError might be exported from a separate errors.js file.
export { ActorService, NotFoundError, ActorRepository };