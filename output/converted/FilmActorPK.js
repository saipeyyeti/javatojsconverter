```javascript
/**
 * @module FilmActorPK
 * @description
 * This module provides the `FilmActorPK` class, a JavaScript equivalent of a Java composite primary key class.
 * It encapsulates `actorId` and `filmId` to uniquely identify a record in a FilmActor relationship,
 * providing value object semantics through custom equality and hashing methods.
 *
 * This class is designed to be a Plain Old JavaScript Object (POJO) that represents a composite key,
 * similar to how `FilmActorPK` is used in JPA for database mapping.
 * It adheres to best practices for value objects by correctly implementing `equals()` and `getHashCode()`.
 *
 * While the original Java class used JPA annotations (`@Column`, `@Id`), these are specific to Java's
 * ORM frameworks and do not have a direct equivalent in a generic Node.js utility. The core functionality
 * of encapsulating the key components and defining value-based equality is maintained.
 *
 * As this class primarily deals with synchronous data manipulation, asynchronous operations (async/await)
 * are not applicable to its internal logic. However, it is designed to be compatible with an asynchronous
 * environment if integrated into a larger framework.
 */

/**
 * Represents a composite primary key for a FilmActor relationship.
 * This class encapsulates the `actorId` and `filmId` that together uniquely identify
 * a record in a many-to-many join table (e.g., `FilmActor`).
 *
 * It acts as a Value Object, where its identity is based purely on the values of its attributes.
 *
 * @class FilmActorPK
 */
class FilmActorPK {
  /**
   * Creates an instance of FilmActorPK.
   *
   * @param {number} actorId - The ID of the actor. Must be a non-negative integer.
   * @param {number} filmId - The ID of the film. Must be a non-negative integer.
   * @throws {TypeError} If `actorId` or `filmId` are not valid numbers (not non-negative integers).
   */
  constructor(actorId, filmId) {
    // Use setters for initial validation and assignment
    this.setActorId(actorId);
    this.setFilmId(filmId);
  }

  /**
   * Gets the actor ID component of the composite primary key.
   *
   * @returns {number} The actor ID.
   */
  getActorId() {
    return this.actorId;
  }

  /**
   * Sets the actor ID component of the composite primary key.
   *
   * @param {number} actorId - The new actor ID. Must be a non-negative integer.
   * @throws {TypeError} If `actorId` is not a valid number (not a non-negative integer).
   */
  setActorId(actorId) {
    if (typeof actorId !== 'number' || !Number.isInteger(actorId) || actorId < 0) {
      throw new TypeError('Actor ID must be a non-negative integer.');
    }
    this.actorId = actorId;
  }

  /**
   * Gets the film ID component of the composite primary key.
   *
   * @returns {number} The film ID.
   */
  getFilmId() {
    return this.filmId;
  }

  /**
   * Sets the film ID component of the composite primary key.
   *
   * @param {number} filmId - The new film ID. Must be a non-negative integer.
   * @throws {TypeError} If `filmId` is not a valid number (not a non-negative integer).
   */
  setFilmId(filmId) {
    if (typeof filmId !== 'number' || !Number.isInteger(filmId) || filmId < 0) {
      throw new TypeError('Film ID must be a non-negative integer.');
    }
    this.filmId = filmId;
  }

  /**
   * Compares this `FilmActorPK` object with another object for equality.
   * Two `FilmActorPK` objects are considered equal if and only if their `actorId`
   * and `filmId` values are identical.
   *
   * @param {Object} o - The object to compare with.
   * @returns {boolean} `true` if the objects are equal, `false` otherwise.
   */
  equals(o) {
    // If it's the exact same object reference, they are equal
    if (this === o) {
      return true;
    }
    // If the other object is null or not an instance of FilmActorPK, they are not equal
    if (o === null || this.constructor !== o.constructor) {
      return false;
    }
    // Type assertion for JSDoc, not actual casting in JavaScript
    /** @type {FilmActorPK} */
    const that = o;
    // Compare the values of the component fields
    return this.actorId === that.actorId && this.filmId === that.filmId;
  }

  /**
   * Generates a hash code for this `FilmActorPK` object.
   * This method returns a string representation that is consistent with `equals()`.
   * If two objects are equal according to `equals()`, their `getHashCode()` must return
   * the same value. This is useful for using `FilmActorPK` objects as keys in custom
   * hash-based collections or for unique identification in scenarios where a string key is preferred.
   *
   * The implementation mimics `Objects.hash(actorId, filmId)` from Java by creating a
   * unique string identifier based on the key components.
   *
   * @returns {string} A string representing the hash code of the object.
   */
  getHashCode() {
    // A simple, consistent string concatenation is often sufficient for composite keys in JS
    // to serve as a unique identifier or a key in a Map/Set.
    return `${this.actorId}-${this.filmId}`;
  }

  /**
   * Returns a string representation of the FilmActorPK object.
   * Useful for debugging and logging.
   *
   * @returns {string} A string in the format "FilmActorPK{actorId=X, filmId=Y}".
   */
  toString() {
    return `FilmActorPK{actorId=${this.actorId}, filmId=${this.filmId}}`;
  }

  /**
   * Converts the FilmActorPK object to a plain JavaScript object.
   * This method is automatically called by `JSON.stringify()` when serializing
   * an instance of `FilmActorPK`, fulfilling the spirit of Java's `Serializable` interface.
   *
   * @returns {{actorId: number, filmId: number}} A plain object representation suitable for JSON serialization.
   */
  toJSON() {
    return {
      actorId: this.actorId,
      filmId: this.filmId,
    };
  }
}

export default FilmActorPK;
```