/**
 * @typedef {object} Film
 * @property {number} [filmId] - The unique identifier for the film. Optional for new films.
 * @property {string} title - The title of the film.
 * @property {string} description - A brief description of the film.
 * @property {number} releaseYear - The year the film was released.
 * @property {number} languageId - The ID of the language the film is in.
 * @property {number} rentalDuration - The rental duration in days.
 * @property {number} rentalRate - The rental rate per day.
 * @property {number} length - The length of the film in minutes.
 * @property {number} replacementCost - The replacement cost of the film.
 * @property {string} rating - The MPAA rating of the film (e.g., 'G', 'PG', 'PG-13', 'R', 'NC-17').
 * @property {string} specialFeatures - Special features included with the film (e.g., 'Trailers', 'Commentaries').
 * @property {Date} lastUpdate - The timestamp of the last update.
 * // Add other properties as they exist in your Film entity
 */

/**
 * @interface FilmRepository
 * Represents the data access layer for Film entities.
 * All methods are expected to be asynchronous and return Promises.
 * This is a conceptual interface for JSDoc; actual implementation would be a class.
 */
class FilmRepository {
    /**
     * Retrieves all Film entities.
     * @returns {Promise<Film[]>} A promise that resolves to an array of Film objects.
     */
    async findAllFilms() { throw new Error('Method not implemented.'); }

    /**
     * Retrieves a single Film entity by its ID.
     * @param {number} id - The unique identifier of the film.
     * @returns {Promise<Film|null>} A promise that resolves to a Film object if found, otherwise null.
     */
    async findFilmById(id) { throw new Error('Method not implemented.'); }

    /**
     * Retrieves Film entities by title.
     * @param {string} title - The title or part of the title to search for.
     * @returns {Promise<Film[]>} A promise that resolves to an array of matching Film objects.
     */
    async findFilmsByTitle(title) { throw new Error('Method not implemented.'); }

    /**
     * Retrieves Film entities that are considered "available".
     * @returns {Promise<Film[]>} A promise that resolves to an array of available Film objects.
     */
    async findAvailableFilms() { throw new Error('Method not implemented.'); }

    /**
     * Retrieves the count of available films associated with a given ID.
     * @param {number} id - The ID to filter available film count by (e.g., category ID, actor ID).
     * @returns {Promise<number>} A promise that resolves to the count of available films.
     */
    async countAvailableFilms(id) { throw new Error('Method not implemented.'); }

    /**
     * Retrieves Film entities belonging to a specific category.
     * @param {number} id - The unique identifier of the category.
     * @returns {Promise<Film[]>} A promise that resolves to an array of Film objects in the specified category.
     */
    async findFilmsByCategory(id) { throw new Error('Method not implemented.'); }

    /**
     * Retrieves Film entities featuring a specific actor.
     * @param {number} id - The unique identifier of the actor.
     * @returns {Promise<Film[]>} A promise that resolves to an array of Film objects featuring the specified actor.
     */
    async findFilmsByActor(id) { throw new Error('Method not implemented.'); }

    /**
     * Persists a Film entity to the database. Handles both creating new films and updating existing ones.
     * @param {Film} film - The Film object to save.
     * @returns {Promise<Film>} A promise that resolves to the saved/updated Film object.
     */
    async saveFilm(film) { throw new Error('Method not implemented.'); }

    /**
     * Deletes a Film entity from the database by its ID.
     * @param {number} id - The unique identifier of the film to delete.
     * @returns {Promise<void>} A promise that resolves when the film is successfully deleted.
     */
    async deleteFilmById(id) { throw new Error('Method not implemented.'); }
}

/**
 * @class FilmService
 * @description
 * Service layer component for managing Film entities.
 * Encapsulates business logic and acts as an intermediary between
 * the presentation layer (e.g., a Controller) and the data access layer (FilmRepository).
 * It handles data orchestration, potential transaction management, and decouples
 * the presentation layer from direct data access concerns.
 */
class FilmService {
    /**
     * @private
     * @type {FilmRepository}
     */
    filmRepository;

    /**
     * Creates an instance of FilmService.
     * @param {FilmRepository} filmRepository - The data access repository for Film entities.
     *                                          This dependency is injected, promoting loose coupling.
     * @throws {Error} If `filmRepository` is not provided.
     */
    constructor(filmRepository) {
        if (!filmRepository) {
            throw new Error('FilmService: FilmRepository dependency is required.');
        }
        this.filmRepository = filmRepository;
    }

    /**
     * Retrieves a list of all Film entities from the database.
     * @returns {Promise<Film[]>} A promise that resolves to an array of Film objects.
     * @throws {Error} If an error occurs during data retrieval from the repository.
     */
    async getAllFilms() {
        try {
            return await this.filmRepository.findAllFilms();
        } catch (error) {
            console.error(`[FilmService] Error in getAllFilms: ${error.message}`, error);
            throw new Error('Failed to retrieve all films due to a service error.');
        }
    }

