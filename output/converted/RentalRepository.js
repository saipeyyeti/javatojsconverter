```javascript
/**
 * @file RentalRepository.js
 * @description
 * This module defines the `RentalRepository` class, which serves as a Data Access Object (DAO)
 * for the `Rental` entity. It abstracts database interactions using Sequelize ORM,
 * providing methods for standard CRUD operations and custom queries, mirroring the
 * functionality of a Spring Data JPA `RentalRepository` interface.
 *
 * It leverages async/await for asynchronous operations and includes comprehensive JSDoc comments
 * for clarity and maintainability, following Node.js best practices.
 */

// Import Sequelize's Op (Operators) if needed for more complex queries, though not strictly used in this example.
// const { Op } = require('sequelize');

/**
 * @class RentalRepository
 * @description
 * This class serves as a Data Access Object (DAO) for the `Rental` entity,
 * abstracting away the underlying database interactions using Sequelize ORM.
 * It provides methods for standard Create, Read, Update, and Delete (CRUD) operations
 * and custom queries related to the `Rental` entity, mirroring the functionality
 * of the original Spring Data JPA `RentalRepository`.
 *
 * It encapsulates the logic for accessing and storing `Rental` objects, providing
 * a collection-like interface to the domain layer.
 *
 * **Design Patterns Used:**
 * - **Repository Pattern:** Acts as an intermediary between the domain/business logic layer and the data mapping layer.
 * - **Data Access Object (DAO) Pattern:** Separates data access logic from business logic.
 *
 * **Dependencies:**
 * - `Rental` Sequelize Model: The core domain entity that the repository manages.
 * - `Customer` Sequelize Model: Used for defining relationships and performing joins.
 * - Sequelize ORM: The underlying framework for database interaction.
 */
class RentalRepository {
  /**
   * @private
   * @type {object}
   * @description The Sequelize model for the `Rental` entity.
   *              This model provides the interface for interacting with the `rental` table.
   */
  Rental;

  /**
   * @private
   * @type {object}
   * @description The Sequelize model for the `Customer` entity.
   *              This model is used to define associations and perform joins,
   *              specifically for queries involving customer-related filtering.
   */
  Customer;

  /**
   * Creates an instance of `RentalRepository`.
   *
   * @param {object} rentalModel - The Sequelize model for the `Rental` entity.
   *                               This is typically obtained from the Sequelize initialization.
   * @param {object} customerModel - The Sequelize model for the `Customer` entity.
   *                                 Required for queries that involve joining with the `customer` table.
   * @throws {Error} If either `rentalModel` or `customerModel` is not provided,
   *                 indicating a misconfiguration of the repository.
   */
  constructor(rentalModel, customerModel) {
    if (!rentalModel) {
      throw new Error('Rental Sequelize model must be provided to RentalRepository.');
    }
    if (!customerModel) {
      throw new Error('Customer Sequelize model must be provided to RentalRepository for join operations.');
    }
    this.Rental = rentalModel;
    this.Customer = customerModel;
  }

  /**
   * Retrieves a single `Rental` entity from the database based on its primary key, `rental_id`.
   * This method directly corresponds to `getRentalByRentalId(Integer id)` in the Java interface,
   * serving as a derived query method.
   *
   * @param {number} id - The `rental_id` (primary key) of the `Rental` entity to retrieve.
   * @returns {Promise<object|null>} A promise that resolves to the `Rental` object if found,
   *                                 otherwise `null`. The returned object is a Sequelize model instance.
   * @throws {Error} If a database error occurs during the retrieval process.
   */
  async getRentalByRentalId(id) {
    try {
      /**
       * @type {object|null}
       * @description The retrieved Rental object or null if not found.
       */
      const rental = await this.Rental.findByPk(id);
      return rental;
    } catch (error) {
      console.error(`[RentalRepository] Error fetching rental by ID ${id}:`, error);
      // Re-throw a more descriptive error for the calling service/controller.
      throw new Error(`Failed to retrieve rental by ID: ${id}. Details: ${error.message}`);
    }
  }

  /**
   * Retrieves a list of `Rental` entities that are associated with a specific `Customer` ID.
   * This method explicitly performs an `INNER JOIN` with the `customer` table,
   * mirroring the native SQL query in the Java interface:
   * `SELECT * FROM rental r INNER JOIN customer c ON r.customer_id = c.customer_id WHERE c.customer_id = :customerId`.
   *
   * This ensures that only rentals linked to an existing customer with the given ID are returned,
   * effectively validating the customer's existence through the join.
   *
   * @param {number} customerId - The `customer_id` to filter rentals by.
   * @returns {Promise<Array<object>>} A promise that resolves to a list of `Rental` objects.
   *                                   Each object is a Sequelize model instance.
   * @throws {Error} If a database error occurs during the retrieval process.
   */
  async getRentalByCustomerId(customerId) {
    try {
      /**
       * @