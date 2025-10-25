```javascript
/**
 * @typedef {object} User
 * @property {string[]} roles - An array of roles assigned to the user, e.g., ['ROLE_USER', 'ROLE_ADMIN'].
 * // Add other relevant user properties if known, e.g., id, username, email.
 */

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * `SuccessHandler` is a crucial component in a Node.js/Express application's authentication flow.
 * It is responsible for directing users to specific parts of the application immediately
 * after a successful login, based on their assigned roles.
 *
 * This class mirrors the functionality of Spring Security's `AuthenticationSuccessHandler`,
 * providing a robust and role-based post-authentication redirection strategy.
 *
 * @example
 * // In your Express application setup:
 * import SuccessHandler from './SuccessHandler.js';
 * const successHandler = new SuccessHandler();
 *
 * // Example with Passport.js custom callback:
 * app.post('/login', (req, res, next) => {
 *   passport.authenticate('local', (err, user, info) => {
 *     if (err) { return next(err); }
 *     if (!user) { return res.redirect('/login?error=' + info.message); }
 *     req.logIn(user, async (err) => {
 *       if (err) { return next(err); }
 *       // Call the success handler after successful login and session establishment
 *       await successHandler.onAuthenticationSuccess(req, res, user, next);
 *     });
 *   })(req, res, next);
 * });
 *
 * // Or with custom authentication logic:
 * app.post('/login', async (req, res, next) => {
 *   try {
 *     const user = await authenticateUser(req.body.username, req.body.password); // Your custom auth function
 *     if (!user) {
 *       return res.status(401).send('Invalid credentials');
 *     }
 *     // Assuming `authenticateUser` returns a user object with roles
 *     await successHandler.onAuthenticationSuccess(req, res, user, next);
 *   } catch (error) {
 *     next(error); // Pass authentication errors to Express's error handler
 *   }
 * });
 *
 * // Ensure you have an Express error handling middleware:
 * app.use((err, req, res, next) => {
 *   console.error(err.stack);
 *   res.status(500).send('An internal server error occurred.');
 * });
 */
class SuccessHandler {
    /**
     * Creates an instance of `SuccessHandler`.
     * In Node.js/Express, `res.redirect` directly handles the redirection,
     * so a separate `RedirectStrategy` object isn't explicitly needed as a dependency
     * within the class itself, unlike its Java counterpart.
     */
    constructor() {
        // No specific constructor logic is required for this implementation,
        // but it can be extended for dependency injection or configuration if needed.
    }

    /**
     * Handles the post-authentication redirection logic.
     * This method is designed to be invoked immediately after a user has successfully authenticated.
     * It determines the target URL for redirection based on the authenticated user's roles.
     *
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {User} user - The authenticated user object, which is expected to have a `roles` array property.
     * @param {NextFunction} [next] - The Express `next` middleware function.
     *                                 If provided, errors will be passed to it; otherwise, they will be thrown.
     * @returns {Promise<void>} A Promise that resolves once the redirection is handled or an error is thrown.
     * @throws {Error} If the user object or its roles are invalid, or if an unhandled role is encountered.
     * @throws {Error} If an error occurs during the redirection process (e.g., headers already sent).
     */
    async onAuthenticationSuccess(req, res, user, next) {
        // Validate the user object and its roles
        if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
            const error = new Error('Authentication successful, but no valid roles found for the user.');
            console.error(`[SuccessHandler] ${error.message} User:`, user);
            if (next) {
                return next(error);
            }
            throw error;
        }

        let targetUrl = null;

        // Iterate through roles to find a matching redirection strategy.
        // The original Java code redirects on the *first* matching role.
        for (const role of user.roles) {
            if (role === "ROLE_USER") {
                targetUrl = '/customer';
                break; // Found a primary role, stop checking
            } else if (role === "ROLE_ADMIN") {
                targetUrl = '/owner';
                break; // Found a primary role, stop checking
            }
            // Extend this logic with more `else if` blocks for additional roles
        }

        if (targetUrl) {
            try {
                // Perform the redirection using Express's response object
                res.redirect(targetUrl);
                console.log(`[SuccessHandler] User with roles ${user.roles.join(', ')} redirected to ${targetUrl}`);
            } catch (error) {
                // Catch potential errors during the redirection itself (e.g., headers already sent).
                // `res.redirect` is generally synchronous in its call, but errors can occur if
                // the response stream is already committed.
                const redirectError = new Error(`Failed to redirect user to ${targetUrl}: ${error.message}`);
                console.error(`[SuccessHandler] ${redirectError.message}`, error);
                if (next) {
                    return next(redirectError);
                }
                throw redirectError;
            }
        } else {
            // If no targetUrl was determined, it means the user has roles that are not explicitly handled.
            const unhandledRoleError = new Error(`Authentication successful, but user has an unhandled role: ${user.roles.join(', ')}`);
            console.error(`[SuccessHandler] ${unhandledRoleError.message} User:`, user);
            if (next) {
                return next(unhandledRoleError);
            }
            throw unhandledRoleError;
        }
    }
}

export default SuccessHandler;
```