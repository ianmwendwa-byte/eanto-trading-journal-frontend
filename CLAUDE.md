# Kraviq Frontend — CLAUDE.md

> "You Trade Well. Run It Like a Business."

React/Vite trading journal for retail forex traders. Provides multi-account management, EA auto-sync, prop firm challenge tracking, behavioural analytics, and business-score coaching.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 (`*.jsx` — **no TypeScript**) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Server state | TanStack Query v5 |
| Client state | Zustand (`useAuthStore`, `useAppStore`) |
| HTTP | Axios with Firebase token interceptor (`src/lib/axios.js`) |
| Auth | Firebase Auth (client-side only) |
| Charts | TradingView Lightweight Charts + Recharts |
| Routing | React Router v7 (`createBrowserRouter`) |
| Forms | React Hook Form + Zod v4 |
| Toasts | Sonner |
| Animations | Framer Motion |

---

## Project Structure

```
src/
├── App.jsx                  # Entry — providers: HelmetProvider, ThemeProvider, QueryClientProvider, AuthProvider
├── router.jsx               # All routes, lazy-loaded app pages, OnboardingRoute guard
├── index.css                # Kraviq design tokens (CSS custom properties)
│
├── pages/
│   ├── app/                 # Protected, lazy-loaded: Dashboard, Accounts, AccountDetail,
│   │                        # Trades, Transactions, Analytics, Strategies, Insights,
│   │                        # Notifications, Settings, EASync, Score
│   ├── auth/                # Login, Register, ForgotPassword
│   ├── landing/             # LandingPage (forced dark, SSG-rendered)
│   ├── marketing/           # About, Contact, Blog, Community, WarPage, EASyncPage, ScorePage
│   ├── legal/               # DataPolicy, TermsOfService, TrackingPolicy
│   └── onboarding/          # Onboarding (5-step wizard)
│
├── components/
│   ├── ui/                  # shadcn/ui primitives — never edit directly, wrap instead
│   ├── layouts/             # AuthLayout, DashboardLayout, DashboardHeader, DashboardSidebar
│   ├── shared/              # ProtectedRoute, Logo, EmptyState, ErrorState, Pagination, etc.
│   ├── providers/           # AuthProvider
│   ├── accounts/            # AccountCard, AddAccountSheet, DrawdownBar, PropChallengeCard…
│   ├── dashboard/           # Widgets, StatCards, BalanceHistoryChart, DashboardCustomizeSheet…
│   ├── trades/              # TradesTable, AddTradeSheet, TradeDetailPanel, DisciplineScoreBadge…
│   ├── transactions/        # Transaction list, grouped, stats, balance chart…
│   ├── notifications/       # NotificationBell, NotificationPanel, NotificationPreferencesSheet…
│   ├── ea/                  # EAKeyManager, EAConfigPanel, SyncHistory, BalanceMismatchAlert…
│   ├── score/               # ScoreDial, ScorePanel, ScoreDetail, ScoreTeaser…
│   ├── settings/            # SettingsSidebar, AutoSaveIndicator, sections/…
│   ├── charts/              # TradingView and Recharts wrappers
│   └── onboarding/          # OnboardingTooltip, ContinueSetupBanner, SetupProgressWidget
│
├── hooks/                   # useAccounts, useAuth, useDashboard, useEA, useNotifications,
│                            # useOnboarding, useScore, useTrades, useTransactions, useUser,
│                            # useAutoSave, use-mobile
│
├── store/
│   ├── useAuthStore.js      # firebaseUser, mongoUser, isAuthenticated, onboardingComplete
│   └── useAppStore.js       # sidebarCollapsed, activeAccountId, notificationPanelOpen
│
├── lib/
│   ├── axios.js             # Axios instance + token interceptor + 401 retry
│   ├── firebase.js          # Firebase app + auth export
│   ├── queryClient.js       # staleTime 5m, gcTime 10m, retry 1, no refetchOnWindowFocus
│   ├── queryKeys.js         # Key factories: accountKeys, tradeKeys, transactionKeys…
│   ├── animations.js        # Shared Framer Motion variants
│   ├── chartColors.js       # Chart palette constants
│   └── utils.js             # cn() and shared helpers
│
├── constants/
│   ├── api.js               # API path constants — single source of truth for all endpoints
│   ├── notifications.js     # Notification type constants
│   ├── transactionTypes.js  # Transaction direction map
│   └── widgets.js           # Dashboard widget registry
│
└── utils/
    ├── format.js            # Currency, percentage, date formatters
    ├── tradeDuration.js     # Duration calculation for trades
    ├── dashboardHelpers.js  # Widget layout helpers
    └── calendar.js          # Calendar util for trade calendar
```

---

## Non-Negotiable Rules

