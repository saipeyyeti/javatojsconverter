import { Request, Response, NextFunction } from 'express'; // For JSDoc type hinting, assuming Express is used

/**
 * @typedef {object} AuthenticatedUser
 * @property {string} id - The unique identifier of the authenticated user.
 * @property {string[]} roles - An array of roles (authorities) assigned to the user, e.g., ['ROLE_USER', 'ROLE_ADMIN'].
 * // Add any other relevant user properties that might be available after authentication.
 */

/**
 * @class SuccessHandler
 * @description
 * This class serves as a custom authentication success handler for Node.js applications,
 * mirroring the functionality of Spring Security's `AuthenticationSuccessHandler`.
 * It's designed to redirect users to specific application paths immediately after
 * they have successfully authenticated, based on their assigned roles.
 *
 * It leverages Express.js for handling HTTP requests and responses, and assumes
 * that an authentication middleware (like Passport.js) has populated `req.user`
 * with the authenticated user's details, including their roles.
 */
class SuccessHandler {
    /**
     * Creates an instance of SuccessHandler.
     * In Node.js/Express, the `RedirectStrategy` concept from Spring is directly
     * handled by `res.redirect()`, so no explicit internal redirect strategy
     * instance is needed here.
     */
    constructor() {
        // Constructor can be used for dependency injection if needed in a more complex setup.
        // For this specific functionality, no initialization is required.
    }

    /**
     * Handles the post-authentication process by redirecting the user based on their roles.
     * This method is intended to be used as an Express.js middleware function
     * after a successful authentication step (e.g., after `passport.authenticate`).
     *
     * The redirection logic prioritizes roles: `ROLE_USER` first, then `ROLE_ADMIN`.
     * If a user possesses multiple roles, the first matching role in this order
     * will determine the redirection path.
     *
     * @async
     * @param {Request} req - The Express request object. It is expected that `req.user`
     *                        will contain the authenticated user's details, including `roles`.
     * @param {Response} res - The Express response object, used for performing the HTTP redirect.
     * @param {NextFunction} next - The Express `next` middleware function, used for passing
     *                              control to the next middleware or an error handler.
     * @returns {Promise<void>} A promise that resolves when the redirection is complete,
     *                          or rejects if an error occurs (e.g., unhandled role).
     * @throws {Error} If the authenticated user object (`req.user`) is missing,
     *                 lacks roles, or has roles that are not recognized by this handler,
     *                 an `Error` is thrown and passed to the Express error-handling middleware.
     */
    async onAuthenticationSuccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        /** @type {AuthenticatedUser | undefined} */
        const user: AuthenticatedUser | undefined = req.user as AuthenticatedUser; // Type assertion for req.user

        // 1. Validate the authenticated user object and their roles.
        if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
            const error = new Error('Authentication successful, but user object or roles are missing/invalid for redirection.');
            console.error(`Error in SuccessHandler: ${error.message} User: ${JSON.stringify(user)}`);
            return next(error); // Pass error to Express error handler
        }

        const roles: string[] = user.roles;

        // 2. Determine redirection path based on roles, prioritizing 'ROLE_USER' then 'ROLE_ADMIN'.
        if (roles.includes('ROLE_USER')) {
            console.log(`User ${user.id} (ROLE_USER) successfully authenticated. Redirecting to /customer.`);
            return res.redirect('/customer');
        } else if (roles.includes('ROLE_ADMIN')) {
            console.log(`User ${user.id} (ROLE_ADMIN) successfully authenticated. Redirecting to /owner.`);
            return res.redirect('/owner');
        } else {
            // 3. Handle cases where no recognized role is found.
            const error = new Error('Authentication successful, but user has an unhandled role for redirection.');
            console.error(`Error in SuccessHandler: ${error.message} User ID: ${user.id}, Roles: ${JSON.stringify(roles)}`);
            return next(error); // Pass error to Express error handler
        }
    }
}

export default SuccessHandler;