/**
 * Selects the currently authenticated user object from the state.
 * @param {Object} state - The global Redux state tree.
 * @returns {Object|null}
 */
export const selectAuthUser = (state) => state.auth.user;

/**
 * Selects the current operational status of the authentication process.
 * @param {Object} state - The global Redux state tree.
 * @returns {string}
 */
export const selectAuthStatus = (state) => state.auth.status;

/**
 * Selects the initialization state of the authentication process.
 * @param {Object} state - The global Redux state tree.
 * @returns {boolean}
 */
export const selectIsInitialized = (state) => state.auth.isInitialized;

/**
 * Determines whether a user is currently authenticated based on the user object.
 * @param {Object} state - The global Redux state tree.
 * @returns {boolean}
 */
export const selectIsAuthenticated = (state) => !!state.auth.user;

/**
 * Selects the most recent authentication error message.
 * @param {Object} state - The global Redux state tree.
 * @returns {string|null}
 */
export const selectAuthError = (state) => state.auth.error;

/**
 * Selects the most recent authentication success or informational message.
 * @param {Object} state - The global Redux state tree.
 * @returns {string|null}
 */
export const selectAuthMessage = (state) => state.auth.message;