```
NEVER write TypeScript (.ts/.tsx) — JSX only
NEVER edit files in src/components/ui/ — extend via wrapper components
NEVER use useEffect for data fetching — use React Query hooks
NEVER store tokens or secrets in localStorage — memory/Zustand only
NEVER hardcode API URL — always import.meta.env.VITE_API_URL
NEVER call /register AND /login on signup — /login auto-registers
NEVER show EA API key after initial generation — it is unretrievable
NEVER show deposit/withdrawal UI on prop accounts
NEVER show broker field on prop account forms
NEVER allow ruleMode change on prop accounts (always "enforced")
NEVER PATCH immutable trade fields: pair, direction, pnl, openedAt, closedAt, source
NEVER cache unread notification count > 30 seconds
NEVER include war account data in user aggregate metrics
```

---

## Environment Variables

```
VITE_API_URL          # Backend base URL (include /api/v1)
VITE_FIREBASE_*       # Firebase config keys
```

Production backend: `https://tradecore-yhcv.onrender.com/api/v1`
Dev backend: `http://localhost:5000/api/v1`

> The Firebase project and backend URL still carry the "tradecore" name — infra only. All UI says "Kraviq".

---

## Auth Flow

1. Firebase `signIn` / `createUser` → `idToken` (expires 1 hour)
2. `POST /auth/login` with `Bearer <idToken>` → creates/syncs MongoDB user
3. Check `onboarding.isComplete` — if `false` and `skippedAt` is null → redirect `/onboarding`
4. Every app request: token auto-attached via Axios request interceptor
5. On 401: force-refresh with `getIdToken(true)` → retry once → on failure: `signOut` + redirect `/login`
6. On logout: `signOut()` + clear query cache + `useAuthStore.logout()`

`getIdToken()` is **async** — always `await` it.

---

## Zustand Stores

```js
// src/store/useAuthStore.js
{ firebaseUser, mongoUser, isLoading, isAuthenticated, onboardingComplete }
setFirebaseUser(), setMongoUser(), setOnboardingComplete(), setLoading(), logout()

// src/store/useAppStore.js
{ sidebarCollapsed, activeAccountId, notificationPanelOpen, notificationFilter }
setSidebarCollapsed(), setActiveAccountId(), setNotificationPanelOpen(), setNotificationFilter()
```

---

## React Query Conventions

**QueryClient defaults** (`src/lib/queryClient.js`):
- `staleTime: 5m`, `gcTime: 10m`, `retry: 1`, `refetchOnWindowFocus: false`

**Key factories** (`src/lib/queryKeys.js`): `accountKeys`, `tradeKeys`, `transactionKeys`, `notificationKeys`, `scoreKeys`, `importKeys`, `userKeys`, `dashboardKeys`, `eaKeys`

**Invalidation rules**:
- Create trade → invalidate `tradeKeys.all()` + `accountKeys.detail(accountId)`
- Create transaction → invalidate `transactionKeys.all()` + `accountKeys.detail(accountId)`
- Mark notification read → optimistic decrement of unread count + invalidate `notificationKeys.all()`

---

## API Constants

All API paths live in `src/constants/api.js` as the `API` object. Never write path strings inline.

```js
import { API } from "@/constants/api";
// API.TRADE.BASE, API.ACCOUNT.DETAIL(id), API.SCORE.ACCOUNT(id), …
```

---

## Design System

**Tokens** defined in `src/index.css` as CSS custom properties.

| Token | Purpose |
|---|---|
| `--primary` | `#4F6EF7` — Kraviq blue |
| `--profit` | `#22C55E` — green (never change) |
| `--loss` | `#EF4444` — red (never change) |
| `--warning` | `#F59E0B` |
| `--breakeven` | `#6B7280` |

**Fonts**:
- UI: `Inter` (`font-ui`)
- Headings: `Space Grotesk` (`font-heading`)
- Mono: `JetBrains Mono` (`font-mono`)

**Theme**: dark-first. `ThemeProvider defaultTheme="dark" storageKey="kraviq-ui"`.

**Path alias**: `@/` → `src/`

---

## Account Types

| Type | Rules |
|---|---|
| `normal` | Has `broker`, `normalConfig`, `personalMetrics` |
| `prop` | No `broker`, has `propRules`/`challenge`/`payout`, always `ruleMode: "enforced"`, starts `status: "evaluation"` |
| `war` | Has `broker`, `warConfig`, excluded from aggregate metrics |

**Prop status flow**: `evaluation → active → funded → archived` (also: `→ breached → paused → archived`)

**Prop drawdown warning levels**:
- `> 70% of maxDrawdownPercent` → yellow
- `> 85%` → orange
- `> 95%` → red critical

---

## Transaction Direction Map

```js
POSITIVE: deposit, payout, trade_profit, adjustment_increase
NEGATIVE: withdrawal, trade_loss, swap, commission, prop_challenge_fee, adjustment_decrease
```

Prop accounts never use `deposit` or `withdrawal`.

---

## EA / API Key Rules

- 64-char lowercase hex string
- Shown **once** after `POST /accounts/:id/ea/generate-key` — never retrievable again
- Old key is invalidated immediately on regeneration
- EA uses `x-ea-api-key` header (not Firebase JWT)
- Always show "Copy now — this key will never be shown again" warning
- Require confirmation dialog before revoking

---

