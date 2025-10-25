/**
 * @module OrderEntity
 * @description
 * This module defines the `Order` class, a Plain Old JavaScript Object (POJO) or Entity,
 * designed to encapsulate the details of a customer's rental transaction.
 * It serves as a data model within the application's domain layer, typically
 * representing a record from a database (e.g., in a `sakilaproject` context).
 *
 * The `Order` class aggregates a `Customer`, a `Film`, and a `Rental` object,
 * providing a structured and encapsulated way to manage these related pieces of information.
 *
 * All operations within this class (constructor, getters, setters) are synchronous
 * as they involve in-memory data manipulation. Asynchronous operations (e.g., database
 * interactions, network calls) would typically be handled by service or repository layers
 * that interact with instances of this `Order` entity.
 */

/**
 * Represents an Order entity, encapsulating details about a customer's rental transaction.
 * This class serves as a Plain Old JavaScript Object (POJO) or an Entity,
 * commonly found in the domain layer of an application, mirroring a database record.
 *
 * It encapsulates a Customer, a Film, and a Rental record, providing
 * a structured way to manage and access this related data.
 *
 * @class Order
 */
class Order {
  /**
   * Creates an instance of Order.
   *
   * @param {object} customer - The Customer object associated with this order.
   *   Must be a non-null and non-undefined object. It is expected to be an instance
   *   of a `Customer` class or a plain object representing customer data.
   * @param {object} film - The Film object associated with this order.
   *   Must be a non-null and non-undefined object. It is expected to be an instance
   *   of a `Film` class or a plain object representing film data.
   * @param {object} rental - The Rental object associated with this order.
   *   Must be a non-null and non-undefined object. It is expected to be an instance
   *   of a `Rental` class or a plain object representing rental data.
   * @throws {TypeError} If any of the required parameters (customer, film, rental)
   *   are null, undefined, or not objects.
   */
  constructor(customer, film, rental) {
    if (!customer || typeof customer !== 'object') {
      throw new TypeError('Customer object is required and must be a valid object.')
    }
    if (!film || typeof film !== 'object') {
      throw new TypeError('Film object is required and must be a valid object.')
    }
    if (!rental || typeof rental !== 'object') {
      throw new TypeError('Rental object is required and must be a valid object.')
    }

    /**
     * @private
     * @type {object}
     * The Customer object associated with this order.
     */
    this._customer = customer

    /**
     * @private
     * @type {object}
     * The Film object associated with this order.
     */
    this._film = film

    /**
     * @private
     * @type {object}
     * The Rental object associated with this order.
     */
    this._rental = rental
  }

  /**
   * Gets the Customer object associated with this order.
   * This is a synchronous operation.
   *
   * @returns {object} The Customer object.
   */
  get customer() {
    return this._customer
  }

  /**
   * Sets the Customer object for this order.
   * This is a synchronous operation.
   *
   * @param {object} newCustomer - The new Customer object to associate with this order.
   *   Must be a non-null and non-undefined object.
   * @throws {TypeError} If the `newCustomer` is null, undefined, or not an object.
   */
  set customer(newCustomer) {
    if (!newCustomer || typeof newCustomer !== 'object') {
      throw new TypeError('New customer must be a valid object.')
    }
    this._customer = newCustomer
  }

  /**
   * Gets the Film object associated with this order.
   * This is a synchronous operation.
   *
   * @returns {object} The Film object.
   */
  get film() {
    return this._film
  }

  /**
   * Sets the Film object for this order.
   * This is a synchronous operation.
   *
   * @param {object} newFilm - The new Film object to associate with this order.
   *   Must be a non-null and non-undefined object.
   * @throws {TypeError} If the `newFilm` is null, undefined, or not an object.
   */
  set film(newFilm) {
    if (!newFilm || typeof newFilm !== 'object') {
      throw new TypeError('New film must be a valid object.')
    }
    this._film = newFilm
  }

  /**
   * Gets the Rental object associated with this order.
   * This is a synchronous operation.
   *
   * @returns {object} The Rental object.
   */
  get rental() {
    return this._rental
  }

  /**
   * Sets the Rental object for this order.
   * This is a synchronous operation.
   *
   * @param {object} newRental - The new Rental object to associate with this order.
   *   Must be a non-null and non-undefined object.
   * @throws {TypeError} If the `newRental` is null, undefined, or not an object.
   */
  set rental(newRental) {
    if (!newRental || typeof newRental !== 'object') {
      throw new TypeError('New rental must be a valid object.')
    }
    this._rental = newRental
  }
}

module.exports = Order