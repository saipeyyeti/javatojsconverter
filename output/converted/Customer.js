```javascript
/**
 * @module Customer
 */

/**
 * Represents a Customer entity, designed to map directly to a database table.
 * This class serves as a Data Transfer Object (DTO) and a Value Object,
 * encapsulating customer data and providing methods for identity management and comparison.
 *
 * In a Node.js environment, this class would typically be used in conjunction with an ORM
 * (e.g., Sequelize, TypeORM, Prisma) which handles the actual database mapping and persistence.
 * This class itself is a pure data model and does not contain database interaction logic.
 * Therefore, it does not contain any asynchronous operations (`async/