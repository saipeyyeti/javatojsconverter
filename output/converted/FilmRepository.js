const { Sequelize, DataTypes, Op } = require('sequelize');

/**
 * @typedef {object} Film
 * @property {number} film_id - The primary key of the film.
 * @property {string} title - The title of the film.
 * @property {string} description - A description of the film.
 * @property {number} release_year - The release year of the film.
 * @property {number} language_id - Foreign key to the language table.
 * @property {number} rental_duration - The rental duration in days.
 * @property {number} rental_rate - The rental rate.
 * @property {number} length - The length of the film in minutes.
 * @property {number} replacement_cost - The replacement cost of the film.
 * @property {string} rating - The MPAA rating of the film.
 * @property {string} special_features - Special features included with the film.
 * @property {Date} last_update - The last update timestamp.
 * // Add other film properties as defined in your Sakila 'film' table
 */

/**
 * @class FilmRepository
 * @description
 * This class serves as a Data Access Object (DAO) for the `Film` entity,
 * providing an abstraction layer for data access and persistence operations
 * related to films using Sequelize ORM. It encapsulates standard CRUD
 * operations and custom data retrieval methods, interacting with the
 * underlying Sakila database schema.
 *
 * It mirrors the functionality of the original Java `FilmRepository`
 * interface, including native SQL queries and derived queries.
 */
class FilmRepository {
    /**
     * Creates an instance of FilmRepository.
     * @param {object} dependencies - The dependencies for the repository.
     * @param {Sequelize.Model<Film>} dependencies.FilmModel - The Sequelize Film model.
     *   This model should be defined elsewhere (e.g., in `models/film.model.js`)
     *   and passed in. It represents the 'film' table in the database.
     * @param {Sequelize} dependencies.sequelize - The Sequelize instance for raw queries.
     *   This is typically your main Sequelize connection object.
     */
    constructor({ FilmModel, sequelize }) {
        if (!FilmModel || !sequelize) {
            throw new Error('FilmModel and sequelize instance are required for FilmRepository.');
        }
        this.FilmModel = FilmModel;
        this.sequelize = sequelize;
    }

    // --- Standard CRUD Operations (equivalent to JpaRepository methods) ---

    /**
     * Creates a new film record in the database.
     * @param {object} filmData - The data for the new film.
     * @returns {Promise<Film>} The created film instance.
     * @throws {Error} If there is an issue creating the film.
     */
    async create(filmData) {
        try {
            return await this.FilmModel.create(filmData);
        } catch (error) {
            console.error(`[FilmRepository] Error creating film: ${error.message}`);
            throw new Error(`Failed to create film: ${error.message}`);
        }
    }

    /**
     * Finds a film by its primary key (film_id).
     * This is functionally similar to the inherited `findById` from JpaRepository.
     * @param {number} id - The ID of the film to find.
     * @returns {Promise<Film|null>} The film instance if found, otherwise null.
     * @throws {Error} If there is an issue retrieving the film.
     */
    async findById(id) {
        try {
            return await this.FilmModel.findByPk(id);
        } catch (error) {
            console.error(`[FilmRepository] Error finding film by ID ${id}: ${error.message}`);
            throw new Error(`Failed to find film by ID: ${error.message}`);
        }
    }

    /**
     * Retrieves all film records from the database.
     * This is functionally similar to the inherited `findAll` from JpaRepository.
     * @returns {Promise<Film[]>} A list of all film instances.
     * @throws {Error} If there is an issue retrieving films.
     */
    async findAll() {
        try {
            return await this.FilmModel.findAll();
        } catch (error) {
            console.error(`[FilmRepository] Error retrieving all films: ${error.message}`);
            throw new Error(`Failed to retrieve all films: ${error.message}`);
        }
    }

    /**
     * Updates an existing film record.
     * @param {number} id - The ID of the film to update.
     * @param {object} updateData - The data to update the film with.
     * @returns {Promise<number[]>} An array where the first element is the number of affected rows (0 or 1).
     * @throws {Error} If there is an issue updating the film.
     */
    async update(id, updateData) {
        try {
            const [affectedRows] = await this.FilmModel.update(updateData, {
                where: { film_id: id }
            });
            return [affectedRows];
        } catch (error) {
            console.error(`[FilmRepository] Error updating film with ID ${id}: ${error.message}`);
            throw new Error(`Failed to update film: ${error.message}`);
        }
    }

    /**
     * Deletes a film record by its primary key.
     * @param {number} id - The ID of the film to delete.
     * @returns {Promise<number>} The number of destroyed rows (0 or 1).
     * @throws {Error} If there is an issue deleting the film.
     */
    async delete(id) {
        try {
            return await this.FilmModel.destroy({
                where: { film_id: id }
            });
        } catch (error) {
            console.error(`[FilmRepository] Error deleting film with ID ${id}: ${error.message}`);
            throw new Error(`Failed to delete film: ${error.message}`);
        }
    }

