// src/controller/MainController.js

/**
 * @file src/controller/MainController.js
 * @description Represents the main application controller, handling core routing logic.
 * Its methods simulate asynchronous operations, returning promises that resolve with specific strings.
 */

/**
 * @class MainController
 * @description Handles main application routes and business logic.
 * Methods are designed to be asynchronous, returning Promises.
 */
class MainController {
    /**
     * @method home
     * @description Simulates fetching data for the home page.
     * @returns {Promise<string>} A promise that resolves with the string "home".
     */
    async home() {
        // Simulate an asynchronous operation, e.g., fetching data from a database or API
        return Promise.resolve("home");
    }

    /**
     * @method account
     * @description Simulates fetching data for the account page.
     * @returns {Promise<string>} A promise that resolves with the string "account".
     */
    async account() {
        // Simulate an asynchronous operation
        return Promise.resolve("account");
    }

    /**
     * @method login
     * @description Simulates fetching data for the login page.
     * @returns {Promise<string>} A promise that resolves with the string "login".
     */
    async login() {
        // Simulate an asynchronous operation
        return Promise.resolve("login");
    }
}

export default MainController;