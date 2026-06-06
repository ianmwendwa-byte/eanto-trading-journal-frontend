// Single source of truth for all API paths
// Paths are relative — baseURL in axios adds /api/v1
// To upgrade API version: change VITE_API_URL only

export const API = {
  AUTH: {
    LOGIN:           "/auth/login",
    REGISTER:        "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_EMAIL:    "/auth/verify-email",
    DELETE_ACCOUNT:  "/auth/delete-account",
  },
  USER: {
    PROFILE:                   "/user/profile",
    PREFERENCES_AI:            "/user/preferences/ai",
    PREFERENCES_NOTIFICATIONS: "/user/preferences/notifications",
    FEATURE_FLAGS:             "/user/preferences/feature-flags",
    ONBOARDING_COMPLETE:       "/user/onboarding/complete",
    ONBOARDING_SKIP:           "/user/onboarding/skip",
  },
  ACCOUNT: {

    BASE:            "/accounts",
    DETAIL:          (id) => `/accounts/${id}`,
    EA_STATUS:       (id) => `/accounts/${id}/ea/status`,
    EA_GENERATE:     (id) => `/accounts/${id}/ea/generate-key`,
    EA_REVOKE:       (id) => `/accounts/${id}/ea/key`,
    EA_CONFIG:       (id) => `/accounts/${id}/ea/config`,
  },
  TRADE: {
    BASE:             "/trades",
    DETAIL:           (id) => `/trades/${id}`,
    STATS_OVERVIEW:   "/trades/stats/overview",
    STATS_PAIRS:      "/trades/stats/pairs",
    STATS_SESSIONS:   "/trades/stats/sessions",
    STATS_WEEKDAYS:   "/trades/stats/weekdays",
    STATS_TIMEFRAMES: "/trades/stats/timeframes",
    STATS_MONTHLY:    "/trades/stats/monthly",
  },
  TRANSACTION: {
    BASE:            "/transactions",
    DETAIL:          (id) => `/transactions/${id}`,
    REVERSE:         (id) => `/transactions/${id}/reverse`,
    SUMMARY:         "/transactions/summary",
    BALANCE_HISTORY: "/transactions/balance-history",
    DISTRIBUTION:    "/transactions/distribution",
    MONTHLY:         "/transactions/monthly-activity",
  },
  NOTIFICATION: {
    BASE:            "/notifications",
    UNREAD_COUNT:    "/notifications/unread-count",
    READ:            (id) => `/notifications/${id}/read`,
    READ_ALL:        "/notifications/read-all",
    DELETE:          (id) => `/notifications/${id}`,
    PREFERENCES:     "/notifications/preferences",
  },
  IMPORT: {
    PREVIEW:         "/import/preview",
    CONFIRM:         "/import/confirm",
    HISTORY:         "/import/history",
    BATCH:           (id) => `/import/history/${id}`,
    UNDO:            (id) => `/import/history/${id}/undo`,
    TEMPLATE:        "/import/template",
    BROKERS:         "/import/brokers",
    CUSTOM_SCHEMA:   "/import/custom-schema",
  },
  SCORE: {
    ACCOUNT:         (id) => `/score/account/${id}`,
    USER:            "/score/user",
    RECALC_ACCOUNT:  (id) => `/score/account/${id}/recalculate`,
    RECALC_USER:     "/score/user/recalculate",
    HISTORY:         (id) => `/score/account/${id}/history`,
    USER_HISTORY:    "/score/user/history",
  },
  DASHBOARD: {
    OVERVIEW:      "/dashboard/overview",
    PREFERENCES:   "/dashboard/preferences",
    REFRESH_CACHE: (id) => `/dashboard/account/${id}/refresh-cache`,
  },
};
