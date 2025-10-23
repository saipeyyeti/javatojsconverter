```javascript
/**
 * @file CustomerRepository.js
 * @description This file defines the CustomerRepository, a Data Access Object (DAO)
 *              for managing Customer entities using Sequelize ORM. It provides
 *              methods for standard CRUD operations and custom queries,
 *              mirroring the functionality of the Java Spring Data JPA CustomerRepository.
 */

const { Sequelize, DataTypes, Op } = require('sequelize');

// --- 1. Sequelize Initialization (Example - In a real app, this would be in a config file) ---
/**
 * Initializes and returns a Sequelize instance.
 * Replace with your actual database configuration.
 * @returns {Sequelize} The initialized Sequelize instance.
 */
const initializeSequelize = () => {
    // Example configuration for a MySQL database (Sakila project context)
    // IMPORTANT: Replace 'your_database', 'your_user', 'your_password' with actual credentials.
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

    // Optional: Test the database connection
    // (This block would typically be in your application's startup logic)
    // async function testConnection() {
    //     try {
    //         await sequelize.authenticate();
    //         console.log('Database connection has been established successfully.');
    //     } catch (error) {
    //         console.error('Unable to connect to the database:', error);
    //         process.exit(1); // Exit if database connection fails
    //     }
    // }
    // testConnection();

    return sequelize;
};

const sequelize = initializeSequelize();

// --- 2. Customer Model Definition ---
/**
 * Defines the Customer model for Sequelize.
 * This corresponds to the `Customer` entity in the Java application.
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {object} The Customer Sequelize model.
 */
const CustomerModel = (sequelize) => {
    const Customer = sequelize.define('Customer', {
        customer_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'customer_id' // Explicitly map to database column
        },
        store_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'store_id'
        },
        first_name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'first_name'
        },
        last_name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: true, // Email can be null in Sakila
            unique: true, // Assuming email should be unique if present
            field: 'email'
        },
        address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'address_id'
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'active'
        },
        create_date: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'create_date'
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'last_update'
        }
    }, {
        tableName: 'customer', // Explicitly set table name
        timestamps: false // Sakila tables typically manage their own timestamps
    });

    return Customer;
};

const Customer = CustomerModel(sequelize);

// --- 3. CustomerRepository Implementation ---

/**
 * @class CustomerRepository
 * @description A Data Access Object (DAO) for Customer entities.
 *              It encapsulates all database operations related to the Customer model,
 *              providing an abstraction layer over Sequelize.
 */
class CustomerRepository {
    /**
     * Creates an instance of CustomerRepository.
     * @param {object} customerModel - The Sequelize Customer model.
     */
    constructor(customerModel) {
        this.Customer = customerModel;
    }

    // --- Inherited Methods (from JpaRepository equivalent) ---

    /**
     * Saves a Customer entity. If the entity has a primary key, it attempts to update;
     * otherwise, it inserts a new record.
     * @param {object} customerData - The customer data to save.
     * @returns {Promise<object>} The saved or updated Customer entity.
     * @throws {Error} If there is a database error.
     */
    async save(customerData) {
        try {
            // Sequelize's upsert method handles both insert and update based on primary key
            const [customer, created] = await this.Customer.upsert(customerData, {
                returning: true // Return the updated/created instance
            });
            return customer;
        } catch (error) {
            console.error(`[CustomerRepository] Error saving customer: ${error.message}`);
            throw new Error(`Failed to save customer: ${error.message}`);
        }
    }

    /**
     * Retrieves a Customer entity by its primary key (customer_id).
     * @param {number} id - The primary key of the customer.
     * @returns {Promise<object|null>} The Customer entity if found, otherwise null.
     * @throws {Error} If there is a database error.
     */
    async findById(id) {
        try {
            return await this.Customer.findByPk(id);
        } catch (error) {
            console.error(`[CustomerRepository] Error finding customer by ID ${id}: ${error.message}`);
            throw new Error(`Failed to find customer by ID: ${error.message}`);
        }
    }

    /**
     * Retrieves all Customer entities.
     * @returns {Promise<Array<object>>} A list of all Customer entities.
     * @throws {Error} If there is a database error.
     */
    async findAll() {
        try {
            return await this.Customer.findAll();
        } catch (error) {
            console.error(`[CustomerRepository] Error retrieving all customers: ${error.message}`);
            throw new Error(`Failed to retrieve all customers: ${error.message}`);
        }
    }

    /**
     * Deletes a Customer entity by its primary key.
     * @param {number} id - The primary key of the customer to delete.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If there is a database error.
     */
    async deleteById(id) {
        try {
            return await this.Customer.destroy({
                where: { customer_id: id }
            });
        } catch (error) {
            console.error(`[CustomerRepository] Error deleting customer by ID ${id}: ${error.message}`);
            throw new Error(`Failed to delete customer by ID: ${error.message}`);
        }
    }

    /**
     * Deletes a Customer entity.
     * @param {object} customerEntity - The customer entity object to delete. Must contain `customer_id`.
     * @returns {Promise<number>} The number of rows deleted (0 or 1).
     * @throws {Error} If the entity does not have a customer_id or there is a database error.
     */
    async delete(customerEntity) {
        if (!customerEntity || !customerEntity.customer_id) {
            throw new Error("Customer entity must have a 'customer_id' to be deleted.");
        }
        return this.deleteById(customerEntity.customer_id);
    }

    /**
     * Returns the total number of Customer entities available.
     * @returns {Promise<number>} The total count of customers.
     * @throws {Error} If there is a database error.
     */
    async count() {
        try {
            return await this.Customer.count();
        } catch (error) {
            console.error(`[CustomerRepository] Error counting customers: ${error.message}`);
            throw new Error(`Failed to count customers: ${error.message}`);
        }
    }

    /**
     * Checks if an entity with the given ID exists.
     * @param {number} id - The primary key of the customer.
     * @returns {Promise<boolean>} True if an entity with the given ID exists, false otherwise.
     * @throws {Error} If there is a database error.
     */
    async existsById(id) {
        try {
            const count = await this.Customer.count({
                where: { customer_id: id }
            });
            return count > 0;
        } catch (error) {
            console.error(`[CustomerRepository] Error checking existence for ID ${id}: ${error.message}`);
            throw new Error(`Failed to check existence by ID: ${error.message}`);
        }
    }

    // --- Custom Methods (defined in CustomerRepository) ---

    /**
     * Authenticates or retrieves a Customer based on their email (username) and customer_id (password).
     * NOTE: Using customer_id as a "password" is highly unusual and insecure for production systems.
     * This method is implemented to match the original Java functionality.
     * @param {string} username - The customer's email address.
     * @param {number} password - The customer's ID (acting as a password).
     * @returns {Promise<object|null>} The Customer entity if credentials match, otherwise null.
     * @throws {Error} If there is a database error.
     */
    async getCustomerByCredentials(username, password) {
        try {
            return await this.Customer.findOne({
                where: {
                    email: username,
                    customer_id: password
                }
            });
        } catch (error) {
            console.error(`[CustomerRepository] Error getting customer by credentials: ${error.message}`);
            throw new Error(`Failed to get customer by credentials: ${error.message}`);
        }
    }

    /**
     * Retrieves a single Customer entity by their email address.
     * @param {string} username - The customer's email address.
     * @returns {Promise<object|null>} The Customer entity if found, otherwise null.
     * @throws {Error} If there is a database error.
     */
    async getCustomerByUsername(username) {
        try {
            return await this.Customer.findOne({
                where: { email: username }
            });
        } catch (error) {
            console.error(`[CustomerRepository] Error getting customer by username '${username}': ${error.message}`);
            throw new Error(`Failed to get customer by username: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of Customer entities whose first name matches the given `firstName`.
     * @param {string} firstName - The first name to search for.
     * @returns {Promise<Array<object>>} A list of matching Customer entities.
     * @throws {Error} If there is a database error.
     */
    async getCustomersByFirstName(firstName) {
        try {
            return await this.Customer.findAll({
                where: { first_name: firstName }
            });
        } catch (error) {
            console.error(`[CustomerRepository] Error getting customers by first name '${firstName}': ${error.message}`);
            throw new Error(`Failed to get customers by first name: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of Customer entities whose last name matches the given `lastName`.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Array<object>>} A list of matching Customer entities.
     * @throws {Error} If there is a database error.
     */
    async getCustomersByLastName(lastName) {
        try {
            return await this.Customer.findAll({
                where: { last_name: lastName }
            });
        } catch (error) {
            console.error(`[CustomerRepository] Error getting customers by last name '${lastName}': ${error.message}`);
            throw new Error(`Failed to get customers by last name: ${error.message}`);
        }
    }

    /**
     * Retrieves a list of Customer entities whose first name and last name both match the given parameters.
     * @param {string} firstName - The first name to search for.
     * @param {string} lastName - The last name to search for.
     * @returns {Promise<Array<object>>} A list of matching Customer entities.
     * @throws {Error} If there is a database error.
     */
    async getCustomersByFullName(firstName, lastName) {
        try {
            return await this.Customer.findAll({
                where: {
                    first_name: firstName,
                    last_name: lastName
                }
            });
        } catch (error) {
            console.error(`[CustomerRepository] Error getting customers by full name '${firstName} ${lastName}': ${error.message}`);
            throw new Error(`Failed to get customers by full name: ${error.message}`);
        }
    }

    /**
     * Retrieves a single Customer entity by their `customer_id` (primary key).
     * This is functionally equivalent to `findById`.
     * @param {number} id - The customer's ID.
     * @returns {Promise<object|null>} The Customer entity if found, otherwise null.
     * @throws {Error} If there is a database error.
     */
    async getCustomerByCustomerId(id) {
        // Functionally identical to findById(id)
        return this.findById(id);
    }

    /**
     * Retrieves a single Customer entity by their email address.
     * This is functionally equivalent to `getCustomerByUsername`.
     * @param {string} email - The customer's email address.
     * @returns {Promise<object|null>} The Customer entity if found, otherwise null.
     * @throws {Error} If there is a database error.
     */
    async getCustomerByEmail(email) {
        // Functionally identical to getCustomerByUsername(email)
        return this.getCustomerByUsername(email);
    }

    /**
     * Returns the total number of records in the `customer` table.
     * This is functionally equivalent to `count()`.
     * @returns {Promise<number>} The total count of customers.
     * @throws {Error} If there is a database error.
     */
    async getCustomerCount() {
        // Functionally identical to count()
        return this.count();
    }
}

// --- Export the Repository Instance ---
const customerRepository = new CustomerRepository(Customer);

module.exports = {
    sequelize, // Export sequelize instance for potential external use (e.g., syncing models)
    Customer,  // Export Customer model for potential external use (e.g., associations)
    customerRepository // Export the repository instance
};

// --- Example Usage (Optional - for testing purposes) ---
/*
(async () => {
    try {
        // Ensure tables are created/synced (use `alter: true` for migrations in dev)
        await sequelize.sync({ alter: true });
        console.log("Database synced.");

        // 1. Create a new customer
        const newCustomer = await customerRepository.save({
            store_id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: `john.doe.${Date.now()}@example.com`, // Unique email
            address_id: 1 // Assuming address_id 1 exists
        });
        console.log('Created customer:', newCustomer.toJSON());

        // 2. Find by ID
        const foundCustomer = await customerRepository.findById(newCustomer.customer_id);
        console.log('Found customer by ID:', foundCustomer ? foundCustomer.toJSON() : 'Not found');

        // 3. Find by email (username)
        const customerByEmail = await customerRepository.getCustomerByEmail(newCustomer.email);
        console.log('Found customer by email:', customerByEmail ? customerByEmail.toJSON() : 'Not found');

        // 4. Find by credentials (demonstrates the unusual password usage)
        const customerByCreds = await customerRepository.getCustomerByCredentials(newCustomer.email, newCustomer.customer_id);
        console.log('Found customer by credentials:', customerByCreds ? customerByCreds.toJSON() : 'Not found');

        // 5. Get customers by first name
        const customersByFirstName = await customerRepository.getCustomersByFirstName('John');
        console.log('Customers by first name "John":', customersByFirstName.map(c => c.toJSON()));

        // 6. Get total count
        const totalCustomers = await customerRepository.getCustomerCount();
        console.log('Total customers:', totalCustomers);

        // 7. Check existence
        const exists = await customerRepository.existsById(newCustomer.customer_id);
        console.log(`Customer with ID ${newCustomer.customer_id} exists:`, exists);

        // 8. Update customer
        newCustomer.email = `john.doe.updated.${Date.now()}@example.com`;
        const updatedCustomer = await customerRepository.save(newCustomer.toJSON());
        console.log('Updated customer:', updatedCustomer.toJSON());

        // 9. Delete customer
        const deletedRows = await customerRepository.deleteById(newCustomer.customer_id);
        console.log(`Deleted ${deletedRows} customer(s) with ID ${newCustomer.customer_id}`);

        // 10. Verify deletion
        const deletedCustomer = await customerRepository.findById(newCustomer.customer_id);
        console.log('Found deleted customer by ID:', deletedCustomer ? deletedCustomer.toJSON() : 'Not found');

    } catch (error) {
        console.error('An error occurred during example usage:', error);
    } finally {
        await sequelize.close();
        console.log("Database connection closed.");
    }
})();
*/
```