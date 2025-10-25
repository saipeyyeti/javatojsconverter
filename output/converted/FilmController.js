/**
 * @file FilmController
 * @module controllers/filmController
 * @description This module defines the Express.js router for handling web requests related to films
 *              in the Sakila project. It acts as the "C" in MVC, orchestrating interactions between
 *              the user interface (views) and the business logic (services).
 *
 *              It handles displaying film information, processing rentals, and managing films
 *              for administrative users.
 */

const express = require('express');
const router = express.Router();
const { LocalDateTime, Duration } = require('@js-joda/core'); // Using @js-joda for Java-like date/time API

// --- Service Dependencies ---
// In a real application, these would be imported from their respective service modules.
// For this example, we'll assume they are available and implement their methods as async functions.
// Example: const filmService = require('../services/filmService');
// For demonstration, we'll create mock services.
const filmService = {
    getAllFilms: async () => [
        { filmId: 1, title: 'ACADEMY DINOSAUR', rentalDuration: 6, description: 'A dinosaur in an academy' },
        { filmId: 2, title: 'ACE GOLDFINGER', rentalDuration: 3, description: 'A goldfinger ace' },
        { filmId: 3, title: 'ADAPTATION HOLES', rentalDuration: 5, description: 'Holes of adaptation' }
    ],
    getFilmsByTitle: async (title) => {
        const allFilms = await filmService.getAllFilms();
        return allFilms.filter(f => f.title.toLowerCase().includes(title.toLowerCase()));
    },
    getFilmByID: async (id) => {
        const allFilms = await filmService.getAllFilms();
        return allFilms.find(f => f.filmId === id);
    },
    getAvailableFilms: async () => {
        const allFilms = await filmService.getAllFilms();
        // Simulate availability: Film 1 and 3 are available
        return allFilms.filter(f => f.filmId === 1 || f.filmId === 3);
    },
    getAvailableFilmCount: async (filmId) => {
        // Simulate inventory count
        if (filmId === 1) return 5;
        if (filmId === 2) return 0;
        if (filmId === 3) return 2;
        return 0;
    },
    deleteFilmById: async (id) => {
        console.log(`Simulating deletion of film with ID: ${id}`);
        // In a real app, this would interact with the database
        return true;
    }
};

const inventoryService = {
    getAllInventory: async () => [
        { inventoryId: 101, filmId: 1, storeId: 1 },
        { inventoryId: 102, filmId: 1, storeId: 1 },
        { inventoryId: 103, filmId: 2, storeId: 1 },
        { inventoryId: 104, filmId: 3, storeId: 2 }
    ],
    // Improved method for getting an available inventory item for a specific film
    getAvailableInventoryItemForFilm: async (filmId) => {
        const allInventory = await inventoryService.getAllInventory();
        // In a real system, this would query for truly available (not rented) items
        return allInventory.find(item => item.filmId === filmId);
    },
    // The original Java code had this commented out. In a real system,
    // a rental would mark an inventory item as unavailable, not delete it.
    // For consistency with the original analysis, we'll keep it as a no-op or log.
    deleteInventoryItemById: async (filmId) => {
        console.warn(`Inventory item deletion for filmId ${filmId} was called but is commented out in original Java. No actual deletion performed.`);
        return true;
    }
};

const rentalService = {
    addRental: async (inventoryId, customerId, returnDate) => {
        console.log(`Simulating rental: Inventory ID ${inventoryId}, Customer ID ${customerId}, Return Date ${returnDate}`);
        // In a real app, this would create a new rental record in the database
        return { rentalId: 1, inventoryId, customerId, returnDate };
    }
};

const customerService = {
    getCustomerByEmail: async (email) => {
        // Simulate customer data
        if (email === 'user@example.com') {
            return { customerId: 1, firstName: 'John', lastName: 'Doe', email: 'user@example.com' };
        }
        return null;
    }
};

// --- Middleware ---
// These are placeholder middleware functions. In a real application,
// you would integrate with an authentication library like Passport.js.