## Business Score Rules

- Requires minimum **10 closed trades** (`metadata.hasMinimumData`)
- War accounts excluded from user aggregate score
- Recalculates daily at 02:00 UTC; weekly snapshot every Friday 23:59 UTC
- Force recalculate: `POST /score/account/:id/recalculate`
- Beta-gated: `user.featureFlags.betaBusinessScore` must be `true`

| Band | Range | Color |
|---|---|---|
| `needs_work` | 0–20 | Red |
| `developing` | 21–40 | Orange |
| `progressing` | 41–60 | Yellow |
| `solid` | 61–80 | Green |
| `elite` | 81–100 | Diamond/Blue |

---

## Notification Rules

- Non-disableable types: `account_blown`, `daily_drawdown_hit`, `balance_mismatch`, `password_changed`, `new_login`, `account_deleted`
- Bell badge: `user.unreadNotifications`, capped at `99+`
- Optimistically decrement unread count on mark-as-read
- Unread count must not be cached more than 30 seconds

---

## Onboarding Flow

```
register → onboarding.isComplete === false
  skippedAt null?  → /onboarding  (OnboardingRoute guard)
  skippedAt set?   → /dashboard
POST /user/onboarding/complete → marks complete
POST /user/onboarding/skip    → sets skippedAt
```

---

## SSG / Build

The project has a custom SSG pipeline:

```
npm run build       # build:client + build:server + prerender.js
npm run dev         # Vite dev server
npm run lint        # ESLint
npm run preview     # Preview dist
```

`prerender.js` statically renders public routes (`/`, `/login`, `/register`, landing, marketing, legal) for SEO. App routes are SPA-only.

---

## Route Map

| Path | Notes |
|---|---|
| `/` | LandingPage (public, SSG) |
| `/login`, `/register`, `/forgot-password` | Auth (public) |
| `/onboarding` | OnboardingRoute guard |
| `/about`, `/contact`, `/blog`, `/community` | Marketing (public) |
| `/war-account`, `/ea-sync`, `/business-score` | Feature marketing (public) |
| `/privacy`, `/terms`, `/cookies` | Legal (public) |
| `/dashboard` | Protected, lazy |
| `/accounts`, `/accounts/:id` | Protected, lazy |
| `/trades`, `/transactions` | Protected, lazy |
| `/analytics`, `/strategies`, `/insights` | Protected, lazy |
| `/score`, `/notifications`, `/ea`, `/settings` | Protected, lazy |
| `/import` | `ComingSoonStub` (protected) |
| `/ai` | `ComingSoonStub` (protected) |
| `*` | Redirects to `/dashboard` |

# EA (Expert Advisor) API Specification for Frontend

> **Audience**: Frontend developer integrating the Kraviq EA sync feature.
>
> **Base URL**: `https://<api-host>/api/v1`
>
> **Auth note**: All USER-FACING endpoints require a Firebase JWT in the `Authorization: Bearer <token>` header. The EA-FACING endpoints use `x-ea-api-key` instead — the frontend does NOT call those directly. They are documented here so you understand the full data flow and can accurately represent sync state to the user.

---

## Overview — What the EA Sync System Does

A trader installs a MetaTrader 5 Expert Advisor (EA) on their MT5 terminal. The EA automatically pushes completed trades and account transactions (deposits/withdrawals) into Kraviq on a schedule. The flow is:

```
User (frontend)                    Backend                      MT5 EA
─────────────────────────────────────────────────────────────────────
1. Generate API key   ──────────►  stores hashed key
   (shows key ONCE)
2. User pastes key
   into EA settings

3. EA startup         ◄──────────  EA-facing endpoints
   EA syncs trades    ──────────►  (no Firebase JWT)
   EA syncs txns      ──────────►
   EA sends heartbeat ──────────►

4. GET /ea/status     ──────────►  returns sync state
   Show dashboard

5. Anomalies appear   ◄──────────  reconciliation engine
   User reviews       ──────────►  PATCH /anomalies/:id
```

---

## Section 1 — User-Facing Endpoints (Firebase JWT Required)

These are the endpoints the frontend calls directly.

---

### 1.1 Generate EA API Key

**`POST /api/v1/accounts/:id/ea/generate-key`**

Generates a new 64-character hex API key for the specified account. The key is shown **exactly once** in the response and is **never retrievable again**. Prompt the user to copy it immediately.

**Request**
- No request body required
- URL param `:id` = MongoDB ObjectId of the account

**Response `201`**
```json
{
  "success": true,
  "eaApiKey": "a3f8c2...64hexchars",
  "message": "Save this key — it will not be shown again"
}
```

**Error cases**

| Status | Reason |
|--------|--------|
| 404 | Account not found or does not belong to user |
| 409 | Account already has an active API key — must revoke first |

**Frontend notes**
- Show a copy-to-clipboard UI immediately after receiving the key.
- Warn the user that if they lose the key they must revoke and regenerate.
- After success, refetch `GET /ea/status` to update `hasApiKey: true` in the UI.
- A `notifyAPIKeyGenerated` notification fires server-side — the notification bell will update.

