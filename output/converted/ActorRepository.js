```javascript
// File: src/models/actor.model.js

/**
 * @module models/actor.model
 * @description Defines the Sequelize model for the Actor entity, mapping to the 'actor' table.
 */

/**
 * Defines the Actor model for Sequelize.
 * This function is typically called by a Sequelize instance to define the model.
 *
 * @param {object} sequelize - The Sequelize instance.
 * @param {object} DataTypes - The Sequelize DataTypes object, used to define column types.
 * @returns {object} The defined Sequelize Actor model.
 */
module.exports = (sequelize, DataTypes) => {
    const Actor = sequelize.define('Actor', {
        /**
         * The primary key for the actor.
         * Maps to the `actor_id` column in the database.
         * @type {number}
         */
        actorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'actor_id' // Maps to the actual database column name
        },
        /**
         * The first name of the actor.
         * Maps to the `first_name` column in the database.
         * @type {string}
         */
        firstName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'first_name'
        },
        /**
         * The last name of the actor.
         * Maps to the `last_name` column in the database.
         * @type {string}
         */
        lastName: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'last_name'
        },
        /**
         * The timestamp of the last update to the actor record.
         * Maps to the `last_update` column in the database.
         * @type {Date}
         */
        lastUpdate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Sets default to current timestamp on creation
            field: 'last_update'
        }
    }, {
        tableName: 'actor', // Explicitly define the table name in the database
        timestamps: false // Disable Sequelize's default `createdAt` and `updatedAt` columns
    });

    // If there were associations (e.g., Actor has many Films), they would be defined here:
    // Actor.associate = (models) => {
    //     Actor.hasMany(models.Film, { foreignKey: 'actor_id' });
    // };

    return Actor;
};
```

