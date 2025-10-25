```javascript
/**
 * @file FilmRepository.js
 * @description This module provides a data access layer for the Film entity,
 *              mimicking the functionality of a Spring Data JPA FilmRepository
 *              using Sequelize ORM in Node.js. It encapsulates database
 *              interactions for Film entities, including standard CRUD
 *              operations and specialized retrieval methods.
 */

// --- 1. Database Configuration and Sequelize Initialization ---
// In a production application, this would typically be in a separate file (e.g., db.config.js)
// and imported. For this example, it's included here for completeness.

const { Sequelize, DataTypes, QueryTypes } = require('sequelize');

// Replace with your actual database connection details
const sequelize = new Sequelize('sakila', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Set to true to see SQL queries in console
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

/**
 * Authenticate and synchronize the database connection.
 * @async
 * @function connectDb
 * @returns {Promise<void>} A promise that resolves if the connection is successful,
 *                          or rejects if an error occurs.
 */
async function connectDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
        // await sequelize.sync({ alter: true }); // Use `alter: true` for schema updates, `force: true` for dropping tables
        // console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error('Database connection failed.');
    }
}

// Call connectDb to ensure the connection is established when the module loads
connectDb();

// --- 2. Film Model Definition ---
// In a production application, this would typically be in a separate file (e.g., models/film.model.js)
// and imported.

/**
 * Defines the Film model for Sequelize.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The Sequelize DataTypes object.
 * @returns {Model} The Film Sequelize model.
 */
const Film = sequelize.define('Film', {
    film_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    release_year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    language_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    original_language_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rental_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
    },
    rental_rate: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 4.99
    },
    length: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    replacement_cost: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 19.99
    },
    rating: {
        type: DataTypes.ENUM('G', 'PG', 'PG-13', 'R', 'NC-17'),
        allowNull: true,
        defaultValue: 'G'
    },
    special_features: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    last_update: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'film', // Explicitly specify the table name
    timestamps: false // Assuming 'last_update' is manually managed and no 'createdAt', 'updatedAt'
});

// --- 3. Film Repository Implementation ---
// This class encapsulates all data access logic for the Film entity.

/**
 * @class FilmRepository
 * @description A repository class for managing Film entities, providing
 *              an abstraction layer for database operations using Sequelize.
 *              It mirrors the functionality of a Spring Data JPA JpaRepository.
 */
class FilmRepository {
    /**
     * Creates an instance of FilmRepository.
     * @param {Model} FilmModel - The Sequelize Film model.
     * @param {Sequelize} sequelizeInstance - The Sequelize instance for raw queries.
     */
    constructor(FilmModel, sequelizeInstance) {
        this.FilmModel = FilmModel;
        this.sequelize = sequelizeInstance;
    }

    /**
     * Retrieves a film by its primary key (film_id).
     * This is a derived query method, similar to JpaRepository's findById or getFilmByFilmId.
     * @async
     * @param {number} id - The ID of the film to retrieve.
     * @returns {Promise<Film|null>} A promise that resolves to the Film object if found, otherwise null.
     * @throws {Error} If a database error occurs.
     */
    async getFilmByFilmId(id) {
        try {
            const film = await this.FilmModel.findByPk(id);
            return film;
        } catch (error) {
            console.error(`Error retrieving film by ID ${id}:`, error);
            throw new Error(`Could not retrieve film by ID: ${id}`);
        }
    }

    /**
     * Finds all films whose title exactly matches the given string.
     * This is a derived query method, similar to JpaRepository's findByTitle.
     * @async
     * @param {string} title - The exact title of the film(s) to find.
     * @returns {Promise<Array<Film>>} A promise that resolves to an array of Film objects.
     * @throws {Error} If a database error occurs.
     */
    async findByTitle(title) {
        try {
            const films = await this.FilmModel.findAll({
                where: { title: title }
            });
            return films;
        } catch (error) {
            console.error(`Error finding films by title "${title}":`, error);
            throw new Error(`Could not find films by title: ${title}`);
        }
    }

    /**
     * Executes a native SQL query to count the number of inventory items available for a specific film.
     * @async
     * @param {number} id - The ID of the film (film_id).
     * @returns {Promise<number>} A promise that resolves to the count of available inventory items.
     * @throws {Error} If a database error occurs.
     */
    async getAvailableFilmCount(id) {
        try {
            const query = `
                SELECT count(*) AS availableCount
                FROM film f
                INNER JOIN inventory i ON f.film_id = i.film_id
                WHERE i.film_id = :id
            `;
            const result = await this.sequelize.query(query, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            });
            // The result is an array of objects, e.g., [{ availableCount: 5 }]
            return result[0] ? parseInt(result[0].availableCount, 10) : 0;
        } catch (error) {
            console.error(`Error getting available film count for film ID ${id}:`, error);
            throw new Error(`Could not get available film count for film ID: ${id}`);
        }
    }

    /**
     * Executes a native SQL query to retrieve all Film entities that have at least one
     * corresponding entry in the inventory table (i.e., are currently in stock).
     * @async
     * @returns {Promise<Array<Film>>} A promise that resolves to an array of Film objects.
     * @throws {Error} If a database error occurs.
     */
    async getAvailableFilms() {
        try {
            const query = `
                SELECT f.*
                FROM film f
                INNER JOIN inventory i ON f.film_id = i.film_id
                GROUP BY f.film_id
            `;
            // Using mapToModel: true to map raw results directly to Film model instances
            const films = await this.sequelize.query(query, {
                type: QueryTypes.SELECT,
                model: this.FilmModel,
                mapToModel: true
            });
            return films;
        } catch (error) {
            console.error('Error getting available films:', error);
            throw new Error('Could not retrieve available films.');
        }
    }

    /**
     * Executes a native SQL query to retrieve all Film entities that belong to a specific category.
     * @async
     * @param {number} categoryId - The ID of the category.
     * @returns {Promise<Array<Film>>} A promise that resolves to an array of Film objects.
     * @throws {Error} If a database error occurs.
     */
    async getAllFilmsByCategory(categoryId) {
        try {
            const query = `
                SELECT f.*
                FROM film f
                INNER JOIN film_category fc ON f.film_id = fc.film_id
                INNER JOIN category c ON fc.category_id = c.category_id
                WHERE c.category_id = :categoryId
                GROUP BY f.film_id
            `;
            const films = await this.sequelize.query(query, {
                replacements: { categoryId: categoryId },
                type: QueryTypes.SELECT,
                model: this.FilmModel,
                mapToModel: true
            });
            return films;
        } catch (error) {
            console.error(`Error getting films by category ID ${categoryId}:`, error);
            throw new Error(`Could not retrieve films by category ID: ${categoryId}`);
        }
    }

    /**
     * Executes a native SQL query to retrieve all Film entities in which a specific actor has starred.
     * @async
     * @param {number} actorId - The ID of the actor.
     * @returns {Promise<Array<Film>>} A promise that resolves to an array of Film objects.
     * @throws {Error} If a database error occurs.
     */
    async getAllFilmsByActor(actorId) {
        try {
            const query = `
                SELECT f.*
                FROM actor a
                INNER JOIN film_actor fa ON a.actor_id = fa.actor_id
                INNER JOIN film f ON fa.film_id = f.film_id
                WHERE a.actor_id = :actorId
                GROUP BY f.film_id
            `;
            const films = await this.sequelize.query(query, {
                replacements: { actorId: actorId },
                type: QueryTypes.SELECT,
                model: this.FilmModel,
                mapToModel: true
            });
            return films;
        } catch (error) {
            console.error(`Error getting films by actor ID ${actorId}:`, error);
            throw new Error(`Could not retrieve films by actor ID: ${actorId}`);
        }
    }

    // --- Inherited JpaRepository methods (CRUD) ---
    // These are implicitly provided by Sequelize's Model, but can be wrapped
    // for consistency or to add specific business logic/logging.

    /**
     * Saves a film entity to the database. If the film has a primary key, it updates; otherwise, it creates.
     * @async
     * @param {object} filmData - The film data to save.
     * @returns {Promise<Film>} A promise that resolves to the saved (created or updated) Film object.
     * @throws {Error} If a database error occurs.
     */
    async save(filmData) {
        try {
            if (filmData.film_id) {
                const [updatedRows] = await this.FilmModel.update(filmData, {
                    where: { film_id: filmData.film_id }
                });
                if (updatedRows > 0) {
                    return this.FilmModel.findByPk(filmData.film_id);
                }
                throw new Error(`Film with ID ${filmData.film_id} not found for update.`);
            } else {
                const newFilm = await this.FilmModel.create(filmData);
                return newFilm;
            }
        } catch (error) {
            console.error('Error saving film:', error);
            throw new Error('Could not save film.');
        }
    }

    /**
     * Retrieves all film entities from the database.
     * @async
     * @returns {Promise<Array<Film>>} A promise that resolves to an array of all Film objects.
     * @throws {Error} If a database error occurs.
     */
    async findAll() {
        try {
            const films = await this.FilmModel.findAll();
            return films;
        } catch (error) {
            console.error('Error retrieving all films:', error);
            throw new Error('Could not retrieve all films.');
        }
    }

    /**
     * Deletes a film entity by its primary key.
     * @async
     * @param {number} id - The ID of the film to delete.
     * @returns {Promise<number>} A promise that resolves to the number of deleted rows (0 or 1).
     * @throws {Error} If a database error occurs.
     */
    async deleteById(id) {
        try {
            const deletedRows = await this.FilmModel.destroy({
                where: { film_id: id }
            });
            return deletedRows;
        } catch (error) {
            console.error(`Error deleting film by ID ${id}:`, error);
            throw new Error(`Could not delete film by ID: ${id}`);
        }
    }
}

// --- 4. Export the Repository Instance ---
// This makes the repository available for other parts of your application.

const filmRepository = new FilmRepository(Film, sequelize);

module.exports = filmRepository;

// --- Example Usage (for testing purposes, remove in production) ---
/*
(async () => {
    try {
        // Wait for DB connection
        await connectDb();

        console.log('\n--- Testing getFilmByFilmId (ID 1) ---');
        const film1 = await filmRepository.getFilmByFilmId(1);
        console.log('Film 1:', film1 ? film1.toJSON() : 'Not found');

        console.log('\n--- Testing findByTitle ("ACADEMY DINOSAUR") ---');
        const academyFilms = await filmRepository.findByTitle('ACADEMY DINOSAUR');
        console.log('Academy Dinosaur Films:', academyFilms.map(f => f.toJSON()));

        console.log('\n--- Testing getAvailableFilmCount (ID 1) ---');
        const availableCount = await filmRepository.getAvailableFilmCount(1);
        console.log('Available count for Film 1:', availableCount);

        console.log('\n--- Testing getAvailableFilms (first 5) ---');
        const availableFilms = await filmRepository.getAvailableFilms();
        console.log('First 5 Available Films:', availableFilms.slice(0, 5).map(f => f.toJSON()));

        console.log('\n--- Testing getAllFilmsByCategory (ID 6 - Comedy) ---');
        const comedyFilms = await filmRepository.getAllFilmsByCategory(6); // Assuming category_id 6 is 'Comedy'
        console.log('First 5 Comedy Films:', comedyFilms.slice(0, 5).map(f => f.toJSON()));

        console.log('\n--- Testing getAllFilmsByActor (ID 1 - PENELOPE GUINESS) ---');
        const penelopeFilms = await filmRepository.getAllFilmsByActor(1); // Assuming actor_id 1 is 'PENELOPE GUINESS'
        console.log('First 5 Films by Penelope Guiness:', penelopeFilms.slice(0, 5).map(f => f.toJSON()));

        console.log('\n--- Testing findAll (first 5) ---');
        const allFilms = await filmRepository.findAll();
        console.log('First 5 All Films:', allFilms.slice(0, 5).map(f => f.toJSON()));

        // Example of saving a new film (uncomment to test)
        // console.log('\n--- Testing save (new film) ---');
        // const newFilmData = {
        //     title: 'NODEJS ADVENTURE',
        //     description: 'A thrilling adventure in Node.js land.',
        //     release_year: 2023,
        //     language_id: 1, // Assuming language_id 1 exists
        //     rental_duration: 5,
        //     rental_rate: 2.99,
        //     length: 120,
        //     replacement_cost: 15.99,
        //     rating: 'PG-13',
        //     special_features: 'Trailers,Commentaries'
        // };
        // const createdFilm = await filmRepository.save(newFilmData);
        // console.log('Created Film:', createdFilm.toJSON());
        //
        // console.log('\n--- Testing save (update existing film) ---');
        // createdFilm.title = 'NODEJS ADVENTURE UPDATED';
        // const updatedFilm = await filmRepository.save(createdFilm.toJSON());
        // console.log('Updated Film:', updatedFilm.toJSON());
        //
        // console.log('\n--- Testing deleteById (newly created film) ---');
        // const deletedRows = await filmRepository.deleteById(createdFilm.film_id);
        // console.log(`Deleted ${deletedRows} row(s) for film ID ${createdFilm.film_id}`);
        // const deletedFilmCheck = await filmRepository.getFilmByFilmId(createdFilm.film_id);
        // console.log('Deleted Film Check:', deletedFilmCheck);

    } catch (error) {
        console.error('An error occurred during example usage:', error.message);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
})();
*/
```