    // --- Custom Data Retrieval Methods (equivalent to @Query and derived queries) ---

    /**
     * Executes a native SQL query to count how many entries exist in the `inventory` table
     * for a specific `film_id`. This effectively tells you how many copies of a particular
     * film are "available" (or at least present in the inventory).
     * @param {number} id - The ID of the film.
     * @returns {Promise<number>} The count of available films for the given ID.
     * @throws {Error} If there is an issue executing the query.
     */
    async getAvailableFilmCount(id) {
        try {
            const [results] = await this.sequelize.query(
                "SELECT count(*) AS count FROM film f INNER JOIN inventory i ON f.film_id = i.film_id WHERE i.film_id = :id",
                {
                    replacements: { id },
                    type: this.sequelize.QueryTypes.SELECT
                }
            );
            return results[0] ? results[0].count : 0;
        } catch (error) {
            console.error(`[FilmRepository] Error getting available film count for ID ${id}: ${error.message}`);
            throw new Error(`Failed to get available film count: ${error.message}`);
        }
    }

    /**
     * Executes a native SQL query to retrieve all `Film` entities that have at least one
     * entry in the `inventory` table. This provides a list of all films considered
     * "available" in the system.
     * @returns {Promise<Film[]>} A list of available film instances.
     * @throws {Error} If there is an issue executing the query.
     */
    async getAvailableFilms() {
        try {
            const [films] = await this.sequelize.query(
                "SELECT f.* FROM film f INNER JOIN inventory i ON f.film_id = i.film_id GROUP BY f.film_id",
                {
                    type: this.sequelize.QueryTypes.SELECT,
                    model: this.FilmModel, // Map results to FilmModel instances
                    mapToModel: true      // Important for mapping raw results to model instances
                }
            );
            return films;
        } catch (error) {
            console.error(`[FilmRepository] Error getting available films: ${error.message}`);
            throw new Error(`Failed to get available films: ${error.message}`);
        }
    }

    /**
     * Executes a native SQL query to retrieve all `Film` entities that belong to a specific
     * category, identified by `categoryId`. It joins `film`, `film_category`, and `category`
     * tables to achieve this.
     * @param {number} categoryId - The ID of the category.
     * @returns {Promise<Film[]>} A list of film instances belonging to the specified category.
     * @throws {Error} If there is an issue executing the query.
     */
    async getAllFilmsByCategory(categoryId) {
        try {
            const [films] = await this.sequelize.query(
                "SELECT f.* FROM film f INNER JOIN film_category fc ON f.film_id = fc.film_id INNER JOIN category c ON fc.category_id = c.category_id WHERE c.category_id = :categoryId GROUP BY f.film_id",
                {
                    replacements: { categoryId },
                    type: this.sequelize.QueryTypes.SELECT,
                    model: this.FilmModel,
                    mapToModel: true
                }
            );
            return films;
        } catch (error) {
            console.error(`[FilmRepository] Error getting films by category ID ${categoryId}: ${error.message}`);
            throw new Error(`Failed to get films by category: ${error.message}`);
        }
    }

    /**
     * Executes a native SQL query to retrieve all `Film` entities in which a specific actor
     * (identified by `actorId`) has appeared. It joins `actor`, `film_actor`, and `film` tables.
     * @param {number} actorId - The ID of the actor.
     * @returns {Promise<Film[]>} A list of film instances featuring the specified actor.
     * @throws {Error} If there is an issue executing the query.
     */
    async getAllFilmsByActor(actorId) {
        try {
            const [films] = await this.sequelize.query(
                "SELECT f.* FROM actor a INNER JOIN film_actor fa ON a.actor_id = fa.actor_id INNER JOIN film f ON fa.film_id = f.film_id WHERE a.actor_id = :actorId GROUP BY f.film_id",
                {
                    replacements: { actorId },
                    type: this.sequelize.QueryTypes.SELECT,
                    model: this.FilmModel,
                    mapToModel: true
                }
            );
            return films;
        } catch (error) {
            console.error(`[FilmRepository] Error getting films by actor ID ${actorId}: ${error.message}`);
            throw new Error(`Failed to get films by actor: ${error.message}`);
        }
    }