---

### 1.2 Revoke EA API Key

**`DELETE /api/v1/accounts/:id/ea/key`**

Permanently revokes the API key. The EA will immediately lose access. All `eaSync` metadata (broker info, balance, online status) is cleared.

**Request**
- No body
- URL param `:id` = account ObjectId

**Response `200`**
```json
{
  "success": true,
  "message": "EA API key revoked successfully"
}
```

**Error cases**

| Status | Reason |
|--------|--------|
| 404 | Account not found |

**Frontend notes**
- Confirm with the user before calling — this disconnects the live EA.
- After success, refetch `GET /ea/status` to reset all displayed sync info.
- A `notifyAPIKeyRevoked` notification fires server-side.

---

### 1.3 Update EA Config

**`PATCH /api/v1/accounts/:id/ea/config`**

Controls whether the EA sync is enabled and its sync behaviour. All fields are optional — only send what you want to change.

**Request body** (all fields optional)
```json
{
  "enabled": true,
  "syncMode": "all",
  "syncStartDate": "2024-01-01T00:00:00.000Z"
}
```

| Field | Type | Allowed values | Description |
|-------|------|----------------|-------------|
| `enabled` | `boolean` | `true` / `false` | Toggles EA sync on/off. Cannot be `true` if no API key has been generated yet. |
| `syncMode` | `string` | `"all"` `"manual_only"` `"ea_only"` | `"all"` = both manual + EA trades shown; `"manual_only"` = hide EA trades; `"ea_only"` = hide manually-added trades |
| `syncStartDate` | ISO date string or `null` | Any valid ISO datetime | EA will only sync trades opened on or after this date. Send `null` to remove the cutoff (defaults to 1 year back). |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "eaSync": {
      "enabled": true,
      "syncMode": "all",
      "syncStartDate": "2024-01-01T00:00:00.000Z",
      "lastSyncedAt": "2025-06-09T08:00:00.000Z",
      "lastTicketNumber": 12345,
      "lastTxTicketNumber": 67890,
      "verificationStatus": "verified",
      "isOnline": true
    }
  }
}
```

**Error cases**

| Status | Reason |
|--------|--------|
| 400 | `enabled: true` sent but no API key generated yet |
| 400 | Invalid `syncMode` value |
| 400 | `enabled` is not a boolean |
| 400 | No valid fields provided in body |
| 404 | Account not found |

---

### 1.4 Get EA Status

**`GET /api/v1/accounts/:id/ea/status`**

The main polling endpoint for the frontend EA connection panel. Returns the full sync state of an account.

**Request**
- No body
- URL param `:id` = account ObjectId

**Response `200`**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "syncMode": "all",
    "syncStartDate": "2024-01-01T00:00:00.000Z",
    "lastSyncedAt": "2025-06-09T08:00:00.000Z",
    "lastTicketNumber": 12345,
    "lastTxTicketNumber": 89012,
    "totalSynced": 340,
    "totalTxSynced": 52,
    "lastSyncStatus": "success",
    "lastSyncError": null,
    "consecutiveFailures": 0,
    "verificationStatus": "verified",
    "verificationFailReason": null,
    "isOnline": true,
    "lastHeartbeatAt": "2025-06-09T08:59:00.000Z",
    "lastKnownBalance": 12500.00,
    "lastKnownEquity": 12480.50,
    "lastBalanceAt": "2025-06-09T08:59:00.000Z",
    "balanceMismatchCount": 0,
    "currentSyncSession": null,
    "mt5Balance": 12500.00,
    "brokerInfo": {
      "accountServer": "ICMarkets-Live01",
      "accountCompany": "IC Markets",
      "currency": "USD",
      "leverage": 500,
      "isLive": true,
      "verifiedAt": "2025-03-01T10:00:00.000Z"
    },
    "hasApiKey": true
  }
}
```

**Field reference**

| Field | Type | Meaning for UI |
|-------|------|----------------|
| `hasApiKey` | boolean | Whether a key has been generated. If `false`, show "Generate Key" button. |
| `enabled` | boolean | Whether sync is active. Drives enabled/disabled toggle. |
| `isOnline` | boolean | EA pinged the server within the last 5 minutes. Show green/red status dot. |
| `lastHeartbeatAt` | ISO date or null | Last time the EA pinged. Use for "last seen X minutes ago". |
| `verificationStatus` | string | See verification status table below. Drive a status badge from this. |
| `verificationFailReason` | string or null | Human-readable reason if verification failed. Show in error state. |
| `lastSyncedAt` | ISO date or null | Last successful sync timestamp. |
| `totalSynced` | number | Lifetime trades synced from EA. |
| `totalTxSynced` | number | Lifetime transactions synced from EA. |
| `lastSyncStatus` | string or null | `"success"` / `"partial"` / `"failed"` — last sync result. |
| `consecutiveFailures` | number | How many syncs in a row have failed. Show a warning if > 3. |
| `lastKnownBalance` | number or null | Last balance reported by EA heartbeat. |
| `mt5Balance` | number or null | Balance EA reported at the start of the last sync session. |
| `balanceMismatchCount` | number | How many times balance mismatches have occurred. |
| `currentSyncSession` | ObjectId or null | Non-null while a sync is in progress. Show "Syncing..." indicator. |
| `brokerInfo` | object | Broker metadata confirmed at EA registration. |
| `syncMode` | string | Which trades appear in the journal. |
| `syncStartDate` | ISO date or null | Date boundary for syncing historical trades. |

