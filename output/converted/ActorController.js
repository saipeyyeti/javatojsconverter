/**
 * @module ActorController
 * @description
 * This Express.js router handles web requests related to `Actor` entities.
 * It acts as the entry point for HTTP GET requests, orchestrates data retrieval
 * from `ActorService` and `FilmService`, and prepares data for the view layer.
 *
 * It adheres to the Model-View-Controller (MVC) pattern, delegating business
 * logic and data access to the service layer.
 */

const express = require('express');
const router = express.Router();

// Import service dependencies. Adjust paths as per your project structure.
// In a real application, these might be injected or passed during app setup.
const actorService = require('../services/actorService');
const filmService = require('../services/filmService');

/**
 * GET /actors
 *
 * Handles requests to retrieve a list of actors.
 * Supports optional filtering by first name, last name, or both via query parameters.
 *
 * @function getActors
 * @param {object} req - The Express request object.
 * @param {object} req.query - The query parameters from the URL.
 * @param {string} [req.query.firstName='ALL ACTORS'] - Optional filter for actor's first name.
 * @param {string} [req.query.lastName='ALL ACTORS'] - Optional filter for actor's last name.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack. Used for error propagation.
 * @returns {Promise<void>} Renders the 'actors/actors' view with the filtered actor list
 *                          and a list of all actors (potentially for a reset/dropdown option).
 *                          On error, it passes the error to the next middleware.
 */
router.get('/actors', async (req, res, next) => {
    try {
        // Extract and normalize query parameters, providing default values similar to Java's @RequestParam.
        const firstNameFilter = req.query.firstName ? req.query.firstName.toUpperCase() : 'ALL ACTORS';
        const lastNameFilter = req.query.lastName ? req.query.lastName.toUpperCase() : 'ALL ACTORS';

        let actors;
        // Apply filtering logic based on provided parameters.
        if (firstNameFilter === 'ALL ACTORS' && lastNameFilter === 'ALL ACTORS') {
            actors = await actorService.getAllActors();
        } else if (lastNameFilter === 'ALL ACTORS') {
            actors = await actorService.getActorsByFirstName(firstNameFilter);
        } else if (firstNameFilter === 'ALL ACTORS') {
            actors = await actorService.getActorsByLastName(lastNameFilter);
        } else {
            actors = await actorService.getActorsByFullName(firstNameFilter, lastNameFilter);
        }

        // Retrieve all actors, potentially for a dropdown or reset option in the view.
        const allActors = await actorService.getAllActors();

        // Render the view, passing the retrieved data.
        // Assumes a view engine (e.g., EJS, Pug, Handlebars) is configured in your Express app.
        res.render('actors/actors', {
            actors: actors,
            allActors: allActors,
            // Pass filters back to the view for display or form pre-filling.
            firstNameFilter: firstNameFilter,
            lastNameFilter: lastNameFilter
        });
    } catch (error) {
        console.error('Error in getActors:', error);
        // Pass the error to the next middleware for centralized error handling.
        next(error);
    }
});

/**
 * GET /actors/details
 *
 * Handles requests to display detailed information for a specific actor,
 * including the films they have acted in. Requires an `id` query parameter.
 *
 * @function getActorFilmDetails
 * @param {object} req - The Express request object.
 * @param {object} req.query - The query parameters from the URL.
 * @param {string} req.query.id - The ID of the actor to retrieve details for.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack. Used for error propagation.
 * @returns {Promise<void>} Renders the 'actors/actorDetails' view with the actor's name
 *                          and their associated films.
 *                          Handles invalid ID format and actor not found errors.
 *                          On other errors, it passes the error to the next middleware.
 */
router.get('/actors/details', async (req, res, next) => {
    try {
        const actorId = parseInt(req.query.id, 10);

        // Validate the actor ID.
        if (isNaN(actorId)) {
            return res.status(400).send('Bad Request: Invalid actor ID provided. ID must be a number.');
        }

        // Retrieve actor's full name and their films using the service layer.
        // The Java controller's `getActorFullNameFromID` method is assumed to be
        // handled by the `actorService.getActorFullNameFromID` method for better encapsulation.
        const actorName = await actorService.getActorFullNameFromID(actorId);
        const films = await filmService.getFilmsByActor(actorId);

        // Render the view, passing the retrieved data.
        res.render('actors/actorDetails', {
            name: actorName,
            films: films,
            actorId: actorId // Useful for the view, e.g., for navigation or display
        });
    } catch (error) {
        console.error(`Error in getActorFilmDetails for actor ID ${req.query.id}:`, error);
        // Check for specific error messages from the service layer (e.g., "not found").
        if (error.message.includes('not found')) {
            return res.status(404).send(`Not Found: ${error.message}`);
        }
        // Pass other errors to the next middleware for centralized handling.
        next(error);
    }
});

// Export the router to be used by the main Express application.
module.exports = router;