```javascript
// File: src/repositories/actor.repository.js

/**
 * @module repositories/actor.repository
 * @description Provides data access operations for the Actor entity using Sequelize.
 * This module implements the Repository and Data Access Object (DAO) patterns
 * for the Actor entity, abstracting database interactions.
 */

/**
 * Represents the Actor data access object (DAO).
 * This class encapsulates all the logic required to access and manage data
 * for the 'actor' table in the database.
 * @class
 */
class ActorRepository {
    /**
     * Creates an instance of ActorRepository.
     * @param {object} ActorModel - The Sequelize Actor model, typically initialized from `src/models/actor.model.js`.
     *                               This model is used to interact with the 'actor' table.
     * @throws {Error} If the ActorModel is not provided, indicating a setup issue.
     */
    constructor(ActorModel) {
        if (!ActorModel) {
            throw new Error('ActorModel must be provided to ActorRepository constructor.');
        }
        /**
         * The Sequelize Actor model instance.
         * @private
         * @type {object}
         */
        this.Actor = ActorModel;
    }

    /**
     * Saves an Actor entity to the database.
     * If the `actorData` contains an `actorId`, it attempts to update the existing record.
     * Otherwise, it creates a new Actor record.
     *
     * @param {object} actorData - The actor data to save. Expected properties: `firstName`, `lastName`,
     *                             and optionally `actorId` for updates.
     * @returns {Promise<object>} A promise that resolves with the saved or updated Actor entity.
     * @throws {Error} If there is a database error during the save operation, or if an actor
     *                 with the given `actorId` is not found for an update.
     */
    async save(actorData) {
        try {
            if (actorData.actorId) {
                // Attempt to update an existing actor
                const [updatedRowsCount] = await this.Actor.update(actorData, {
                    where: { actorId: actorData.actorId }
                });

                if (updatedRowsCount > 0) {
                    // If rows were updated, fetch and return the updated record
                    return await this.Actor.findByPk(actorData.actorId);
                } else {
                    // If no rows were updated, check if the actor exists.
                    // If it exists, return it (meaning no actual changes were made or needed).
                    // If it doesn't exist, throw an error as it's an update for a non-existent record.
                    const existingActor = await this.Actor.findByPk(actorData.actorId);
                    if (existingActor) {
                        return existingActor; // Actor found, but no changes applied
                    } else {
                        throw new Error(`Actor with ID ${actorData.actorId} not found for update.`);
                    }
                }
            } else {
                // Create a new actor record
                return await this.Actor.create(actorData);
            }
        } catch (error) {
            console.error(`[ActorRepository] Error saving actor: ${error.message}`, error);
            throw new Error(`Failed to save actor: ${error.message}`);
        }
    }

    /**
     * Retrieves an Actor entity by its primary key (`actorId`).
     * This method corresponds to `JpaRepository.findById`.
     *
     * @param {number} id - The primary key (`actorId`) of the actor to retrieve.
     * @returns {Promise<object|null>} A promise that resolves with the Actor entity if found, otherwise `null`.
     * @throws {Error} If there is a database error during the retrieval operation.
     */
    async findById(id) {
        try {
            return await this.Actor.findByPk(id);
        } catch (error) {
            console.error(`[ActorRepository] Error finding actor by ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to retrieve actor by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Retrieves all Actor entities from the database.
     * This method corresponds to `JpaRepository.findAll`.
     *
     * @returns {Promise<Array<object>>} A promise that resolves with a list of all Actor entities.
     * @throws {Error} If there is a database error during the retrieval operation.
     */
    async findAll() {
        try {
            return await this.Actor.findAll();
        } catch (error) {
            console.error(`[ActorRepository] Error finding all actors: ${error.message}`, error);
            throw new Error(`Failed to retrieve all actors: ${error.message}`);
        }
    }

    /**
     * Deletes an Actor entity by its primary key (`actorId`).
     * This method corresponds to `JpaRepository.deleteById`.
     *
     * @param {number} id - The primary key (`actorId`) of the actor to delete.
     * @returns {Promise<number>} A promise that resolves with the number of deleted rows (0 or 1).
     * @throws {Error} If there is a database error during the deletion operation.
     */
    async deleteById(id) {
        try {
            return await this.Actor.destroy({
                where: { actorId: id }
            });
        } catch (error) {
            console.error(`[ActorRepository] Error deleting actor by ID ${id}: ${error.message}`, error);
            throw new Error(`Failed to delete actor by ID ${id}: ${error.message}`);
        }
    }

    /**
     * Deletes an Actor entity based on the provided actor object.
     * This method corresponds to `JpaRepository.delete(Actor entity)`.
     * It expects an object with an `actorId` property to identify the record to delete.
     *
     * @param {object} actor - The actor object containing the `actorId` to delete.
     * @returns {Promise<number>} A promise that resolves with the number of deleted rows (0 or 1).
     * @throws {Error} If `actor.actorId` is not provided or if there is a database error.
     */
    async delete(actor) {
        if (!actor || !actor.actorId) {
            throw new Error('Actor object with actorId must be provided for deletion.');
        }
        return this.deleteById(actor.actorId); // Delegate to deleteById
    }

    /**
     * Retrieves a list of Actor entities whose first name and last name match the provided arguments.
     * This method corresponds to `findActorsByFirstNameAndLastName` in the Java interface.
     *
     * @param {string} firstName - The first name to match.
     * @param {string} lastName - The last name to match.
     * @returns {Promise<Array<object>>} A promise that resolves with a list of matching Actor entities.
     * @throws {Error} If there is a database error during the retrieval operation.
     */
    async findActorsByFirstNameAndLastName(firstName, lastName) {
        try {
            return await this.Actor.findAll({
                where: {
                    firstName: firstName,
                    lastName: lastName
                }
            });
        } catch (error) {
            console.error(`[ActorRepository] Error finding actors by first name '${firstName}' and last name '${lastName}': ${error.message}`, error);
            throw new Error(`Failed to retrieve actors by first name and last name: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of Actor entities whose first name matches the provided argument.
     * This method corresponds to `findActorsByFirstName` in the Java interface.
     *
     * @param {string} firstName - The first name to match.
     * @returns {Promise<Array<object>>} A promise that resolves with a list of matching Actor entities.
     * @throws {Error} If there is a database error during the retrieval operation.
     */
    async findActorsByFirstName(firstName) {
        try {
            return await this.Actor.findAll({
                where: {
                    firstName: firstName
                }
            });
        } catch (error) {
            console.error(`[ActorRepository] Error finding actors by first name '${firstName}': ${error.message}`, error);
            throw new Error(`Failed to retrieve actors by first name: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of Actor entities whose last name matches the provided argument.
     * This method corresponds to `findActorsByLastName` in the Java interface.
     *
     * @param {string} lastName - The last name to match.
     * @returns {Promise<Array<object>>} A promise that resolves with a list of matching Actor entities.
     * @throws {Error} If there is a database error during the retrieval operation.
     */
    async findActorsByLastName(lastName) {
        try {
            return await this.Actor.findAll({
                where: {
                    lastName: lastName
                }
            });
        } catch (error) {
            console.error(`[ActorRepository] Error finding actors by last name '${lastName}': ${error.message}`, error);
            throw new Error(`Failed to retrieve actors by last name: ${error.message}`);
        }
    }

    /**
     * Retrieves a single Actor entity by its primary key (`actorId`).
     * This method corresponds to `getActorByActorId` in the Java interface.
     * It is functionally identical to `findById` but provided for naming consistency.
     *
     * @param {number} id -