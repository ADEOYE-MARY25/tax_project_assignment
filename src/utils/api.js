const BASE_URL = "http://127.0.0.1:8000";

/**
 * Utility function to make authenticated API requests using fetch
 * @param {string} endpoint - API endpoint (e.g., "/contacts", "/chat")
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - Response data
 */
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// =================== API METHODS ===================
export const api = {
  // Generic HTTP methods
  get: (endpoint, options = {}) =>
    fetchAPI(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options = {}) =>
    fetchAPI(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options = {}) =>
    fetchAPI(endpoint, { ...options, method: "PUT", body }),

  delete: (endpoint, options = {}) =>
    fetchAPI(endpoint, { ...options, method: "DELETE" }),


};

export default fetchAPI;
