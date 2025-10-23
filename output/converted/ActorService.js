```javascript
/**
 * @typedef {object} Actor
 * @property {number} actorId - The unique ID of the actor.
 * @property {string} firstName - The first name of the actor.
 * @property {string} lastName - The last name of the actor.
 * // Add other properties of the Actor entity as needed, e.g.:
 * // @property {Date} lastUpdate - The timestamp of the last update.
 */

/**
 * Custom error class for when an actor is not found.
 * This provides a specific error type that can be caught and handled
 * differently from general application errors (e.g., returning a 404 HTTP status).
 * @extends Error
 */
class ActorNotFoundError extends Error {
    /**
     * Creates an instance of ActorNotFoundError.
     * @param {string} [message="Actor not found"] - The error message.
     */
    constructor(message = "Actor not found") {
        super(message);
        this.name = "ActorNotFoundError";
        this.statusCode = 404; // Common HTTP status code for Not Found
    }
}

/**
 * @class ActorService
 * @description
 * This service layer component handles business logic related to the Actor entity.
 * It acts as an intermediary between the controller layer and the data access layer (ActorRepository).
 * All methods are asynchronous, reflecting typical Node.js database interactions.
 */
class ActorService {
    /**
     * @private
     * @type {object}
     * @description The repository for Actor data access.
     *              It is expected to provide asynchronous methods like:
     *              - `findAll(): Promise<Actor[]>`
     *              - `getActorByActorId(id: number): Promise<Actor | null>`
     *              - `findActorsByFirstNameAndLastName(firstName: string, lastName: string): Promise<Actor[]>`
     *              - `findActorsByFirstName(firstName: string): Promise<Actor[]>`
     *              - `findActorsByLastName(lastName: string): Promise<Actor[]>`
     */
    actorRepository;

    /**
     * Creates an instance of ActorService.
     * This constructor uses Dependency Injection to receive the ActorRepository.
     * @param {object} actorRepository - An instance of the ActorRepository for data access.
     *                                   This is typically injected (e.g., by a DI container or manually).
     * @throws {Error} If `actorRepository` is not provided.
     */
    constructor(actorRepository) {
        if (!actorRepository) {
            throw new Error("ActorRepository must be provided to ActorService.");
        }
        this.actorRepository = actorRepository;
    }

    /**
     * Retrieves a list of all Actor entities from the database.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of Actor objects.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getAllActors() {
        try {
            const actors = await this.actorRepository.findAll();
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error in getAllActors: ${error.message}`);
            // Re-throw a generic error to the caller, masking internal repository details
            throw new Error("Failed to retrieve all actors due to an internal service error.");
        }
    }

    /**
     * Retrieves a single Actor entity based on its unique `actorId`.
     * @param {number} id - The unique ID of the actor.
     * @returns {Promise<Actor>} A promise that resolves to the Actor object.
     * @throws {Error} If the provided ID is invalid.
     * @throws {ActorNotFoundError} If no actor is found with the given ID.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorByID(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid actor ID provided. ID must be a positive integer.");
        }

        try {
            const actor = await this.actorRepository.getActorByActorId(id);
            if (!actor) {
                throw new ActorNotFoundError(`Actor with ID ${id} not found.`);
            }
            return actor;
        } catch (error) {
            // Re-throw specific business errors (like ActorNotFoundError)
            if (error instanceof ActorNotFoundError) {
                throw error;
            }
            console.error(`[ActorService] Error in getActorByID for ID ${id}: ${error.message}`);
            throw new Error(`Failed to retrieve actor with ID ${id} due to an internal service error.`);
        }
    }

    /**
     * Retrieves a list of Actor entities that match both the provided first name and last name.
     * @param {string} firstName - The first name to search for.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of matching Actor objects.
     * @throws {Error} If the provided names are invalid.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorsByFullName(firstName, lastName) {
        if (typeof firstName !== 'string' || firstName.trim() === '' ||
            typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error("First name and last name must be non-empty strings.");
        }

        try {
            const actors = await this.actorRepository.findActorsByFirstNameAndLastName(firstName, lastName);
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error in getActorsByFullName for ${firstName} ${lastName}: ${error.message}`);
            throw new Error(`Failed to retrieve actors by full name '${firstName} ${lastName}' due to an internal service error.`);
        }
    }

    /**
     * Retrieves a list of Actor entities that match the provided first name.
     * @param {string} firstName - The first name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of matching Actor objects.
     * @throws {Error} If the provided first name is invalid.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorsByFirstName(firstName) {
        if (typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error("First name must be a non-empty string.");
        }

        try {
            const actors = await this.actorRepository.findActorsByFirstName(firstName);
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error in getActorsByFirstName for ${firstName}: ${error.message}`);
            throw new Error(`Failed to retrieve actors by first name '${firstName}' due to an internal service error.`);
        }
    }

    /**
     * Retrieves a list of Actor entities that match the provided last name.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Actor[]>} A promise that resolves to an array of matching Actor objects.
     * @throws {Error} If the provided last name is invalid.
     * @throws {Error} If an unexpected error occurs during data retrieval.
     */
    async getActorsByLastName(lastName) {
        if (typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error("Last name must be a non-empty string.");
        }

        try {
            const actors = await this.actorRepository.findActorsByLastName(lastName);
            return actors;
        } catch (error) {
            console.error(`[ActorService] Error in getActorsByLastName for ${lastName}: ${error.message}`);
            throw new Error(`Failed to retrieve actors by last name '${lastName}' due to an internal service error.`);
        }
    }

    /**
     * Retrieves an Actor by their ID and then constructs their full name.
     * This method demonstrates a simple business operation by combining data
     * retrieved from the data access layer.
     * @param {number} id - The unique ID of the actor.
     * @returns {Promise<string>} A promise that resolves to the full name of the actor (e.g., "First Last").
     * @throws {Error} If the provided ID is invalid.
     * @throws {ActorNotFoundError} If no actor is found with the given ID.
     * @throws {Error} If an unexpected error occurs during data retrieval or name construction.
     */
    async getActorFullNameFromID(id) {
        // Reuses the existing getActorByID method, which already handles ID validation
        // and throws ActorNotFoundError if the actor is not found.
        try {
            const actor = await this.getActorByID(id);
            // Ensure actor has firstName and lastName properties before accessing
            if (!actor || typeof actor.firstName !== 'string' || typeof actor.lastName !== 'string') {
                throw new Error(`Actor data for ID ${id} is incomplete or malformed.`);
            }
            return `${actor.firstName} ${actor.lastName}`;
        } catch (error) {
            // Re-throw specific business errors or wrap other errors
            if (error instanceof ActorNotFoundError || error instanceof Error && error.message.includes("Invalid actor ID")) {
                throw error; // Re-throw validation or not-found errors directly
            }
            console.error(`[ActorService] Error in getActorFullNameFromID for ID ${id}: ${error.message}`);
            throw new Error(`Failed to get full name for actor with ID ${id} due to an internal service error.`);
        }
    }
}

// Export the service and the custom error for use in other modules
module.exports = { ActorService, ActorNotFoundError };
```