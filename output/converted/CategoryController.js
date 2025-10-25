```javascript
// --- services/categoryService.js ---
/**
 * @class CategoryService
 * @description Provides business logic and data access operations for Category entities.
 *              This is a mock service for demonstration purposes.
 */
class CategoryService {
    /**
     * Retrieves all categories from the data source.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of category objects.
     * @throws {Error} If there's an issue retrieving data.
     */
    async getAllCategories() {
        // Simulate async database call
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('[CategoryService] Fetching all categories...');
                resolve([
                    { category_id: 1, name: 'Action' },
                    { category_id: 2, name: 'Comedy' },
                    { category_id: 3, name: 'Drama' },
                    { category_id: 4, name: 'Horror' },
                    { category_id: 5, name: 'Sci-Fi' },
                ]);
            }, 100); // Simulate network/DB latency
        });
    }

    /**
     * Retrieves a category by its ID.
     * @param {number} id - The ID of the category to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the category object or null if not found.
     * @throws {Error} If there's an issue retrieving data.
     */
    async getByCategoryId(id) {
        // Simulate async database call
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`[CategoryService] Fetching category by ID: ${id}...`);
                const categories = [
                    { category_id: 1, name: 'Action' },
                    { category_id: 2, name: 'Comedy' },
                    { category_id: 3, name: 'Drama' },
                    { category_id: 4, name: 'Horror' },
                    { category_id: 5, name: 'Sci-Fi' },
                ];
                resolve(categories.find(cat => cat.category_id === id) || null);
            }, 100); // Simulate network/DB latency
        });
    }
}

// Export an instance of the service to be used as a singleton
module.exports = new CategoryService();


// --- services/filmService.js ---
/**
 * @class FilmService
 * @description Provides business logic and data access operations for Film entities.
 *              This is a mock service for demonstration purposes.
 */
class FilmService {
    /**
     * Retrieves all films associated with a specific category ID.
     * @param {number} categoryId - The ID of the category.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of film objects.
     * @throws {Error} If there's an issue retrieving data.
     */
    async getFilmsByCategory(categoryId) {
        // Simulate async database call
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`[FilmService] Fetching films for category ID: ${categoryId}...`);
                const allFilms = {
                    1: [ // Action
                        { film_id: 101, title: 'The Great Escape', description: 'An action-packed thriller.' },
                        { film_id: 102, title: 'Mission Impossible', description: 'High-stakes espionage.' },
                    ],
                    2: [ // Comedy
                        { film_id: 201, title: 'Funny Business', description: 'A hilarious comedy.' },
                    ],
                    3: [ // Drama
                        { film_id: 301, title: 'Life\'s Journey', description: 'An emotional drama.' },
                        { film_id: 302, title: 'The Silent Witness', description: 'An intense courtroom drama.' },
                    ],
                    4: [ // Horror
                        { film_id: 401, title: 'Nightmare Alley', description: 'Spooky and terrifying.' },
                    ],
                    5: [ // Sci-Fi
                        { film_id: 501, title: 'Star Explorers', description: 'Journey through space.' },
                        { film_id: 502, title: 'Future Shock', description: 'Dystopian future.' },
                    ]
                };
                resolve(allFilms[categoryId] || []);
            }, 100); // Simulate network/DB latency
        });
    }
}

// Export an instance of the service to be used as a singleton
module.exports = new FilmService();


// --- utils/errors.js ---
/**
 * @class CustomError
 * @augments Error
 * @description A custom error class for consistent error handling in the application.
 *              It allows attaching an HTTP status code and an original error object.
 */
class CustomError extends Error {
    /**
     * Creates an instance of CustomError.
     * @param {string} message - The error message.
     * @param {number} [statusCode=500] - The HTTP status code associated with the error.
     * @param {Error} [originalError=null] - The original error object, if any, that caused this custom error.
     */
    constructor(message, statusCode