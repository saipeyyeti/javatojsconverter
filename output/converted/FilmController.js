```javascript
/**
 * @file FilmController
 * @module controllers/filmController
 * @description This module provides an Express.js router for handling web requests related to Film entities.
 * It mirrors the functionality of the original Java Spring MVC FilmController, orchestrating business logic
 * through dedicated service classes and preparing data for views.
 */

const express = require('express');
const router = express.Router();

/**
 * Factory function to create an Express router for film-related operations.
 * This mimics dependency injection by taking service instances as arguments.
 *
 * @param {object} filmService - Service for film-related business logic.
 * @param {function(): Promise<Array<object>>} filmService.getAllFilms - Fetches all films.
 * @param {function(string): Promise<Array<object>>} filmService.getFilmsByTitle - Fetches films by title.
 * @param {function(): Promise<Array<object>>} filmService.getAvailableFilms - Fetches all available films.
 * @param {function(number): Promise<object>} filmService.getFilmByID - Fetches a film by its ID.
 * @param {function(number): Promise<number>} filmService.getAvailableFilmCount - Gets the count of available copies for a film.
 * @param {function(number): Promise<void>} filmService.deleteFilmById - Deletes a film by its ID.
 *
 * @param {object} inventoryService - Service for inventory-related business logic.
 * @param {function(): Promise<Array<object>>} inventoryService.getAllInventory - Fetches all inventory items.
 * @param {function(number): Promise<void>} inventoryService.deleteInventoryItemById - Deletes an inventory item by ID (commented out in original).
 *
 * @param {object} rentalService - Service for rental-related business logic.
 * @param {function(number, number, Date): Promise<object>} rentalService.addRental - Adds a new rental record.
 *
 * @param {object} customerService - Service for customer-related business logic.
 * @param {function(string): Promise<object>} customerService.getCustomerByEmail - Fetches a customer by email.
 *
 * @returns {express.Router} An Express router configured with film-related routes.
 */
module.exports = (filmService, inventoryService, rentalService, customerService) => {

    /**
     * GET /films
     * Displays a list of films to the user, with optional filtering by title.
     *
     * @async
     * @function
     * @param {express.Request} req - The Express request object.
     * @param {string} [req.query.title='ALL FILMS'] - The title to filter films by.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} Renders the 'films/films' view with film data or sends an error.
     */
    router.get('/films', async (req, res, next) => {
        try {
            const filter = req.query.title || 'ALL FILMS';
            let films;

            if (filter === 'ALL FILMS') {
                films = await filmService.getAllFilms();
            } else {
                films = await filmService.getFilmsByTitle(filter);
            }

            const availableFilms = await filmService.getAvailableFilms();
            const allFilms = await filmService.getAllFilms(); // Original Java code fetches allFilms again, keeping consistent.

            res.render('films/films', {
                films,
                availableFilms,
                allFilms,
                filter // Pass filter to view for display if needed
            });
        } catch (error) {
            console.error('Error fetching films:', error);
            // In a production app, you might render an error page or send a JSON error.
            res.status(500).send('An error occurred while fetching films.');
            next(error); // Pass error to Express error handling middleware
        }
    });

    /**
     * GET /films/details
     * Displays detailed information for a specific film.
     *
     * @async
     * @function
     * @param {express.Request} req - The Express request object.
     * @param {string} req.query.id - The ID of the film to display details for.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} Renders the 'films/filmDetails' view with film details or sends an error.
     */
    router.get('/films/details', async (req, res, next) => {
        try {
            const id = parseInt(req.query.id, 10);
            if (isNaN(id)) {
                return res.status(400).send('Invalid film ID provided.');
            }

            const film = await filmService.getFilmByID(id);
            if (!film) {
                return res.status(404).send('Film not found.');
            }

            const availableFilms = await filmService.getAvailableFilms();
            const available = availableFilms.some(f => f.filmId === film.filmId); // Assuming film objects have a filmId property

            res.render('films/filmDetails', {
                available,
                details: film
            });
        } catch (error) {
            console.error('Error fetching film details:', error);
            res.status(500).send('An error occurred while fetching film details.');
            next(error);
        }
    });

    /**
     * GET /rent/:filmid
     * Handles the rental process for a selected film by an authenticated user.
     * Requires user authentication (e.g., via Passport.js, populating req.user).
     *
     * @async
     * @function
     * @param {express.Request} req - The Express request object.
     * @param {string} req.params.filmid - The ID of the film to rent.
     * @param {object} req.user - The authenticated user object (e.g., from Passport.js). Assumed to have an 'email' property.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} Redirects to '/films' after rental or sends an error.
     */
    router.get('/rent/:filmid', async (req, res, next) => {
        try {
            if (!req.user || !req.user.email) {
                // Assuming authentication middleware populates req.user
                return res.status(401).send('Authentication required to rent a film.');
            }

            const filmid = parseInt(req.params.filmid, 10);
            if (isNaN(filmid)) {
                return res.status(400).send('Invalid film ID provided for rental.');
            }

            const customer = await customerService.getCustomerByEmail(req.user.email);
            if (!customer) {
                return res.status(404).send('Customer not found for the authenticated user.');
            }

            const inventoryList = await inventoryService.getAllInventory();
            let rented = false;

            for (const inventory of inventoryList) {
                // Assuming inventory objects have filmId and inventoryId properties
                if (inventory.filmId === filmid) {
                    const film = await filmService.getFilmByID(inventory.filmId);
                    if (!film) {
                        console.warn(`Film with ID ${inventory.filmId} not found for inventory item ${inventory.inventoryId}. Skipping rental.`);
                        continue;
                    }

                    // Calculate return date: current time + rental duration in days
                    const returnDate = new Date();
                    returnDate.setDate(returnDate.getDate() + film.rentalDuration);

                    // The original Java code had inventoryService.deleteInventoryItemById commented out.
                    // This implies the inventory item is not actually removed or marked as unavailable.
                    // If this is an oversight, uncomment and implement the corresponding service method.
                    // await inventoryService.deleteInventoryItemById(inventory.filmId);

                    await rentalService.addRental(inventory.inventoryId, customer.customerId, returnDate);
                    rented = true;
                    break; // Only rent one copy
                }
            }

            if (!rented) {
                return res.status(400).send('No available inventory found for this film.');
            }

            // The original Java code adds "rented" to modelMap, but then redirects.
            // For redirects, flash messages are typically used to pass temporary data.
            // For simplicity, we'll just redirect.
            res.redirect('/films');
        } catch (error) {
            console.error('Error renting film:', error);
            res.status(500).send('An error occurred during the rental process.');
            next(error);
        }
    });

    /**
     * GET /owner/manage-films
     * Displays films specifically for owner/admin management, including the count of available copies for each film.
     *
     * @async
     * @function
     * @param {express.Request} req - The Express request object.
     * @param {string} [req.query.title='ALL FILMS'] - The title to filter films by.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} Renders the '/owner/manage-films' view with film data and counts or sends an error.
     */
    router.get('/owner/manage-films', async (req, res, next) => {
        try {
            const filter = req.query.title || 'ALL FILMS';
            let films;

            if (filter === 'ALL FILMS') {
                films = await filmService.getAllFilms();
            } else {
                films = await filmService.getFilmsByTitle(filter);
            }

            const allFilmsForCount = await filmService.getAllFilms(); // Fetch all films to calculate counts
            const filmCount = {}; // Using an object as a map for filmId -> count

            for (const film of allFilmsForCount) {
                // Assuming film objects have a filmId property
                filmCount[film.filmId] = await filmService.getAvailableFilmCount(film.filmId);
            }

            res.render('/owner/manage-films', {
                films,
                filmCount,
                allFilms: films, // Original Java code passes 'films' again as 'allFilms'
                filter
            });
        } catch (error) {
            console.error('Error fetching films for management:', error);
            res.status(500).send('An error occurred while fetching films for management.');
            next(error);
        }
    });

    /**
     * GET /edit/:id
     * Prepares the view for editing a specific film.
     *
     * @async
     * @function
     * @param {express.Request} req - The Express request object.
     * @param {string} req.params.id - The ID of the film to edit.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} Renders the '/owner/edit-film' view with the film data or sends an error.
     */
    router.get('/edit/:id', async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).send('Invalid film ID provided for editing.');
            }

            const film = await filmService.getFilmByID(id);
            if (!film) {
                return res.status(404).send('Film not found for editing.');
            }

            res.render('/owner/edit-film', { film });
        } catch (error) {
            console.error('Error showing edit film page:', error);
            res.status(500).send('An error occurred while preparing the edit film page.');
            next(error);
        }
    });

    /**
     * GET /delete/:id
     * Deletes a film from the system.
     *
     * @async
     * @function
     * @param {express.Request} req - The Express request object.
     * @param {string} req.params.id - The ID of the film to delete.
     * @param {express.Response} res - The Express response object.
     * @param {express.NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} Redirects to '/owner/manage-films' after deletion or sends an error.
     */
    router.get('/delete/:id', async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).send('Invalid film ID provided for deletion.');
            }

            await filmService.deleteFilmById(id);
            res.redirect('/owner/manage-films');
        } catch (error) {
            console.error('Error deleting film:', error);
            res.status(500).send('An error occurred while deleting the film.');
            next(error);
        }
    });

    // The `findFilmByID` method from the Java controller is a public helper method,
    // not a web endpoint. It's typically part of a service layer in Node.js,
    // so it's not directly translated as a route here.
    // If it were needed, it would be a method within `filmService`.

    return router;
};
```