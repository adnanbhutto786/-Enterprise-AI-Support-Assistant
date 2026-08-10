import axios from "axios"

/**
 * Centralized Axios instance with JWT Authorization interceptor.
 * All API calls should use this instance instead of raw axios.
 * 
 * Features:
 * - Automatically attaches 'Authorization: Bearer <token>' header
 * - Auto-logout on 401 Unauthorized responses (expired/invalid token)
 */

const API_BASE_URL = "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and redirect to login
      const role = localStorage.getItem("userRole")
      localStorage.removeItem("authToken")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")

      // Redirect to appropriate login page
      const loginPath = role === "admin" ? "/admin/login" : "/login"
      if (window.location.pathname !== loginPath && window.location.pathname !== "/login" && window.location.pathname !== "/admin/login" && window.location.pathname !== "/register") {
        window.location.href = loginPath
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Check if the stored JWT token is expired (client-side check).
 * Returns true if the token is expired or missing.
 */
export function isTokenExpired(): boolean {
  const token = localStorage.getItem("authToken")
  if (!token) return true

  try {
    // JWT payload is the second part, base64url encoded
    const payload = JSON.parse(atob(token.split(".")[1]))
    const expiry = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expiry
  } catch {
    return true
  }
}

export default api
