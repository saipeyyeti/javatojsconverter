```javascript
import express from 'express';

/**
 * @typedef {object} Actor
 * @property {number} actor_id - The unique identifier for the actor.
 * @property {string} first_name - The first name of the actor.
 * @property {string} last_name - The last name of the actor.
 * // Add other relevant actor properties as per your application's Actor entity
 */

/**
 * @typedef {object} Film
 * @property {number} film_id - The unique identifier for the film.
 * @property {string} title - The title of the film.
 * @property {string} description - A brief description of the film.
 * // Add other relevant film properties as per your application's Film entity
 */

/**
 * @interface ActorService
 * Represents the interface for the Actor business logic service.
 * All methods are expected to return Promises.
 * @property {function(): Promise<Actor[]>} getAllActors - Retrieves all actors.
 * @property {function(string): Promise<Actor[]>} getActorsByFirstName - Retrieves actors by first name.
 * @property {function(string): Promise<Actor[]>} getActorsByLastName - Retrieves actors by last name.
 * @property {function(string, string): Promise<Actor[]>} getActorsByFullName - Retrieves actors by full name.
 * @property {function(number): Promise<Actor|null>} getActorByID - Retrieves a single actor by ID.
 * @property {function(number): Promise<string|null>} getActorFullNameFromID - Retrieves the full name of an actor by ID.
 */

/**
 * @interface FilmService
 * Represents the interface for the Film business logic service.
 * All methods are expected to return Promises.
 * @property {function(number): Promise<Film[]>} getFilmsByActor - Retrieves films associated with a specific actor ID.
 */

/**
 * Creates and configures an Express router for handling actor-related web requests.
 * This function acts as a factory for the router, allowing dependency injection of services.
 *
 * @param {ActorService} actorService - An instance of the ActorService for handling actor-related business logic.
 * @param {FilmService} filmService - An instance of the FilmService for handling film-related business logic.
 * @returns {express.Router} An Express router instance configured with actor routes.
 */
const createActorRouter = (actorService, filmService) => {
    const router = express.Router();

    /**
     * Handles GET requests to the '/actors' endpoint.
     * This method retrieves a list of actors, which can be filtered by first name, last name, or both.
     * If no filters are provided, all actors are returned.
     * It then renders the 'actors/actors' view, passing the filtered list and a list of all actors.
     *
     * @param {express.Request} req - The Express request object, containing query parameters for filtering.
     * @param {express.Response} res - The Express response object, used to render the view.
     * @param {express.NextFunction} next - The Express next middleware function, used for error handling.
     * @returns {Promise<void>} A Promise that resolves when the response is sent or an error is passed to the next middleware.
     */
    router.get('/actors', async (req, res, next) => {
        try {
            // Extract query parameters with default values
            const firstNameFilter = req.query.firstName || 'ALL ACTORS';
            const lastNameFilter = req.query.lastName || 'ALL ACTORS';

            let actors;
            // Apply filtering logic based on provided parameters
            if (firstNameFilter === 'ALL ACTORS' && lastNameFilter === 'ALL ACTORS') {
                actors = await actorService.getAllActors();
            } else if (lastNameFilter === 'ALL ACTORS') {
                actors = await actorService.getActorsByFirstName(firstNameFilter);
            } else if (firstNameFilter === 'ALL ACTORS') {
                actors = await actorService.getActorsByLastName(lastNameFilter);
            } else {
                actors = await actorService.getActorsByFullName(firstNameFilter, lastNameFilter);
            }

            // Fetch all actors again, potentially for a "reset filter" option or a dropdown in the view
            const allActors = await actorService.getAllActors();

            // Render the view, passing the filtered actors, all actors, and the current filter values
            res.render('actors/actors', {
                actors: actors,
                allActors: allActors,
                firstNameFilter: firstNameFilter, // Pass filters back to view for display/form pre-filling
                lastNameFilter: lastNameFilter
            });
        } catch (error) {
            // Log the error and pass it to the Express error handling middleware
            console.error('Error in getActors:', error);
            next(error);
        }
    });

    /**
     * Handles GET requests to the '/actors/details' endpoint.
     * This method retrieves detailed information for a single actor, identified by their ID.
     * It fetches the actor's full name and a list of films they have appeared in.
     * It then renders the 'actors/actorDetails' view, passing the actor's name and film list.
     *
     * @param {express.Request} req - The Express request object, expecting an 'id' query parameter.
     * @param {express.Response} res - The Express response object, used to render the view or send error responses.
     * @param {express.NextFunction} next - The Express next middleware function, used for error handling.
     * @returns {Promise<void>} A Promise that resolves when the response is sent or an error is passed to the next middleware.
     */
    router.get('/actors/details', async (req, res, next) => {
        try {
            const actorId = parseInt(req.query.id, 10);

            // Validate the actor ID
            if (isNaN(actorId) || actorId <= 0) {
                // Render an error page or send a JSON error for invalid input
                return res.status(400).render('error', { message: 'Invalid Actor ID provided. Please provide a positive integer ID.' });
            }

            // Fetch actor's full name and films asynchronously
            const actorFullName = await actorService.getActorFullNameFromID(actorId);
            if (!actorFullName) {
                // If actor not found, send a 404 response
                return res.status(404).render('error', { message: `Actor with ID ${actorId} not found.` });
            }

            const films = await filmService.getFilmsByActor(actorId);

            // Render the view with the actor's details
            res.render('actors/actorDetails', {
                name: actorFullName,
                films: films,
                actorId: actorId // Useful to pass back to the view for context
            });
        } catch (error) {
            // Log the error and pass it to the Express error handling middleware
            console.error(`Error in getActorFilmDetails for actor ID ${req.query.id}:`, error);
            next(error);
        }
    });

    // The original Java controller included public helper methods `findActorById` and `getActorFullNameFromID`.
    // Based on the analysis, these methods are redundant as their functionality is already
    // provided by the `ActorService` and is directly utilized by the web endpoints.
    // In Node.js, it's best practice to keep controllers focused on request handling
    // and delegate business logic entirely to services. Therefore, these helper methods
    // are not translated into this Node.js controller.

    return router;
};

export default createActorRouter;
```