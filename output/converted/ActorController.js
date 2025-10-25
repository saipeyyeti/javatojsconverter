To convert the Java Spring MVC `ActorController` to Node.js/JavaScript using Express.js, we'll follow these steps:

1.  **Project Structure:** Organize files into `routes`, `services`, `middleware`, and `views` directories.
2.  **Express Router:** Use `express.Router()` to define routes, similar to how `@GetMapping` works in Spring.
3.  **Dependency Injection:** Instead of Spring's `@Autowired`, we'll pass service instances to the controller's constructor or a factory function.
4.  **Asynchronous Operations:** All interactions with services (which would typically involve database calls) will be treated as asynchronous using `async/await`.
5.  **Request Parameters:** `req.query` will be used to access URL query parameters.
6.  **View Rendering:** `res.render()` will replace `ModelMap` and return logical view names. We'll assume a templating engine like EJS for the views.
7.  **Error Handling:** Implement `try...catch` blocks in async route handlers and a global error handling middleware.
8.  **JSDoc:** Add comprehensive JSDoc comments for all modules, classes, and methods.
9.  **Redundant Methods:** The Java `findActorById` and `getActorFullNameFromID` methods in the controller are redundant as they directly delegate to the service or duplicate service logic. In the Node.js version, the controller will directly call the appropriate service methods, adhering to the "thin controller" principle.

---

First, let's set up mock service files to simulate the `ActorService` and `FilmService` behavior, as the original Java code doesn't include their implementations.

**1. `services/actorService.js` (Mock Service)**

```javascript
/**
 * @module ActorService
 * @description Provides business logic and data access operations for Actor entities.
 * In a real application, this would interact with a database.
 */
class ActorService {
    constructor() {
        // Mock data for demonstration purposes
        this.actors = [
            { id: 1, firstName: 'PENELOPE', lastName: 'GUINESS' },
            { id: 2, firstName: 'NICK', lastName: 'WAHLBERG' },
            { id: 3, firstName: 'ED', lastName: 'CHASE' },
            { id: 4, firstName: 'JENNIFER', lastName: 'DAVIS' },
            { id: 5, firstName: 'JOHNNY', lastName: 'LOLLOBRIGIDA' },
            { id: 6, firstName: 'BETTE', lastName: 'NICHOLSON' },
            { id: 7, firstName: 'GRACE', lastName: 'MOSTEL' },
            { id: 8, firstName: 'MATTHEW', lastName: 'JOHANSSON' },
            { id: 9, firstName: 'JOE', lastName: 'SWANK' },
            { id: 10, firstName: 'CHRISTIAN', lastName: 'GABLE' }
        ];
    }

    /**
     * Retrieves all actors from the data source.
     * @async
     * @returns {Promise<Array<Object>>} A promise that resolves to a list of all actor objects.
     */
    async getAllActors() {
        // Simulate an asynchronous database call
        return new Promise(resolve => setTimeout(() => resolve([...this.actors]), 50));
    }

    /**
     * Retrieves actors filtered by their first name.
     * @async
     * @param {string} firstName - The first name to filter by.
     * @returns {Promise<Array<Object>>} A promise that resolves to a list of actor objects matching the first name.
     */
    async getActorsByFirstName(firstName) {
        return new Promise(resolve => setTimeout(() =>
            resolve(this.actors.filter(actor => actor.firstName.toLowerCase() === firstName.toLowerCase())), 50));
    }

    /**
     * Retrieves actors filtered by their last name.
     * @async
     * @param {string} lastName - The last name to filter by.
     * @returns {Promise<Array<Object>>} A promise that resolves to a list of actor objects matching the last name.
     */
    async getActorsByLastName(lastName) {
        return new Promise(