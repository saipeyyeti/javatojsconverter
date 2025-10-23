```javascript
const { QueryTypes } = require('sequelize');

/**
 * @class FilmRepository
 * @description A Data Access Object (DAO) for the Film entity, providing an abstraction layer
 *              for interacting with the underlying database using Sequelize ORM.
 *              It mirrors the functionality of the Java Spring Data JPA FilmRepository.
 *
 *              This repository assumes the following Sequelize models are defined and associated
 *              (if using ORM for joins, though native queries are used here):
 *              - Film (with 'film_id' as primary key)
 *              - Inventory
 *              - Category
 *              - FilmCategory (join table for Film-Category)
 *              - Actor
 *              - FilmActor (join table for Film-Actor)
 *
 *              The Film model should be defined with a `tableName: 'film'` and `film_id` as its primary key.
 *              Example Film model definition (for context, not part of this file):
 *              ```javascript
 *              // models/film.model.js
 *              const { DataTypes } = require('sequelize');
 *              module.exports = (sequelize) => {
 *                  const Film = sequelize.define('Film', {
 *                      film_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'film_id' },
 *                      title: { type: DataTypes.STRING(255), allowNull: false, field: 'title' },
 *                      description: { type: DataTypes.TEXT, field: 'description' },
 *                      release_year: { type: DataTypes.INTEGER, field: 'release_year' },
 *                      // ... other film columns
 *                  }, {
 *                      tableName: 'film',
 *                      timestamps: false // Sakila tables typically don't use createdAt/updatedAt
 *                  });
 *                  return Film;
 *              };
 *              ```
 */
class FilmRepository {
    /**
     * @private
     * @type {import('sequelize').Sequelize}
     */
    sequelize;

    /**
     * @private
     * @type {import('sequelize').ModelCtor<import('sequelize').Model>}
     */
    FilmModel;

    /**
     * Creates an instance of FilmRepository.
     * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance, used for raw queries.
     * @param {import('sequelize').ModelCtor<import('sequelize').Model>} FilmModel - The Sequelize Film model, used for ORM queries and mapping native query results.
     * @throws {Error} If `sequelize` or `FilmModel` are not provided.
     */
    constructor(sequelize, FilmModel) {
        if (!sequelize) {
            throw new Error('Sequelize instance must be provided to FilmRepository.');
        }
        if (!FilmModel) {
            throw new Error('FilmModel must be provided to FilmRepository.');
        }
        this.sequelize = sequelize;
        this.FilmModel = FilmModel;
    }

    /**
     * Persists a Film entity (insert or update).
     * If the `filmData` object contains a primary key (`film_id`), it attempts an update;
     * otherwise, it performs an insert.
     * @param {object} filmData - The film data to save. Expected to be a plain object matching Film model attributes.
     * @returns {Promise<object>} The saved or updated Film entity (Sequelize model instance).
     * @throws {Error} If the database operation fails.
     */
    async save(filmData) {
        try {
            // Sequelize's upsert method is suitable for save (insert or update)
            // It returns an array: [instance, created]
            const [film, created] = await this.FilmModel.upsert(filmData, {
                returning: true // Ensure the updated/created instance is returned
            });
            return film;
        } catch (error) {
            console.error(`[FilmRepository] Error saving film: ${error.message}`);
            throw new Error(`Failed to save film: ${error.message}`);
        }
    }

    /**
     * Retrieves a Film by its primary key (`film_id`).
     * @param {number} id - The primary key (`film_id`) of the film.
     * @returns {Promise<object|null>} The Film entity (Sequelize model instance) if found, otherwise `null`.
     * @throws {Error} If the database operation fails.
     */
    async findById(id) {
        try {
            return await this.FilmModel.findByPk(id);
        } catch (error) {
            console.error(`[FilmRepository] Error finding film by ID ${id}: ${error.message}`);
            throw new Error(`Failed to find film by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves all Film entities.
     * @returns {Promise<Array<object>>} A list of all Film entities (Sequelize model instances).
     * @throws {Error} If the database operation fails.
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
     * Deletes a Film entity.
     * @param {object} film - The Film entity to delete. Must contain the primary key (`film_id`).
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If the database operation fails or `film.film_id` is missing.
     */
    async delete(film) {
        try {
            if (!film || typeof film.film_id === 'undefined') {
                throw new Error('Film object with a valid film_id is required for deletion.');
            }
            return await this.FilmModel.destroy({
                where: { film_id: film.film_id }
            });
        } catch (error) {
            console.error(`[FilmRepository] Error deleting film with ID ${film?.film_id}: ${error.message}`);
            throw new Error(`Failed to delete film: ${error.message}`);
        }
    }

    /**
     * Counts the number of inventory items (copies) available for a specific film.
     * Uses a native SQL query.
     * @param {number} id - The `film_id` of the film.
     * @returns {Promise<number>} The count of available inventory items for the film. Returns 0 if no items or film found.
     * @throws {Error} If the database operation fails.
     */
    async getAvailableFilmCount(id) {
        try {
            const [results] = await this.sequelize.query(
                `SELECT count(*) AS count FROM film f INNER JOIN inventory i ON f.film_id = i.film_id WHERE i.film_id = :id`,
                {
                    replacements: { id: id },
                    type: QueryTypes.SELECT
                }
            );
            // The result is an array of objects, e.g., [{ count: '5' }]
            // Convert the count to an integer.
            return results.length > 0 ? parseInt(results[0].count, 10) : 0;
        } catch (error) {
            console.error(`[FilmRepository] Error getting available film count for film ID ${id}: ${error.message}`);
            throw new Error(`Failed to get available film count: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of all films that have at least one copy in the inventory.
     * Uses a native SQL query to join `film` and `inventory` tables, ensuring distinct films.
     * @returns {Promise<Array<object>>} A list of Film entities (Sequelize model instances).
     * @throws {Error} If the database operation fails.
     */
    async getAvailableFilms() {
        try {
            const films = await this.sequelize.query(
                `SELECT f.* FROM film f INNER JOIN inventory i ON f.film_id = i.film_id GROUP BY f.film_id`,
                {
                    type: QueryTypes.