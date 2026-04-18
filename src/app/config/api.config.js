/// src/config/api.config.js

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  TIMEOUT: 10000,

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
    },

    ACCOUNT: {
      BASE: "/accounts",
      SINGLE: (id) => `/accounts/${id}`,
    },

    TRADES: {
      BASE: "/trades",
      SINGLE: (id) => `/trades/${id}`,
      BY_ACCOUNT: (accountId) => `/trades/account/${accountId}`,
    },

    TRANSACTIONS: {
      BASE: "/transactions",
      SINGLE: (id) => `/transactions/${id}`,
      BY_ACCOUNT: (accountId) => `/transactions/account/${accountId}`,
      SUMMARY: (accountId) => `/transactions/account/${accountId}/summary`,
    },

    STRATEGIES: {
      BASE: "/strategies",
      SINGLE: (id) => `/strategies/${id}`,
      BY_ACCOUNT: (accountId) => `/strategies/account/${accountId}`,
    },

    ANALYTICS: {
      OVERVIEW: (accountId) => `/analytics/${accountId}/overview`,
      DISCIPLINE: (accountId) => `/analytics/${accountId}/discipline`,
      BEHAVIOR: (accountId) => `/analytics/${accountId}/behavior`,
      SESSION: (accountId) => `/analytics/${accountId}/session`,
      SESSION_DISCIPLINE: (accountId) => `/analytics/${accountId}/session-discipline`,
      EQUITY: (accountId) => `/analytics/${accountId}/equity`,
      STREAKS: (accountId) => `/analytics/${accountId}/streaks`,
      PAIRS: (accountId) => `/analytics/${accountId}/pairs`,
      FULL: (accountId) => `/analytics/${accountId}/full`,
    },

    INSIGHTS: {
      GET: (accountId) => `/insights/${accountId}`,
    },
  },
}

export default API_CONFIG