**`verificationStatus` values**

| Value | Meaning | UI suggestion |
|-------|---------|---------------|
| `"unverified"` | No key, or key just generated | Grey badge — "Not connected" |
| `"pending"` | EA registered; first sync not done | Yellow badge — "Connecting..." |
| `"uploading"` | Sync in progress | Blue badge — "Syncing..." |
| `"reconciling"` | Data uploaded; reconciliation running | Blue badge — "Reconciling..." |
| `"needs_review"` | Anomalies found that need user review | Orange badge — "Needs Review" |
| `"verified"` | All checks passed | Green badge — "Verified" |
| `"failed"` | Sync or reconciliation failed | Red badge — "Failed" |

---

### 1.5 Get Reconciliation Status

**`GET /api/v1/accounts/:id/reconciliation`**

Returns the most recent sync session summary and anomaly counts. Powers the "Reconciliation" panel on the EA status page.

**Request**
- No body

**Response `200`**
```json
{
  "success": true,
  "data": {
    "session": {
      "status": "needs_review",
      "mt5Balance": 12500.00,
      "rebuiltBalance": 12497.30,
      "balanceGap": 2.70,
      "totalAnomalies": 3,
      "resolvedAnomalies": 1,
      "uploadStartedAt": "2025-06-09T07:00:00.000Z",
      "reconciledAt": "2025-06-09T07:01:15.000Z"
    },
    "anomalies": {
      "total": 3,
      "pending": 2,
      "resolved": 1,
      "byType": {
        "pnl_mismatch": 1,
        "balance_gap": 1
      }
    },
    "isVerified": false
  }
}
```

When there has never been a sync session, `session` is `null` and all anomaly counts are `0`.

**Field reference**

| Field | Meaning |
|-------|---------|
| `session.mt5Balance` | What MT5 says the balance is |
| `session.rebuiltBalance` | What Kraviq calculated from transaction history |
| `session.balanceGap` | `mt5Balance - rebuiltBalance` — ideally `0` |
| `session.totalAnomalies` | Total anomalies detected this session |
| `session.resolvedAnomalies` | How many the user has already resolved |
| `anomalies.byType` | Counts per anomaly type (pending only) |
| `isVerified` | `true` when all anomalies are resolved and account is `"verified"` |

---

### 1.6 Get Anomalies

**`GET /api/v1/accounts/:id/anomalies`**

Returns a paginated, filterable list of anomalies for the account. An anomaly is a data discrepancy found during reconciliation that requires the user to make a decision.

**Query parameters**

| Param | Default | Options | Description |
|-------|---------|---------|-------------|
| `status` | `"pending"` | `"pending"` `"resolved"` `"dismissed"` `"all"` | Filter by status |
| `type` | (none) | `"pnl_mismatch"` `"orphaned_tx"` `"balance_gap"` `"time_gap"` | Filter by anomaly type |
| `page` | `1` | integer | Page number |
| `limit` | `20` | integer | Results per page |