/**
 * Middleware to check if a user is authenticated.
 * Populates `req.user` if authenticated.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
const isAuthenticated = (req, res, next) => {
    // Simulate an authenticated user. In a real app, this would come from session/token.
    req.user = { email: 'user@example.com', id: 1 }; // Mock authenticated user
    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

/**
 * Middleware to check if the authenticated user has admin privileges.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
const isAdmin = (req, res, next) => {
    // Simulate admin check. In a real app, this would check user roles.
    // For this example, we'll assume the mock user is an admin.
    if (req.user && req.user.email === 'user@example.com') { // Or check a role property like req.user.role === 'admin'
        next();
    } else {
        res.status(403).send('Forbidden: Admin access required');
    }
};

// --- Controller Methods (Route Handlers) ---

/**
 * GET /films
 * Displays a list of films, with an option to filter by title.
 * Also provides a list of currently available films.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {Promise<void>} Renders the 'films/films' view.
 */
router.get('/films', async (req, res, next) => {
    try {
        const filter = req.query.title || 'ALL FILMS';
        let films;

        if (filter.toUpperCase() === 'ALL FILMS') {
            films = await filmService.getAllFilms();
        } else {
            films = await filmService.getFilmsByTitle(filter);
        }

        const availableFilms = await filmService.getAvailableFilms();
        const allFilms = await filmService.getAllFilms(); // Original Java code had this, might be redundant if `films` is already all films

        res.render('films/films', {
            films: films,
            availableFilms: availableFilms,
            allFilms: allFilms, // Pass all films for potential client-side filtering or display
            titleFilter: filter // Pass the filter back to the view if needed
        });
    } catch (error) {
        console.error('Error fetching films:', error);
        next(error); // Pass error to global error handler
    }
});

/**
 * GET /films/details
 * Displays detailed information for a single film identified by its ID.
 * Also indicates if the film is currently available for rent.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {Promise<void>} Renders the 'films/filmDetails' view.
 */
router.get('/films/details', async (req, res, next) => {
    try {
        const id = parseInt(req.query.id, 10);
        if (isNaN(id)) {
            return res.status(400).send('Bad Request: Film ID must be a number.');
        }

        const film = await filmService.getFilmByID(id);
        if (!film) {
            return res.status(404).send('Film not found.');
        }

        const availableFilms = await filmService.getAvailableFilms();
        const available = availableFilms.some(f => f.filmId === film.filmId);

        res.render('films/filmDetails', {
            available: available,
            details: film
        });
    } catch (error) {
        console.error('Error fetching film details:', error);
        next(error);
    }
});

/**
 * GET /rent/:filmid
 * Handles the rental process for a specific film.
 * Identifies the customer from the authenticated user, finds an available inventory item,
 * calculates the return date, and records the rental.
 *
 * @observation The original Java code had `inventoryService.deleteInventoryItemById` commented out,
 *              meaning the inventory item was not actually marked as unavailable. This implementation
 *              reflects that observation but notes it as a potential functional bug.
 *              A robust system would mark the inventory item as 'rented' or 'unavailable'.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {Promise<void>} Redirects to '/films' after processing.
 */
router.get('/rent/:filmid', isAuthenticated, async (req, res, next) => {
    try {
        const filmId = parseInt(req.params.filmid, 10);
        if (isNaN(filmId)) {
            return res.status(400).send('Bad Request: Film ID must be a number.');
        }

        const customer = await customerService.getCustomerByEmail(req.user.email);
        if (!customer) {
            return res.status(404).send('Customer not found for the authenticated user.');
        }

        // --- Improved inventory lookup ---
        const inventory = await inventoryService.getAvailableInventoryItemForFilm(filmId);
        if (!inventory) {
            return res.status(404).send('No available inventory for this film.');
        }

        const film = await filmService.getFilmByID(inventory.filmId);
        if (!film) {
            // This should ideally not happen if inventory exists for the filmId
            return res.status(500).send('Film details not found for the inventory item.');
        }

        const rentalDuration = film.rentalDuration || 0; // Default to 0 if not set
        const returnDate = LocalDateTime.now().plus(Duration.ofDays(rentalDuration));

        // --- Critical Bug Observation from Analysis ---
        // The original Java code had `inventoryService.deleteInventoryItemById(inventory.getFilmId());` commented out.
        // This means the inventory item is NOT marked as unavailable.
        // For consistency with the *observed* Java behavior, we will not call a method to mark it unavailable here.
        // In a production system, you would call something like:
        // await inventoryService.markInventoryAsRented(inventory.inventoryId);
        // Or the `addRental` service itself would handle inventory status updates.
        console.warn(`[RENTAL BUG ALERT]: Inventory item ${inventory.inventoryId} for film ${filmId} is NOT marked as unavailable after rental, as per original Java code's commented-out line.`);

        await rentalService.addRental(inventory.inventoryId, customer.customerId, returnDate.toString()); // Convert LocalDateTime to string for mock service

        // In Express, you typically pass flash messages for "Rented" status
        // req.flash('success', 'Film rented successfully!');
        res.redirect('/films');
    } catch (error) {
        console.error('Error renting film:', error);
        next(error);
    }
});