    /**
     * Retrieves a single Film entity based on its unique `filmId`.
     * @param {number} id - The unique identifier of the film. Must be a positive integer.
     * @returns {Promise<Film|null>} A promise that resolves to a Film object if found, otherwise `null`.
     * @throws {Error} If the provided ID is invalid or an error occurs during data retrieval.
     */
    async getFilmByID(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid film ID provided. ID must be a positive integer.');
        }
        try {
            return await this.filmRepository.findFilmById(id);
        } catch (error) {
            console.error(`[FilmService] Error in getFilmByID(${id}): ${error.message}`, error);
            throw new Error(`Failed to retrieve film with ID: ${id}.`);
        }
    }

    /**
     * Retrieves a list of Film entities whose titles match the given string.
     * The matching logic (e.g., exact, partial, case-insensitive) is handled by the repository.
     * @param {string} title - The title or part of the title to search for. Must be a non-empty string.
     * @returns {Promise<Film[]>} A promise that resolves to an array of matching Film objects.
     * @throws {Error} If the provided title is invalid or an error occurs during data retrieval.
     */
    async getFilmsByTitle(title) {
        if (typeof title !== 'string' || title.trim() === '') {
            throw new Error('Invalid film title provided. Title must be a non-empty string.');
        }
        try {
            return await this.filmRepository.findFilmsByTitle(title);
        } catch (error) {
            console.error(`[FilmService] Error in getFilmsByTitle("${title}"): ${error.message}`, error);
            throw new Error(`Failed to retrieve films by title: "${title}".`);
        }
    }

    /**
     * Retrieves a list of Film entities that are considered "available".
     * The definition of "available" is encapsulated within the `FilmRepository`.
     * @returns {Promise<Film[]>} A promise that resolves to an array of available Film objects.
     * @throws {Error} If an error occurs during data retrieval.
     */
    async getAvailableFilms() {
        try {
            return await this.filmRepository.findAvailableFilms();
        } catch (error) {
            console.error(`[FilmService] Error in getAvailableFilms: ${error.message}`, error);
            throw new Error('Failed to retrieve available films.');
        }
    }

    /**
     * Retrieves the count of available films associated with a given ID.
     * This ID could represent a category, actor, or another related entity,
     * depending on the repository's implementation of `countAvailableFilms`.
     * @param {number} id - The ID to filter available film count by. Must be a positive integer.
     * @returns {Promise<number>} A promise that resolves to the count of available films.
     * @throws {Error} If the provided ID is invalid or an error occurs during data retrieval.
     */
    async getAvailableFilmCount(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid ID provided for available film count. ID must be a positive integer.');
        }
        try {
            return await this.filmRepository.countAvailableFilms(id);
        } catch (error) {
            console.error(`[FilmService] Error in getAvailableFilmCount(${id}): ${error.message}`, error);
            throw new Error(`Failed to retrieve available film count for ID: ${id}.`);
        }
    }

    /**
     * Retrieves a list of Film entities belonging to a specific category, identified by its ID.
     * @param {number} id - The unique identifier of the category. Must be a positive integer.
     * @returns {Promise<Film[]>} A promise that resolves to an array of Film objects in the specified category.
     * @throws {Error} If the provided category ID is invalid or an error occurs during data retrieval.
     */
    async getFilmsByCategory(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid category ID provided. ID must be a positive integer.');
        }
        try {
            return await this.filmRepository.findFilmsByCategory(id);
        } catch (error) {
            console.error(`[FilmService] Error in getFilmsByCategory(${id}): ${error.message}`, error);
            throw new Error(`Failed to retrieve films for category ID: ${id}.`);
        }
    }

    /**
     * Retrieves a list of Film entities featuring a specific actor, identified by their ID.
     * @param {number} id - The unique identifier of the actor. Must be a positive integer.
     * @returns {Promise<Film[]>} A promise that resolves to an array of Film objects featuring the specified actor.
     * @throws {Error} If the provided actor ID is invalid or an error occurs during data retrieval.
     */
    async getFilmsByActor(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid actor ID provided. ID must be a positive integer.');
        }
        try {
            return await this.filmRepository.findFilmsByActor(id);
        } catch (error) {
            console.error(`[FilmService] Error in getFilmsByActor(${id}): ${error.message}`, error);
            throw new Error(`Failed to retrieve films for actor ID: ${id}.`);
        }
    }

    /**
     * Persists a Film entity to the database. This method handles both creating new films
     * and updating existing ones. The repository is expected to determine if it's an
     * insert or update based on the `film` object (e.g., presence of `filmId`).
     * @param {Film} film - The Film object to save. Must be a valid object with at least a title.
     * @returns {Promise<Film>} A promise that resolves to the saved/updated Film object,
     *                          potentially with an assigned `filmId` if it was a new creation.
     * @throws {Error} If the film object is invalid or an error occurs during persistence.
     */
    async save(film) {
        if (!film || typeof film !== 'object' || Array.isArray(film)) {
            throw new Error('Invalid film object provided for saving. Must be a non-null object.');
        }
        // Basic validation, more specific validation might be needed based on Film structure
        if (typeof film.title !== 'string' || film.title.trim() === '') {
            throw new Error('Film title is required and must be a non-empty string for saving.');
        }
        // Add more validation for other required fields if necessary
        // e.g., if (!film.releaseYear || typeof film.releaseYear !== 'number') { throw new Error('Release year is required.'); }

        try {
            return await this.filmRepository.saveFilm(film);
        } catch (error) {
            console.error(`[FilmService] Error in save(${JSON.stringify(film)}): ${error.message}`, error);
            throw new Error('Failed to save film due to a service error.');
        }
    }

    /**
     * Deletes a Film entity from the database based on its unique `filmId`.
     * @param {number} id - The unique identifier of the film to delete. Must be a positive integer.
     * @returns {Promise<void>} A promise that resolves when the film is successfully deleted.
     * @throws {Error} If the provided ID is invalid or an error occurs during deletion.
     */
    async deleteFilmById(id) {
        if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid film ID provided for deletion. ID must be a positive integer.');
        }
        try {
            await this.filmRepository.deleteFilmById(id);
        } catch (error) {
            console.error(`[FilmService] Error in deleteFilmById(${id}): ${error.message}`, error);
            throw new Error(`Failed to delete film with ID: ${id}.`);
        }
    }
}

module.exports = FilmService;