**Example**: `GET /api/v1/accounts/abc123/anomalies?status=pending&page=1&limit=20`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "_id": "anomaly-objectid",
        "accountId": "account-objectid",
        "syncSessionId": "session-objectid",
        "type": "pnl_mismatch",
        "status": "pending",
        "ticketNumber": "123456789",
        "tradeId": "trade-objectid",
        "transactionId": null,
        "mt5Value": -45.30,
        "kraviqValue": -40.00,
        "difference": -5.30,
        "gapStartDate": null,
        "gapEndDate": null,
        "resolution": null,
        "resolvedAt": null,
        "resolvedBy": null,
        "note": null,
        "createdAt": "2025-06-09T07:01:10.000Z",
        "updatedAt": "2025-06-09T07:01:10.000Z"
      }
    ],
    "total": 2,
    "pending": 2
  }
}
```

**Anomaly types explained**

| Type | What it means | What the user decides |
|------|--------------|----------------------|
| `pnl_mismatch` | A trade's P&L in MT5 differs from what Kraviq stored | Accept MT5 value, or keep Kraviq value |
| `orphaned_tx` | A transaction exists in MT5 with no matching trade in Kraviq | Mark as valid, or mark as adjustment |
| `balance_gap` | MT5 balance does not match Kraviq's calculated balance | Mark as adjustment (creates a correcting transaction) |
| `time_gap` | A date range has no trades, suggesting missed sync data | Mark as valid (no trades actually occurred) |

**Key fields on each anomaly**

| Field | Meaning |
|-------|---------|
| `type` | Which kind of discrepancy |
| `status` | `"pending"` = needs action; `"resolved"` = actioned |
| `ticketNumber` | MT5 ticket number of the affected trade/tx |
| `tradeId` | ObjectId of the Kraviq trade (present for `pnl_mismatch`) |
| `mt5Value` | The value MT5 reports |
| `kraviqValue` | The value Kraviq has stored |
| `difference` | `mt5Value - kraviqValue` |
| `resolution` | How it was resolved (null while pending) |

---

### 1.7 Resolve an Anomaly

**`PATCH /api/v1/accounts/:id/anomalies/:anomalyId`**

The user decides how to handle a discrepancy. This is the core interaction in the reconciliation review UI.

**Request body**
```json
{
  "resolution": "accepted_mt5",
  "note": "Optional user note"
}
```

**`resolution` values and their side-effects**

| Value | When to use | Side-effect on the backend |
|-------|-------------|---------------------------|
| `"accepted_mt5"` | For `pnl_mismatch` — user trusts MT5 data | Updates the trade's `pnl` and `netPnl` to the MT5 value; recalculates `outcome` (win/loss/breakeven) |
| `"kept_kraviq"` | For `pnl_mismatch` — user trusts Kraviq data | No data change; anomaly closed |
| `"marked_valid"` | For `orphaned_tx` or `time_gap` — the discrepancy is expected | No data change; anomaly closed |
| `"marked_adjustment"` | For `balance_gap` — user approves a balancing correction | Creates an `adjustment_increase` or `adjustment_decrease` transaction equal to the gap amount |

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "anomaly-objectid",
    "status": "resolved",
    "resolution": "accepted_mt5",
    "resolvedAt": "2025-06-09T09:00:00.000Z",
    "resolvedBy": "user-objectid",
    "note": "Optional user note"
  }
}
```

**Error cases**

| Status | Reason |
|--------|--------|
| 400 | `resolution` is missing or not one of the four valid values |
| 404 | Account not found |
| 404 | Anomaly not found or already resolved |

**Frontend notes**
- When the last pending anomaly is resolved, the backend automatically runs `verifyAccount`, setting `verificationStatus` to `"verified"`. Refetch `GET /ea/status` after the final resolution.
- Show a progress indicator: `resolvedAnomalies / totalAnomalies`.

---

## Section 2 — EA-Facing Endpoints (x-ea-api-key)

> The frontend does NOT call these. They are called by the MT5 Expert Advisor using the `x-ea-api-key` header. Documented here so you understand the full sync lifecycle and can build accurate status displays.

**Auth header**: `x-ea-api-key: <64-char hex key>`

---

### 2.1 Register EA Connection

**`POST /api/v1/ea/register`**

Called once when the EA starts up for the first time or after reconfiguration. Stores broker metadata and marks the account as online.

**Request body (sent by EA)**
```json
{
  "accountNumber": "12345678",
  "accountServer": "ICMarkets-Live01",
  "accountCompany": "IC Markets",
  "accountName": "John Doe",
  "currency": "USD",
  "leverage": 500,
  "balance": 12500.00,
  "equity": 12480.00,
  "isLive": true,
  "tradeMode": 2
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `accountNumber` | Yes | MT5 login number |
| `accountServer` | Yes | MT5 server name |
| `currency` | Yes | Account base currency — must match the Kraviq account's `baseCurrency` |
| `tradeMode` | Yes | MT5 `ACCOUNT_TRADE_MODE`: `0`=demo, `1`=contest, `2`=real |
| `accountCompany` | No | Broker display name |
| `accountName` | No | Account holder name |
| `leverage` | No | Leverage ratio (integer) |
| `balance` | No | Current balance |
| `equity` | No | Current equity |

**Response `200`**
```json
{
  "success": true,
  "message": "EA connected successfully",
  "isLive": true,
  "isDemoWarning": false,
  "config": {
    "syncStartDate": "2024-01-01T00:00:00.000Z",
    "lastTicketNumber": 12000,
    "lastTxTicketNumber": 5000,
    "syncMode": "all",
    "accountId": "account-objectid"
  }
}
```

**What this sets on the account**
- `eaSync.brokerInfo` populated with sanitized broker metadata
- `verificationStatus` set to `"pending"`
- `isOnline` set to `true`
- If broker currency does not match account `baseCurrency` the call returns 400

---

### 2.2 Get EA Config

**`GET /api/v1/ea/config`**

Called by the EA on startup to retrieve sync parameters.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "accountId": "account-objectid",
    "syncStartDate": "2024-01-01T00:00:00.000Z",
    "lastTicketNumber": 12000,
    "lastTxTicketNumber": 5000,
    "syncMode": "all",
    "verificationStatus": "verified",
    "balanceTolerance": 1.00
  }
}
```

| Field | Meaning for EA |
|-------|----------------|
| `syncStartDate` | Only sync trades on or after this date |
| `lastTicketNumber` | Last trade ticket synced — EA skips anything at or below this |
| `lastTxTicketNumber` | Last transaction ticket synced |
| `balanceTolerance` | Max allowed balance gap (USD) before raising a `balance_gap` anomaly |

