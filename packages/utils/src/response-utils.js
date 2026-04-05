/**
 * Utility class for handling API responses and errors.
 * Synchronized with backend metadata structure.
 */
export class ResponseHandler {
    /**
     * Handle a successful API response.
     *
     * @param {Object} response - The API response from Axios
     * @param {Function} [onSuccess] - Callback function({ data, metadata, message })
     * @returns {*} The result of onSuccess callback or null
     */
    static handleSuccess(response, onSuccess) {
      if (!response) return null;
  
      // Properti 'pagination' diubah menjadi 'metadata' agar sinkron dengan Controller
      const { success = false, data, metadata = null, message = "" } = response;
  
      if (success && typeof onSuccess === "function") {
        return onSuccess({ data, metadata, message });
      }
  
      return null;
    }
  
    /**
     * Handle an error from API request.
     *
     * @param {Object} error - The error object (Axios error or generic)
     * @param {Function} [onError] - Callback function(code, message, errors)
     * @returns {Object|null} Error details if onError not provided
     */
    static handleError(error, onError) {
      if (!error) return { code: 0, message: "Unknown error", errors: null };
  
      const code = (error.response && error.response.status) || error.code || 0;
  
      let message = "An unexpected error occurred";
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
  
      const errors =
        error.response && error.response.data && error.response.data.errors
          ? error.response.data.errors
          : null;
  
      const result = { code, message, errors };
  
      if (typeof onError === "function") {
        return onError(code, message, errors);
      }
  
      return result;
    }
  }