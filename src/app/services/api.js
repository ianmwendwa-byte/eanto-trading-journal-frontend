// src/services/api.js

import axios from "axios"
import API_CONFIG from "../config/api.config"

// ─── Logout Bridge (optional future use) ─────────────────────────────────────

let globalLogoutHandler = null

export const setLogoutHandler = (fn) => {
  globalLogoutHandler = fn
}

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_CONFIG.TIMEOUT,
})

// ─── Request Interceptor (Attach Token) ─────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─── Response Interceptor (CLEAN VERSION) ───────────────────────────────────

api.interceptors.response.use(
  (response) => {
    return response.data
  },

  (error) => {
    // ── Network error (no response from server)
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: "Network error. Check your connection.",
        errors: [],
      })
    }

    const { status, data } = error.response

    // ── Server error (5xx)
    if (status >= 500) {
      return Promise.reject({
        status,
        message: "Server error. Please try again later.",
        errors: [],
      })
    }

    // ── Normal API error (4xx)
    return Promise.reject({
      status,
      message: data?.message || "Request failed",
      errors: data?.errors || [],
    })
  }
)

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (credentials) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),

  register: (userData) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
}

// ─── ACCOUNTS ───────────────────────────────────────────────────────────────

export const accountApi = {
  getAll: () =>
    api.get(API_CONFIG.ENDPOINTS.ACCOUNT.BASE),

  getOne: (id) =>
    api.get(API_CONFIG.ENDPOINTS.ACCOUNT.SINGLE(id)),

  create: (data) =>
    api.post(API_CONFIG.ENDPOINTS.ACCOUNT.BASE, data),

  update: (id, data) =>
    api.put(API_CONFIG.ENDPOINTS.ACCOUNT.SINGLE(id), data),

  delete: (id) =>
    api.delete(API_CONFIG.ENDPOINTS.ACCOUNT.SINGLE(id)),
}

// ─── TRADES ──────────────────────────────────────────────────────────────────

export const tradeApi = {
  getByAccount: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.TRADES.BY_ACCOUNT(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  create: (data) =>
    api.post(API_CONFIG.ENDPOINTS.TRADES.BASE, data),

  update: (id, data) =>
    api.put(API_CONFIG.ENDPOINTS.TRADES.SINGLE(id), data),
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export const transactionApi = {
  getByAccount: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.TRANSACTIONS.BY_ACCOUNT(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  getSummary: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.TRANSACTIONS.SUMMARY(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  create: (data) =>
    api.post(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE, data),

  reverse: (id) =>
    api.delete(API_CONFIG.ENDPOINTS.TRANSACTIONS.SINGLE(id)),
}

// ─── STRATEGIES ─────────────────────────────────────────────────────────────

export const strategyApi = {
  getByAccount: (accountId) =>
    api.get(API_CONFIG.ENDPOINTS.STRATEGIES.BY_ACCOUNT(accountId)),

  create: (data) =>
    api.post(API_CONFIG.ENDPOINTS.STRATEGIES.BASE, data),

  update: (id, data) =>
    api.put(API_CONFIG.ENDPOINTS.STRATEGIES.SINGLE(id), data),

  delete: (id) =>
    api.delete(API_CONFIG.ENDPOINTS.STRATEGIES.SINGLE(id)),
}

// ─── ANALYTICS ──────────────────────────────────────────────────────────────

export const analyticsApi = {
  overview: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.OVERVIEW(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  discipline: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.DISCIPLINE(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  behavior: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.BEHAVIOR(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  session: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.SESSION(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  sessionDiscipline: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.SESSION_DISCIPLINE(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  equity: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.EQUITY(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  streaks: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.STREAKS(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  pairs: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.PAIRS(accountId)}${
        params ? `?${params}` : ""
      }`
    ),

  full: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.ANALYTICS.FULL(accountId)}${
        params ? `?${params}` : ""
      }`
    ),
}

// ─── INSIGHTS ───────────────────────────────────────────────────────────────

export const insightsApi = {
  get: (accountId, params = "") =>
    api.get(
      `${API_CONFIG.ENDPOINTS.INSIGHTS.GET(accountId)}${
        params ? `?${params}` : ""
      }`
    ),
}