To translate the Java `MvcConfig` into a complete, production-ready Node.js/JavaScript application, we'll use Express.js, a popular web framework, and EJS as the templating engine. The core functionality of mapping URLs directly to view names will be achieved by defining `GET` routes that render specific EJS templates.

This solution adheres to all requirements:
*   **Module exporting configuration objects framework:** The `configureMvcViews` function acts as a configuration module, taking the Express app instance and applying routes. The main `app.js` then exports the configured Express `app` instance.
*   **Maintain all functionality:** The routes `/`, `/home`, and `/login` are mapped to `home` and `login` views respectively, just like in the Java configuration.
*   **Use async/await for asynchronous operations:** All route handlers are defined as `async` functions, allowing for future asynchronous operations and aligning with modern Node.js practices, even if `res.render` itself doesn't strictly require `await` in this simple case.
*   **Include comprehensive JSDoc comments:** Detailed comments are provided for the module, functions, parameters, return values, and individual routes.
*   **Add proper error handling:** Individual route handlers include `try...catch` blocks, and a global error-handling middleware is implemented to catch unhandled errors and 404s.
*   **Follow Node.js best practices:** Uses `const`/`let`, `path.join` for directory paths, `process.env.PORT` for port configuration, and a modular structure within a single file for clarity and self-containment as requested.

---

To run this code:

1.  **Initialize your project:**
    ```bash
    mkdir my-spring-mvc-node-app
    cd my-spring-mvc-node-app
    npm init -y
    ```
2.  **Install dependencies:**
    ```bash
    npm install express ejs
    ```
3.  **Create the `app.js` file:** Copy the code below into `app.js`.
4.  **Create the `views` directory and template files:**
    *   Create a folder named `views` in the root of your project.
    *   Inside `views`, create `home.ejs`, `login.ejs`, and `error.ejs` with the content provided below.
5.  **Run the application:**
    ```bash
    node app.js
    ```
    Then, open your browser to `http://localhost:3000`, `http://localhost:3000/home`, or `http://localhost:3000/login`.

---

### `app.js` (Main Application File)

```javascript
/**
 * @file app.js
 * @description
 * This is a complete, production-ready Node.js Express application that mimics
 * the functionality of the provided Spring `MvcConfig` Java class.
 * It configures view controllers to map specific URL paths directly to view names,
 * bypassing explicit controller methods for simple page requests.
 *
 * It includes:
 * - Express.js setup for a web server.
 * - EJS as the templating engine for rendering views.
 * - Direct view controller mappings for '/', '/home', and '/login'.
 * - Comprehensive JSDoc comments.
 * - Asynchronous route handlers using `async/await`.
 * - Robust error handling.
 * - Node.js best practices.
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. View Engine Configuration ---
/**
 * @function setupViewEngine
 * @description Configures the application's view engine.
 * In this example, EJS is used, and views are expected in the 'views' directory.
 * @param {import('express').Application} expressApp - The Express application instance.
 * @returns {void}
 */
const setupViewEngine = (expressApp) => {
  expressApp.set('views', path.join(__dirname, 'views'));
  expressApp.set('view engine', 'ejs'); // Using EJS as the templating engine
  console.log(`View engine set to EJS, views directory: ${path.join(__dirname, 'views')}`);
};

// --- 2. MVC View Controller Configuration (Direct translation of MvcConfig) ---
/**
 * @module mvcConfig
 * @description
 * This function provides configuration for Spring MVC-like view controllers in an Express.js application.
 * It maps specific URL paths directly to view names, bypassing the need for explicit controller logic
 * for simple page requests. This directly translates the `addViewControllers` method from the Java `MvcConfig`.
 *
 * @param {import('express').Application} expressApp - The Express application instance to configure.
 * @returns {void}
 * @async
 * @throws {Error} If an invalid Express application instance is provided.
 */
const configureMvcViews = (expressApp) => {
  if (!expressApp || typeof expressApp.get !== 'function') {
    throw new Error('Invalid Express application instance provided to configureMvcViews.');
  }

  /**
   * Registers a view controller for the '/home' path.
   * Maps the URL `/home` to a view named `home`.
   * @function
   * @name GET /home
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @param {import('express').NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  expressApp.get('/home', async (req, res, next) => {
    try {
      // Spring's setViewName("home") translates to Express's res.render('home')
      // The 'home' string refers to a template file (e.g., home.ejs)
      // located in the configured views directory.
      res.render('home');
    } catch (error) {
      // Pass the error to the next middleware (error handler)
      console.error(`Error rendering home view for path /home: ${error.message}`);
      next(error);
    }
  });

  /**
   * Registers a view controller for the root path.
   * Maps the URL `/` to a view named `home`.
   * @function
   * @name GET /
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @param {import('express').NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  expressApp.get('/', async (req, res, next) => {
    try {
      res.render('home');
    } catch (error) {
      console.error(`Error rendering home view for path /: ${error.message}`);
      next(error);
    }
  });

  /**
   * Registers a view controller for the '/login' path.
   * Maps the URL `/login` to a view named `login`.
   * @function
   * @name GET /login
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @param {import('express').NextFunction