/**
 * GET /owner/manage-films
 * Provides an administrative view for managing films.
 * It lists films (with optional filtering) and displays the count of available copies for each film.
 *
 * @observation Renamed from `getFilmDetails` to `manageFilms` for clarity, as suggested in the analysis.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {Promise<void>} Renders the '/owner/manage-films' view.
 */
router.get('/owner/manage-films', isAdmin, async (req, res, next) => {
    try {
        const filter = req.query.title || 'ALL FILMS';
        let filmsToDisplay;

        if (filter.toUpperCase() === 'ALL FILMS') {
            filmsToDisplay = await filmService.getAllFilms();
        } else {
            filmsToDisplay = await filmService.getFilmsByTitle(filter);
        }

        const allFilms = await filmService.getAllFilms(); // Get all films to calculate counts for all
        const filmCount = new Map(); // Using Map for key-value pairs

        for (const film of allFilms) {
            const count = await filmService.getAvailableFilmCount(film.filmId);
            filmCount.set(film.filmId, count);
        }

        // Convert Map to a plain object if your templating engine prefers it
        const filmCountObject = Object.fromEntries(filmCount);

        res.render('owner/manage-films', {
            films: filmsToDisplay,
            filmCount: filmCountObject,
            allFilms: filmsToDisplay // Original Java code passed `films` again as `allFilms`
        });
    } catch (error) {
        console.error('Error managing films:', error);
        next(error);
    }
});

/**
 * GET /owner/edit/:id
 * Prepares and displays the form for editing a specific film.
 *
 * @observation Changed from `@RequestMapping("/edit/{id}")` to `@GetMapping` for clarity and safety,
 *              as this is for displaying a form.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {Promise<void>} Renders the '/owner/edit-film' view.
 */
router.get('/owner/edit/:id', isAdmin, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).send('Bad Request: Film ID must be a number.');
        }

        const film = await filmService.getFilmByID(id);
        if (!film) {
            return res.status(404).send('Film not found for editing.');
        }

        res.render('owner/edit-film', { film: film });
    } catch (error) {
        console.error('Error showing edit film page:', error);
        next(error);
    }
});

/**
 * POST /owner/delete/:id
 * Deletes a film from the database.
 *
 * @observation Changed from `@RequestMapping("/delete/{id}")` to `@PostMapping` for security,
 *              preventing deletion via GET requests.
 * @observation Renamed from `deleteProduct` to `deleteFilm` for consistency.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function for error handling.
 * @returns {Promise<void>} Redirects to '/owner/manage-films' after deletion.
 */
router.post('/owner/delete/:id', isAdmin, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).send('Bad Request: Film ID must be a number.');
        }

        await filmService.deleteFilmById(id);
        // req.flash('success', 'Film deleted successfully!'); // Example flash message
        res.redirect('/owner/manage-films');
    } catch (error) {
        console.error('Error deleting film:', error);
        next(error);
    }
});

/**
 * @observation The original `public Film findFilmByID(Integer id)` method was unused and public.
 *              In Node.js, such a method would typically reside directly within the `filmService`
 *              and be called from route handlers as needed. It's not exposed as a separate
 *              controller endpoint. Therefore, it's omitted from this controller module.
 */

module.exports = router;