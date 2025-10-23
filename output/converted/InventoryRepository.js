```javascript
/**
 * @file InventoryRepository.js
 * @description This file defines the InventoryRepository class, a Data Access Object (DAO)
 *              for the Inventory entity. It leverages Sequelize ORM to interact with the
 *              database, providing standard CRUD operations and custom queries,
 *              mirroring the functionality of the Java Spring Data JPA InventoryRepository.
 */

const db = require('../models'); // Assuming models/index.js exports db object
const Inventory = db.Inventory;
const Rental = db.Rental; // Needed for the join query in getInventoriesByInventoryId
const { Op } = db.Sequelize; // For advanced query operators if needed

/**
 * @class InventoryRepository
 * @description A Data Access Object (DAO) for the Inventory entity, leveraging Sequelize ORM.
 *              This class provides methods for standard Create, Read, Update, and Delete (CRUD)
 *              operations and custom queries related to inventory data, mirroring the functionality
 *              of the Java Spring Data JPA InventoryRepository.
 */
class InventoryRepository {
  /**
   * @constructor
   * @description The constructor for the InventoryRepository.
   *              In a real application, models might be injected for better testability,
   *              but for this example, they are directly imported from the `db` object.
   */
  constructor() {
    // Models are directly imported, but could be passed as arguments for better testability.
  }

  /**
   * Persists a given Inventory entity. If the entity already exists (based on its primary key `inventory_id`),
   * it updates it; otherwise, it inserts a new one. This method acts as an upsert.
   * @async
   * @param {object} inventoryData - The inventory data to save. If `inventory_id` is provided,
   *                                 it attempts to update; otherwise, it inserts.
   * @returns {Promise<object>} A promise that resolves to the saved or updated Inventory instance.
   * @throws {Error} If there's a database error during the save operation.
   */
  async save(inventoryData) {
    try {
      // Sequelize's upsert method handles both creation and updating based on primary key.
      const [inventory, created] = await Inventory.upsert(inventoryData, {
        returning: true // For PostgreSQL, returns the instance. For MySQL/MariaDB, returns [instance, created]
      });
      // For MySQL/MariaDB, `upsert` returns `[instance, created]`. We need to fetch the instance if `returning` isn't fully supported.
      // However, the `inventory` variable will hold the instance if it was created or updated.
      if (inventory) {
        return inventory;
      } else {
        // Fallback for dialects where `returning` doesn't return the instance directly on update
        return await Inventory.findByPk(inventoryData.inventory_id);
      }
    } catch (error) {
      console.error(`[InventoryRepository] Error saving inventory: ${error.message}`);
      throw new Error(`Failed to save inventory: ${error.message}`);
    }
  }

  /**
   * Retrieves an Inventory entity by its primary key (`inventory_id`).
   * @async
   * @param {number} id - The `inventory_id` of the entity to retrieve.
   * @returns {Promise<object|null>} A promise that resolves to the Inventory instance if found, otherwise null.
   * @throws {Error} If there's a database error during the retrieval operation.
   */
  async findById(id) {
    try {
      return await Inventory.findByPk(id);
    } catch (error) {
      console.error(`[InventoryRepository] Error finding inventory by ID ${id}: ${error.message}`);
      throw new Error(`Failed to find inventory by ID: ${error.message}`);
    }
  }

  /**
   * Retrieves all instances of the Inventory entity.
   * @async
   * @returns {Promise<Array<object>>} A promise that resolves to an array of all Inventory instances.
   * @throws {Error} If there's a database error during the retrieval operation.
   */
  async findAll() {
    try {
      return await Inventory.findAll();
    } catch (error) {
      console.error(`[InventoryRepository] Error finding all inventories: ${error.message}`);
      throw new Error(`Failed to find all inventories: ${error.message}`);
    }
  }

  /**
   * Deletes a given Inventory entity.
   * @async
   * @param {object} inventory - The Inventory instance to delete. Must have `inventory_id`.
   * @returns {Promise<number>} A promise that resolves to the number of rows deleted (0 or 1).
   * @throws {Error} If the inventory object is invalid or a database error occurs.
   */
  async delete(inventory) {
    try {
      if (!inventory || !inventory.inventory_id) {
        throw new Error("Inventory object with 'inventory_id' is required for deletion.");
      }
      return await Inventory.destroy({
        where: { inventory_id: inventory.inventory_id }
      });
    } catch (error) {
      console.error(`[InventoryRepository] Error deleting inventory: ${error.message}`);
      throw new Error(`Failed to delete inventory: ${error.message}`);
    }
  }

  /**
   * Deletes an Inventory entity by its primary key (`inventory_id`).
   * @async
   * @param {number} id - The `inventory_id` of the entity to delete.
   * @returns {Promise<number>} A promise that resolves to the number of rows deleted (0 or 1).
   * @throws {Error} If there's a database error during the delete operation.
   */
  async deleteById(id) {
    try {
      return await Inventory.destroy({
        where: { inventory_id: id }
      });
    } catch (error) {
      console.error(`[InventoryRepository] Error deleting inventory by ID ${id}: ${error.message}`);
      throw new Error(`Failed to delete inventory by ID: ${error.message}`);
    }
  }

  /**
   * Returns the number of Inventory entities available.
   * @async
   * @returns {Promise<number>} A promise that resolves to the total count of Inventory records.
   * @throws {Error} If there's a database error during the count operation.
   */
  async count() {
    try {
      return await Inventory.count();
    } catch (error) {
      console.error(`[InventoryRepository] Error counting inventories: ${error.message}`);
      throw new Error(`Failed to count inventories: ${error.message}`);
    }
  }

  /**
   * Returns whether an Inventory entity with the given ID exists.
   * @async
   * @param {number} id - The `inventory_id` to check for existence.
   * @returns {Promise<boolean>} A promise that resolves to true if an entity exists, false otherwise.
   * @throws {Error} If there's a database error during the existence check.
   */
  async existsById(id) {
    try {
      const count = await Inventory.count({
        where: { inventory_id: id }
      });
      return count > 0;
    } catch (error) {
      console.error(`[InventoryRepository] Error checking existence for inventory ID ${id}: ${error.message}`);
      throw new Error(`Failed to check existence by ID: ${error.message}`);
    }
  }

  // --- Custom Methods Defined in the Original Java InventoryRepository ---

  /**
   * Retrieves a single Inventory record based on its `inventory_id`, including an inner join
   * with the `rental` table. This method will only return an Inventory if it has at least one
   * associated rental record. The returned object will be the Inventory instance itself,
   * without the joined rental data, to match the original Java method's return type.
   * @async
   * @param {number} inventoryId - The `inventory_id` of the inventory to retrieve.
   * @returns {Promise<object|null>} A promise that resolves to