---

### 2.3 Heartbeat

**`POST /api/v1/ea/heartbeat`**

Periodic keep-alive sent every ~60 seconds. Updates `isOnline` and live balance. Accounts go offline automatically if no heartbeat arrives for 5 minutes (cron check).

**Request body**
```json
{
  "balance": 12500.00,
  "equity": 12480.50,
  "currency": "USD"
}
```

All fields optional. If `balance` is provided it updates `lastKnownBalance` and `mt5Balance`.

**Response `200`**
```json
{
  "success": true,
  "status": "ok",
  "verificationStatus": "verified",
  "serverTime": "2025-06-09T09:00:00.000Z"
}
```

---

### 2.4 Start Sync Session

**`POST /api/v1/ea/sync/start`**

Opens a new sync session before uploading trades/transactions. Returns a `sessionId` that the EA must include in all subsequent sync calls.

**Request body**
```json
{
  "currentBalance": 12500.00,
  "currency": "USD",
  "totalTrades": 50,
  "totalTransactions": 10,
  "syncStartDate": "2024-01-01T00:00:00.000Z",
  "accountNumber": "12345678",
  "serverName": "ICMarkets-Live01",
  "tradingMode": "live"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `currentBalance` | Yes | MT5 balance at sync time |
| `currency` | Yes | Account currency |
| `totalTrades` | No | How many trades the EA intends to send |
| `totalTransactions` | No | How many transactions the EA intends to send |

**Response `201`**
```json
{
  "success": true,
  "sessionId": "sync-session-objectid",
  "syncStartDate": "2024-01-01T00:00:00.000Z",
  "lastTicketNumber": 12000,
  "syncMode": "SYNC_ALL"
}
```

**Frontend implication**: While a session is open, `eaSync.currentSyncSession` is non-null — show a "Syncing..." spinner.

---

### 2.5 Sync Trades

**`POST /api/v1/ea/sync/trades`**

Uploads a batch of closed trades. Max 100 per call. Fully idempotent — duplicate ticket numbers are silently skipped.

**Request body**
```json
{
  "sessionId": "sync-session-objectid",
  "trades": [
    {
      "ticketNumber": 12345,
      "symbol": "EURUSD",
      "direction": "buy",
      "lots": 0.10,
      "openPrice": 1.08500,
      "closePrice": 1.08700,
      "openTime": 1717920000,
      "closeTime": 1717923600,
      "stopLoss": 1.08300,
      "takeProfit": 1.08900,
      "grossPnl": 20.00,
      "swap": -0.50,
      "commission": -1.00,
      "netPnl": 18.50,
      "magicNumber": 1001,
      "comment": "MyEA v2",
      "eaName": "MyEA"
    }
  ]
}
```

**Trade object fields**

| Field | Aliases | Type | Required | Description |
|-------|---------|------|----------|-------------|
| `ticketNumber` | `ticket` | number/string | Yes | Unique MT5 ticket |
| `symbol` | `pair` | string | Yes | e.g. `"EURUSD"` — auto-uppercased |
| `direction` | — | `"buy"` or `"sell"` | Yes | Trade direction |
| `lots` | `lotSize` | number | No | Position size |
| `openPrice` | `entryPrice` | number | No | Open price |
| `closePrice` | `exitPrice` | number | No | Close price (omit for open trades) |
| `openTime` | — | Unix seconds | No | Trade open timestamp |
| `closeTime` | — | Unix seconds | No | Trade close timestamp |
| `stopLoss` | — | number | No | Stop loss price |
| `takeProfit` | — | number | No | Take profit price |
| `grossPnl` | `pnl` | number | Yes (one of) | Gross P&L before fees |
| `netPnl` | — | number | No | Net P&L; computed as `grossPnl + swap + commission` if omitted |
| `swap` | — | number | No | Overnight swap charge (negative = cost) |
| `commission` | — | number | No | Broker commission (negative = cost) |
| `magicNumber` | — | integer | No | EA magic number |
| `positionId` | — | string | No | MT5 position identifier |
| `comment` | — | string | No | MT5 trade comment |
| `eaName` | — | string | No | EA name label |

**Response `200`**
```json
{
  "success": true,
  "received": 5,
  "created": 4,
  "skipped": 1,
  "failed": 0,
  "results": [
    { "index": 0, "ticketNumber": "12345", "created": true },
    { "index": 1, "ticketNumber": "12346", "created": false }
  ]
}
```

**What happens server-side per new trade**
- Creates a `Trade` document
- Creates `trade_profit` or `trade_loss`, `swap`, and `commission` Transaction records
- Updates `lastTicketNumber` and `totalSynced` on the account
- Fires `refreshAccountCache` and `processAccountUpdate` (fire-and-forget)
- If a duplicate ticket has a different P&L, creates a `pnl_mismatch` anomaly for review

---

### 2.6 Sync Transactions

**`POST /api/v1/ea/sync/transactions`**

Uploads a batch of account-level transactions (deposits and withdrawals). Max 200 per call. Idempotent by ticket number.

**Request body**
```json
{
  "sessionId": "sync-session-objectid",
  "transactions": [
    {
      "ticketNumber": 5001,
      "amount": 1000.00,
      "date": 1717920000,
      "comment": "Deposit via bank transfer"
    },
    {
      "ticketNumber": 5002,
      "amount": -500.00,
      "date": 1717950000,
      "comment": "Withdrawal"
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `ticketNumber` | Yes | Unique MT5 ticket for this transaction |
| `amount` | Yes | Positive = deposit, Negative = withdrawal |
| `date` | No | Unix seconds; defaults to now |
| `comment` | No | MT5 comment label |

**Response `200`**
```json
{
  "success": true,
  "received": 2,
  "created": 2,
  "skipped": 0
}
```

---

### 2.7 Complete Sync Session

**`POST /api/v1/ea/sync/complete`**

Called after all trades and transactions have been uploaded. Triggers the reconciliation engine in the background — this is when anomaly detection runs.

**Request body**
```json
{
  "sessionId": "sync-session-objectid",
  "finalBalance": 12500.00,
  "totalTradesSent": 50,
  "totalTransactionsSent": 10
}
```

**Response `200`**
```json
{
  "success": true,
  "status": "reconciling",
  "message": "Reconciliation started"
}
```

**What happens after this call**
1. Reconciliation engine compares MT5 balance vs Kraviq rebuilt balance
2. Anomalies are created for any discrepancies found
3. `verificationStatus` moves to `"needs_review"` if anomalies exist, or `"verified"` if clean
4. Frontend should poll `GET /ea/status` or `GET /reconciliation` to detect the state change

---

## Section 3 — Full Sync State Machine

```
hasApiKey = false
    └─► User clicks "Generate Key"
            └─► POST /accounts/:id/ea/generate-key
                    └─► hasApiKey = true, verificationStatus = "unverified"

User installs key into EA settings

EA calls POST /ea/register
    └─► verificationStatus = "pending", isOnline = true

EA starts a sync cycle
    └─► POST /ea/sync/start  →  sessionId
    └─► POST /ea/sync/trades  (batches of max 100)
    └─► POST /ea/sync/transactions  (batches of max 200)
    └─► POST /ea/sync/complete
            └─► verificationStatus = "reconciling"  [background engine runs]
                    ├─► No anomalies  →  verificationStatus = "verified"
                    └─► Anomalies found  →  verificationStatus = "needs_review"

User reviews anomalies (frontend)
    └─► GET /accounts/:id/anomalies
    └─► PATCH /accounts/:id/anomalies/:anomalyId  (repeat for each)
            └─► All resolved  →  verificationStatus = "verified"

EA silent > 5 minutes
    └─► Cron sets isOnline = false
```

---

## Section 4 — Frontend UI Recommendations

### EA Setup Panel (per account)

**No key yet (`hasApiKey = false`)**
- "Connect Expert Advisor" CTA
- Brief explanation of what EA sync does
- "Generate API Key" button → `POST /generate-key` → copy-to-clipboard modal with warning

**Key exists (`hasApiKey = true`)**

```
[●  Online / ○  Offline]     [Verified / Needs Review / Pending...]

Broker:    IC Markets (ICMarkets-Live01)
Currency:  USD  |  Leverage: 1:500  |  Mode: Live
Balance:   $12,500.00              Last seen: 2 minutes ago
Trades synced: 340                 Last sync: 09 Jun 2025, 09:00

Sync enabled:  [toggle]
Sync mode:     [All trades ▾]
Sync from:     [Jan 1, 2024]
               [Save config]   [Revoke Key]
```

### Reconciliation Panel

Show when `verificationStatus = "needs_review"` or anomaly count > 0:

```
Reconciliation Review Required

MT5 Balance:    $12,500.00
Kraviq Balance: $12,497.30
Gap:            $2.70

Anomalies: 2 pending  |  1 resolved     Progress: 1 / 3
──────────────────────────────────────────────────────────
[pnl_mismatch]  Ticket #123456
  MT5 P&L: -$45.30   Kraviq P&L: -$40.00   Difference: -$5.30
  [Accept MT5 value]    [Keep Kraviq value]

[balance_gap]   Balance discrepancy  Gap: $2.70
  [Create Adjustment Transaction]    [Mark as Valid]
```

### Anomaly display priority

1. `balance_gap` — largest financial impact
2. `pnl_mismatch` — affects trade history accuracy
3. `orphaned_tx` — unlinked money movement
4. `time_gap` — data coverage gaps

---

## Section 5 — Error Response Format

All endpoints return errors in this shape:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| `400` | Validation error — check `message` for details |
| `401` | Unauthenticated — expired/missing Firebase token or invalid API key |
| `403` | Forbidden — account does not belong to this user |
| `404` | Resource not found |
| `409` | Conflict — e.g. key already exists on this account |
| `429` | Rate limited — back off and retry |
| `500` | Server error — safe to retry with exponential backoff |