    /**
     * This is a Sequelize derived query. It automatically generates a query to find all `Film`
     * entities whose `title` attribute exactly matches the provided `String title`.
     * @param {string} title - The exact title of the film to search for.
     * @returns {Promise<Film[]>} A list of film instances matching the title.
     * @throws {Error} If there is an issue retrieving films by title.
     */
    async findByTitle(title) {
        try {
            return await this.FilmModel.findAll({
                where: { title: title }
            });
        } catch (error) {
            console.error(`[FilmRepository] Error finding films by title "${title}": ${error.message}`);
            throw new Error(`Failed to find films by title: ${error.message}`);
        }
    }

    /**
     * Another Sequelize derived query. It finds a single `Film` entity by its primary key, `film_id`.
     * This is functionally similar to `findById(id)` but uses a common Spring Data JPA naming
     * convention for direct ID lookups.
     * @param {number} id - The ID of the film to find.
     * @returns {Promise<Film|null>} The film instance if found, otherwise null.
     * @throws {Error} If there is an issue retrieving the film.
     */
    async getFilmByFilmId(id) {
        try {
            return await this.FilmModel.findByPk(id);
        } catch (error) {
            console.error(`[FilmRepository] Error getting film by film ID ${id}: ${error.message}`);
            throw new Error(`Failed to get film by film ID: ${error.message}`);
        }
    }
}

module.exports = FilmRepository;

/*
// --- Example of how FilmModel might be defined (not part of the repository file itself) ---
// This would typically be in a separate file like `src/models/film.model.js`

// const { Sequelize, DataTypes } = require('sequelize');

// const defineFilmModel = (sequelize) => {
//     const Film = sequelize.define('Film', {
//         film_id: {
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true,
//             field: 'film_id'
//         },
//         title: {
//             type: DataTypes.STRING(255),
//             allowNull: false,
//             field: 'title'
//         },
//         description: {
//             type: DataTypes.TEXT,
//             field: 'description'
//         },
//         release_year: {
//             type: DataTypes.INTEGER,
//             field: 'release_year'
//         },
//         language_id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             field: 'language_id'
//         },
//         rental_duration: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//             field: 'rental_duration'
//         },
//         rental_rate: {
//             type: DataTypes.DECIMAL(4, 2),
//             allowNull: false,
//             field: 'rental_rate'
//         },
//         length: {
//             type: DataTypes.INTEGER,
//             field: 'length'
//         },
//         replacement_cost: {
//             type: DataTypes.DECIMAL(5, 2),
//             allowNull: false,
//             field: 'replacement_cost'
//         },
//         rating: {
//             type: DataTypes.STRING(10),
//             field: 'rating'
//         },
//         special_features: {
//             type: DataTypes.STRING(255),
//             field: 'special_features'
//         },
//         last_update: {
//             type: DataTypes.DATE,
//             allowNull: false,
//             defaultValue: DataTypes.NOW,
//             field: 'last_update'
//         }
//     }, {
//         tableName: 'film',
//         timestamps: false
//     });

//     // Define associations here if needed for ORM joins, e.g.:
//     // Film.hasMany(sequelize.models.Inventory, { foreignKey: 'film_id' });
//     // Film.belongsToMany(sequelize.models.Category, { through: sequelize.models.FilmCategory, foreignKey: 'film_id' });
//     // Film.belongsToMany(sequelize.models.Actor, { through: sequelize.models.FilmActor, foreignKey: 'film_id' });

//     return Film;
// };

// // --- Example of how to initialize and use the repository ---
// // This would typically be in your application's entry point or a service layer.

// async function initializeDatabaseAndRepository() {
//     const sequelize = new Sequelize('sakila', 'root', 'password', {
//         host: 'localhost',
//         dialect: 'mysql',
//         logging: false // Set to true to see SQL queries in console
//     });

//     try {
//         await sequelize.authenticate();
//         console.log('Database connection established successfully.');

//         const FilmModel = defineFilmModel(sequelize);
//         // You would also define other models (Inventory, Category, Actor, FilmCategory, FilmActor)
//         // and their associations here if you plan to use Sequelize's ORM capabilities for joins.
//         // For the native queries in FilmRepository, only the existence of tables is strictly required.

//         const filmRepository = new FilmRepository({ FilmModel, sequelize });

//         // Example usage:
//         const film = await filmRepository.getFilmByFilmId(1);
//         if (film) {
//             console.log('Found Film:', film.toJSON());
//         } else {
//             console.log('Film not found.');
//         }

//         const availableFilms = await filmRepository.getAvailableFilms();
//         console.log(`Number of available films: ${availableFilms.length}`);

//     } catch (error) {
//         console.error('Unable to connect to the database or run queries:', error);
//     } finally {
//         await sequelize.close();
//         console.log('Database connection closed.');
//     }
// }

// // Call the initialization function to run the example
// // initializeDatabaseAndRepository();
*/