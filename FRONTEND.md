# FRONTEND.md — Kraviq API Contract for Frontend

> Single source of truth for every API shape, field, and UI requirement the frontend depends on.
> Updated after Strategy Architecture rewrite (2026-06-14).

---

## Base URL

```
Development:  http://localhost:5000/api/v1
Production:   https:api.kraviq.app/api/v1
```

All requests require `Authorization: Bearer <firebase_id_token>` except EA-facing routes and `/health`.

---

## Standard Response Envelope

```json
{ "success": true, ...payload }
{ "success": false, "message": "Human-readable error" }
```

HTTP status codes: `200` OK · `201` Created · `400` Validation error · `401` Unauthenticated · `403` Forbidden · `404` Not found · `500` Server error.

---

## Auth — `/api/v1/auth`

### POST `/auth/register`
```json
// Request
{ "email": "string", "password": "string", "firstName": "string", "lastName": "string" }

// Response 201
{ "success": true, "user": { "_id", "email", "firstName", "lastName" }, "token": "firebase_id_token" }
```

### POST `/auth/login`
```json
// Request
{ "email": "string", "password": "string" }

// Response 200
{ "success": true, "user": { "_id", "email", "firstName", "lastName" }, "token": "firebase_id_token" }
```

---

## User — `/api/v1/user`

### GET `/user/profile`
```json
// Response 200
{
  "success": true,
  "user": {
    "_id", "email", "firstName", "lastName", "phoneNumber",
    "defaultAccountId",
    "traderProfile": {
      "bio", "tradingExperience", "primaryPairs": ["EURUSD"],
      "preferredSessions": [], "tradingStyle"
    },
    "notificationPreferences": { ... },
    "aiPreferences": { ... },
    "onboarding": { "completed": false, "skipped": false },
    "featureFlags": { ... },
    "businessScore": { "overall": 0, "band": "needs_work" },
    "dashboardPreferences": { ... },
    "unreadNotifications": 0
  }
}
```

### PATCH `/user/profile`
Allowed fields: `firstName`, `lastName`, `phoneNumber`, `traderProfile` (partial).

### PATCH `/user/preferences/notifications`
### PATCH `/user/preferences/ai`
### POST `/user/onboarding/complete`
### POST `/user/onboarding/skip`

---

## Accounts — `/api/v1/accounts`

### Account object shape

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "name": "string",
  "type": "prop | normal | war",
  "platform": "string",
  "leverage": 100,
  "startingBalance": 10000,
  "accountSize": 10000,
  "balanceSnapshot": 10000,
  "equitySnapshot": 10000,
  "status": "evaluation | active | funded | breached | paused | archived",
  "isActive": true,
  "ruleMode": "track | enforced | off",
  "tradingMode": "string",
  "tags": [],
  "color": "#3B82F6",
  "notes": "string",
  "visibility": "private | shared",
  "previousAccountId": null,

  "goals": {
    "monthlyReturnTarget": null,
    "weeklyReturnTarget": null,
    "targetWinRate": null
  },

  "trackRules": [
    {
      "_id": "ObjectId",
      "title": "string",
      "category": "risk | behavior | strategy | session | custom",
      "evaluationType": "daily_loss_limit | trade_frequency | consecutive_losses | custom",
      "mode": "track | warn | enforce",
      "enabled": true,
      "threshold": null,
      "metadata": {},
      "violated": false,
      "violationsCount": 0
    }
  ],

  "performance": {
    "totalTrades": 0, "winRate": 0, "avgRR": 0,
    "totalPnl": 0, "totalNetPnl": 0,
    "profitFactor": 0, "expectancy": 0,
    "maxDrawdown": 0, "currentStreak": 0,
    "lastUpdated": "ISO date"
  },

  "eaSync": {
    "isConnected": false,
    "lastHeartbeat": null,
    "brokerName": null,
    "accountNumber": null,
    "config": {}
  },

  "prop only": {
    "propRules": {
      "propFirmName": "string",
      "dailyDrawdownPercent": 5,
      "totalDrawdownPercent": 10,
      "maxLotSize": null,
      "allowedSessions": ["london", "new_york"],
      "holdingRules": { "newsTradingAllowed": true, "weekendHoldingAllowed": false }
    },
    "challenge": { ... },
    "payout": { ... },
    "propMetrics": { ... }
  },

  "normal only": {
    "normalConfig": {
      "maxRiskPerTradePercent": null
    },
    "personalMetrics": { ... }
  },

  "war only": {
    "warConfig": { ... },
    "personalMetrics": { ... }
  }
}
```

> **Breaking change from previous version:**
> - `goals` no longer has `maxRiskPerTrade`, `targetRR`, `maxDailyLoss`, `maxWeeklyLoss` — removed.
> - `normalConfig` no longer has `strategyName`, `strategyNotes`, `targetMonthlyReturnPercent`, `maxDailyLossPercent`, `maxWeeklyLossPercent` — removed.
> - `normalConfig.maxRiskPerTradePercent` is the ONLY remaining fallback risk field, used only when no strategy is assigned.

### POST `/accounts`
```json
// Request
{
  "name": "My Prop Account",
  "type": "prop",
  "accountSize": 100000,
  "platform": "MT5",
  "leverage": 100,
  "propRules": { "propFirmName": "FTMO", "dailyDrawdownPercent": 5, "totalDrawdownPercent": 10 }
}
// Response 201
{ "success": true, "account": { ...AccountObject } }
```

### GET `/accounts` → `{ "success": true, "accounts": [...] }`
### GET `/accounts/:id` → `{ "success": true, "account": { ... } }`
### PATCH `/accounts/:id` → partial update, same response shape
### DELETE `/accounts/:id` → soft delete (`isActive: false`) → `{ "success": true }`

### POST `/accounts/:id/adjust-balance`
```json
// Request
{ "amount": 500, "type": "adjustment_increase", "notes": "string" }
// Response 200
{ "success": true, "account": { ... }, "transaction": { ... } }
```

### PATCH `/accounts/:id/balance-snapshot`
### POST `/accounts/:id/transition-status`
```json
{ "status": "funded" }
```

### POST `/accounts/:id/recalculate-performance`
Forces a full performance cache rebuild.
```json
// Response 200
{ "success": true, "account": { ... } }
```

---

## Account Rules — `/api/v1/accounts/:id/rules`

### POST `/accounts/:id/rules`
```json
// Request
{
  "title": "Daily loss limit",
  "category": "risk",
  "evaluationType": "daily_loss_limit",
  "mode": "warn",
  "threshold": 3,
  "metadata": {}
}
// Response 201
{ "success": true, "account": { ... } }
```

> **`evaluationType` must be one of:** `daily_loss_limit` · `trade_frequency` · `consecutive_losses` · `custom`
> Any other value returns `400`. Do not send legacy values like `max_risk_percent`.

### PATCH `/accounts/:id/rules/:ruleId` — partial update of a single rule
### DELETE `/accounts/:id/rules/:ruleId`
### PATCH `/accounts/:id/rules/:ruleId/toggle` → toggles `enabled`
### POST `/accounts/:id/rules/evaluate` → evaluates all rules against current data

---

## Account — Prop / Challenge / Payout

### PATCH `/accounts/:id/prop-rules`
### PATCH `/accounts/:id/challenge`
### POST `/accounts/:id/challenge/evaluate`
### PATCH `/accounts/:id/payout`
### POST `/accounts/:id/payout/check-eligibility`
### POST `/accounts/:id/violations`
### PATCH `/accounts/:id/war-config`
### POST `/accounts/:id/graduate`

---

## Account — Strategy Assignments (NEW)

Strategies are created in the strategy library (`/api/v1/strategies`), then assigned to accounts here.
An account can have multiple strategies assigned; **one** can be marked as the default.
The default assignment is the fallback when a trade has no explicit strategy set.

### POST `/accounts/:id/strategies`
```json
// Request
{ "strategyId": "ObjectId", "isDefault": true }

// Response 201
{
  "success": true,
  "assignment": {
    "_id": "ObjectId",
    "user": "ObjectId",
    "strategy": "ObjectId",
    "account": "ObjectId",
    "isDefault": true,
    "assignedAt": "ISO date"
  }
}
```
> Setting `isDefault: true` automatically clears `isDefault` on all other assignments for this account.

### GET `/accounts/:id/strategies`
```json
// Response 200
{
  "success": true,
  "assignments": [
    {
      "_id": "ObjectId",
      "strategy": { ...StrategyObject },
      "isDefault": true,
      "assignedAt": "ISO date"
    }
  ]
}
```

### DELETE `/accounts/:id/strategies/:strategyId`
```json
// Response 200
{ "success": true }
```

### PATCH `/accounts/:id/strategies/:strategyId/default`
```json
// Response 200
{ "success": true, "assignment": { ...AssignmentObject, "isDefault": true } }
```

---

## Account — EA Key Management

### POST `/accounts/:id/ea/generate-key`
> Returns the raw key **once only** — show it to the user immediately and warn it cannot be retrieved again.
```json
{ "success": true, "eaApiKey": "64-char-hex-string" }
```
### DELETE `/accounts/:id/ea/key`
### PATCH `/accounts/:id/ea/config`
### GET `/accounts/:id/ea/status`

---

## Strategies — `/api/v1/strategies` (NEW)

All endpoints require Firebase JWT.

### Strategy object shape

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "name": "ICT Silver Bullet",
  "description": "string",
  "category": "ict | smc | support_resistance | supply_demand | volume_profile | price_action | indicator_based | hybrid | custom",

  "pairs": ["EURUSD", "GBPUSD"],
  "timeframes": ["15m", "1h"],
  "sessions": ["asian", "london", "new_york", "sydney"],
  "killzones": ["london_open"],

  "indicators": [
    { "type": "EMA", "params": { "period": 21 } }
  ],

  "entryConditions": [
    {
      "type": "pullback_to_ema",
      "description": "Price pulls back to 21 EMA then continues trend",
      "params": { "ema": 21, "tolerance_pips": 5 }
    }
  ],

  "riskRules": {
    "maxRiskPerTrade": 1,
    "minRR": 2,
    "slType": "fixed_pips | atr | swing_high | swing_low | null",
    "tpType": "fixed_pips | rr_ratio | level | null",
    "maxTradesPerDay": null
  },

  "setupCriteria": [
    {
      "id": "msb",
      "label": "Market structure break (BOS/CHoCH)",
      "category": "market_structure | liquidity | zones | volume | order_flow | fibonacci | timing | multi_timeframe | confirmation | fundamental",
      "required": true
    }
  ],

  "confluence": {
    "mode": "all_required | min_count",
    "minCount": null
  },

  "isTemplate": false,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### GET `/strategies`
```json
// Returns user's own strategies (isTemplate: false)
{ "success": true, "strategies": [ ...StrategyObject ] }
```

### GET `/strategies/templates`
```json
// Returns 6 pre-built templates (isTemplate: true, not user-owned)
// Use `cloneFrom` in POST /strategies to copy one
{ "success": true, "templates": [ ...StrategyObject ] }
```

**Built-in templates:** ICT Silver Bullet · Smart Money Concepts · Support & Resistance Bounce · Supply & Demand Zones · Volume Profile Reversal · EMA Pullback

### GET `/strategies/:id`
```json
{ "success": true, "strategy": { ...StrategyObject } }
```

### POST `/strategies`
```json
// Option A — create from scratch
{
  "name": "My Strategy",
  "category": "custom",
  "sessions": ["london"],
  "riskRules": { "maxRiskPerTrade": 1, "minRR": 2 },
  "setupCriteria": [
    { "id": "setup_1", "label": "Price at key level", "category": "zones", "required": true }
  ],
  "confluence": { "mode": "all_required" }
}

// Option B — clone a template
{
  "cloneFrom": "templateObjectId",
  "name": "My ICT Strategy"   // optional override
}

// Response 201
{ "success": true, "strategy": { ...StrategyObject, "isTemplate": false } }
```

### PATCH `/strategies/:id`
Partial update of any field except `isTemplate` (changes to `isTemplate` are rejected with 400).
```json
// Response 200
{ "success": true, "strategy": { ...StrategyObject } }
```

### DELETE `/strategies/:id`
Cascade on delete:
1. All `StrategyAssignment` docs referencing this strategy are removed.
2. All trades with `trade.strategy === this._id` have `trade.strategy` set to `null`.
3. Discipline is automatically recalculated on all affected trades (may resolve to a different default strategy or to null).

```json
// Response 200
{ "success": true }
```

---

## Trades — `/api/v1/trades`

### Trade object shape — full

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "accountId": "ObjectId",
  "source": "manual | ea | semi_auto | csv_import",

  "pair": "EURUSD",
  "direction": "buy | sell",
  "lotSize": 0.1,
  "entryPrice": 1.08500,
  "stopLoss": 1.08200,
  "takeProfit": 1.09100,
  "exitPrice": 1.09100,
  "openedAt": "ISO date",
  "closedAt": "ISO date",

  "pnl": 60,
  "netPnl": 57,
  "commission": -2,
  "swap": -1,
  "riskAmount": 30,
  "riskPercent": 1.0,
  "plannedRR": 2.0,
  "actualRR": 2.0,
  "realizedRR": 2.0,

  "ticketNumber": null,
  "magicNumber": null,
  "status": "open | closed",
  "outcome": "win | loss | breakeven",

  "sessions": ["london", "new_york"],

  "strategy": "ObjectId | null",

  "setup": {
    "criteriaChecked": [
      { "id": "msb", "checked": true },
      { "id": "fvg", "checked": false }
    ],
    "confluenceMet": false,
    "followed": false
  },

  "isCompliant": true,
  "complianceViolations": [
    {
      "rule": "NO_STOP_LOSS | NO_TAKE_PROFIT | MAX_RISK_EXCEEDED | MIN_RR_NOT_MET | MAX_DAILY_DRAWDOWN_EXCEEDED | MAX_LOT_SIZE_EXCEEDED | SESSION_NOT_ALLOWED | NEWS_WINDOW_VIOLATION",
      "message": "string",
      "severity": "warning | medium | high | critical",
      "actual": null,
      "limit": null
    }
  ],

  "discipline": {
    "score": 75,
    "isDisciplined": false,
    "violations": {
      "session": false,
      "risk": false,
      "rr": false,
      "setup": true
    },
    "feedback": [
      "Trade did not meet the strategy's setup confluence criteria."
    ],
    "calculatedAt": "ISO date"
  },

  "notes": "string",
  "screenshots": [],
  "grade": null,
  "setupDetails": {},
  "checklist": {},
  "isFlagged": false,
  "review": {},
  "isActive": true
}
```

#### Key nullability rules for `setup` and `discipline`

| Field | Value | Meaning |
|---|---|---|
| `trade.strategy` | `null` | No strategy tagged |
| `trade.strategy` | ObjectId | Strategy explicitly tagged on this trade |
| `trade.setup` | `null` | Criteria checklist never assessed |
| `trade.setup` | object | Trader has assessed criteria (at creation or via PATCH) |
| `trade.discipline` | `null` | No effective strategy found — cannot score |
| `trade.discipline.score` | `null` | No effective strategy |
| `trade.discipline.violations.setup` | `null` | Setup check was skipped (trade.setup was null) |
| `trade.discipline.violations.setup` | `false` | Setup check ran, no violation |
| `trade.discipline.violations.setup` | `true` | Setup check ran, confluenceMet was false |

#### `sessions` — always an array, overlap-aware

`sessions` is derived from `trade.openedAt` UTC hour. A trade opened at 14:00 UTC returns `["london", "new_york"]` because the London and NY sessions overlap at that hour. Never treat this as a single value.

Session windows (UTC):
| Session | Hours |
|---|---|
| sydney | 21:00 – 06:00 (crosses midnight) |
| london | 06:00 – 15:00 |
| new_york | 13:00 – 22:00 |

> **Breaking change:** The old `trade.session` (single string) is replaced by `trade.sessions` (array). Update all session display components.

#### `discipline.score` deduction table

| Violation | Deduction |
|---|---|
| Session outside strategy sessions | -25 |
| Risk % exceeds strategy maxRiskPerTrade | -25 |
| Actual RR below strategy minRR | -20 |
| Setup criteria not met (confluenceMet false) | -30 |

`isDisciplined = score >= 60 AND no violations`. A trade with score 70 but one violation (`isDisciplined: false`) is **not** disciplined.

Maximum deduction without setup assessment: 70 (setup check is skipped when `trade.setup === null`, never penalized).

---

### POST `/trades`
```json
// Request — minimum
{
  "accountId": "ObjectId",
  "pair": "EURUSD",
  "direction": "buy",
  "lotSize": 0.1,
  "entryPrice": 1.085,
  "exitPrice": 1.091,
  "pnl": 60,
  "openedAt": "2024-01-15T09:00:00Z",
  "closedAt": "2024-01-15T14:00:00Z",
  "source": "manual"
}

// Request — with strategy (optional)
{
  
  ...above,
  "strategyId": "ObjectId",
  "criteriaChecked": [
    { "id": "msb", "checked": true },
    { "id": "fvg", "checked": true }
  ]
}

// Response 201
{ "success": true, "trade": { ...TradeObject } }
```

When `strategyId` + `criteriaChecked` are provided at creation: `trade.setup` is populated immediately and the discipline setup check is evaluated. If not provided: `trade.strategy = null`, `trade.setup = null` (both are null until tagged later via PATCH).

### GET `/trades` — all user trades (paginated)
### GET `/trades/account/:accountId` — trades for one account
### GET `/trades/account/:accountId/stats`
### GET `/trades/stats/overview`
### GET `/trades/stats/pairs`
### GET `/trades/stats/sessions`
### GET `/trades/stats/weekdays`
### GET `/trades/stats/timeframes`
### GET `/trades/stats/monthly`
### GET `/trades/:id`
### PATCH `/trades/:id`
### DELETE `/trades/:id` — soft delete (`isActive: false`)

### PATCH `/trades/:id/review`
### PATCH `/trades/:id/flag`
### PATCH `/trades/:id/note`
### PATCH `/trades/:id/screenshot`
### PATCH `/trades/:id/grade`
### PATCH `/trades/:id/setup`
### PATCH `/trades/:id/checklist`
### POST `/trades/:id/compliance`
### POST `/trades/:id/discipline`

---

### PATCH `/trades/:id/strategy` (NEW)

Tag a strategy onto an existing trade. This triggers a full compliance + discipline recalculation.

```json
// Request
{
  "strategyId": "ObjectId",
  "criteriaChecked": [
    { "id": "msb", "checked": true },
    { "id": "fvg", "checked": true },
    { "id": "ote", "checked": false }
  ]
}

// Response 200
{
  "success": true,
  "trade": {
    "strategy": "ObjectId",
    "setup": {
      "criteriaChecked": [ ... ],
      "confluenceMet": true,
      "followed": true
    },
    "isCompliant": true,
    "complianceViolations": [],
    "discipline": {
      "score": 100,
      "isDisciplined": true,
      "violations": { "session": false, "risk": false, "rr": false, "setup": false },
      "feedback": ["Trade followed strategy rules."],
      "calculatedAt": "ISO date"
    }
  }
}
```

> Use this endpoint from the trade detail view when the user wants to link a strategy and assess their setup criteria after the trade was taken. The response includes the updated `discipline` and `complianceViolations` — re-render those sections immediately from the response without refetching the full trade.

---

## Transactions — `/api/v1/transactions`

### Transaction object shape
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "accountId": "ObjectId",
  "type": "deposit | withdrawal | payout | trade_profit | trade_loss | swap | commission | adjustment_increase | adjustment_decrease | prop_challenge_fee",
  "amount": 500,
  "balanceAfter": 10500,
  "equityAfter": 10500,
  "source": "manual | trade | system | ea_sync | csv_import",
  "notes": "string",
  "eventTag": null,
  "tags": [],
  "reversed": false,
  "reversalTransactionId": null,
  "createdAt": "ISO date"
}
```

> Prop accounts: only `prop_challenge_fee`, `payout`, `trade_profit`, `trade_loss`, `swap`, `commission`, `adjustment_increase`, `adjustment_decrease` are valid.
> `deposit` and `withdrawal` are **never** valid on prop accounts.

### GET `/transactions`
### POST `/transactions`
### GET `/transactions/summary`
### GET `/transactions/distribution`
### GET `/transactions/balance-history`
### GET `/transactions/monthly-activity`
### GET `/transactions/account/:accountId`
### GET `/transactions/account/:accountId/summary`
### GET `/transactions/account/:accountId/distribution`
### GET `/transactions/account/:accountId/balance-history`
### GET `/transactions/account/:accountId/monthly-activity`
### POST `/transactions/account/:accountId/payout`
### POST `/transactions/account/:accountId/withdrawal`
### GET `/transactions/:id`
### PATCH `/transactions/:id`
### POST `/transactions/:id/reverse`
### DELETE `/transactions/:id` — alias for reverse (soft)

---

## CSV Import — `/api/v1/import`

### POST `/import/preview`
Multipart form: field `file` (CSV). Returns parsed rows for confirmation.

### POST `/import/confirm`
Commits the previewed import.

### GET `/import/history`
### GET `/import/history/:batchId`
### POST `/import/history/:batchId/undo`
### GET `/import/template` — download blank CSV template
### GET `/import/brokers` — list supported broker schemas
### POST `/import/custom-schema`
### GET `/import/custom-schema`

---

## Notifications — `/api/v1/notifications`

### Notification object shape
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "type": "string",
  "category": "account_health | prop_firm | trading_milestone | ea_sync | security | system",
  "title": "string",
  "message": "string",
  "data": {},
  "isRead": false,
  "createdAt": "ISO date"
}
```

Critical types (cannot be disabled by user): `account_blown`, `balance_mismatch`, `password_changed`, `new_login`, `account_deleted`, `daily_drawdown_hit`.

### GET `/notifications`
### GET `/notifications/unread-count` → `{ "success": true, "count": 3 }`
### GET `/notifications/preferences`
### PATCH `/notifications/preferences`
### PATCH `/notifications/read-all`
### PATCH `/notifications/:id/read`
### DELETE `/notifications/:id`

---

## Business Score — `/api/v1/score`

### Score object shape
```json
{
  "overall": 72,
  "band": "needs_work | developing | progressing | solid | elite",
  "pillars": {
    "consistency": 80,
    "riskManagement": 65,
    "profitability": 70,
    "discipline": 75,
    "growth": 60
  },
  "minimumTradesReached": true,
  "calculatedAt": "ISO date"
}
```

Bands: `needs_work` (0–20) · `developing` (21–40) · `progressing` (41–60) · `solid` (61–80) · `elite` (81–100). Show a disclaimer if `minimumTradesReached: false` (requires 10 trades).

### GET `/score/account/:accountId`
### GET `/score/user`
### POST `/score/account/:accountId/recalculate`
### POST `/score/user/recalculate`
### GET `/score/account/:accountId/history`
### GET `/score/user/history`

---

## Dashboard — `/api/v1/dashboard`

### GET `/dashboard/overview`
Returns the full dashboard payload: performance summary, equity curve, trade breakdown, open trades, recent activity, business score, streaks, pair analysis, session analysis, calendar data. Shape depends on `dashboardPreferences`.

### GET `/dashboard/preferences`
### PATCH `/dashboard/preferences`
### POST `/dashboard/account/:id/refresh-cache`
Forces a cache refresh for an account's performance data.

---

## EA Routes — `/api/v1/ea` (EA-only, no Firebase)

These are used only by the MT4/MT5 Expert Advisor. Header: `x-ea-api-key: <64-char-hex>`. Not called from frontend.

---

## Health

### GET `/health`
```json
{ "status": "ok", "service": "Kraviq API" }
```

---

## UI Requirements by Feature

### Strategy Library

A dedicated page/section for managing the user's personal strategy library.

**List view:**
- Show all user-owned strategies (GET `/strategies`)
- Show template gallery (GET `/strategies/templates`) for discovery
- Card per strategy: name, category badge, session tags, riskRules summary (maxRiskPerTrade %, minRR), setupCriteria count
- "Clone" button on templates → POST `/strategies` with `cloneFrom`
- "Create from scratch" → form, POST `/strategies`
- "Delete" → confirm dialog (warn: affects assigned accounts and tagged trades)

**Strategy detail / edit view:**
- All fields editable via PATCH `/strategies/:id`
- `isTemplate` is read-only — never show an edit control for it
- setupCriteria: drag-sortable list; each item has `id` (auto-generate on create), `label`, `category` select, `required` toggle
- confluence mode selector: `all_required` | `min_count` (show minCount input when min_count selected)

### Account Strategy Assignments

In the account settings / detail view:
- Section: "Assigned Strategies"
- List assigned strategies (GET `/accounts/:id/strategies`)
- "Assign strategy" → pick from user's library → POST `/accounts/:id/strategies`
- Toggle "Set as default" → PATCH `/accounts/:id/strategies/:strategyId/default`
  - Only one can be default; UI must show which one is active
  - The default strategy is the fallback for all trades with no explicit strategy
- Remove assignment → DELETE `/accounts/:id/strategies/:strategyId`

**Account goals form:**
- Only show: `monthlyReturnTarget`, `weeklyReturnTarget`, `targetWinRate`
- Do NOT show `maxRiskPerTrade`, `targetRR`, `maxDailyLoss`, `maxWeeklyLoss` — these fields no longer exist

**normalConfig form (normal accounts only):**
- Only show: `maxRiskPerTradePercent`
- Label it: "Default risk per trade (%) — used when no strategy is assigned"
- Do NOT show strategy name, notes, monthly return target, daily/weekly loss limits — these fields no longer exist

**trackRules — evaluationType dropdown:**
Must use exactly these 4 values (and their display labels):
| Value | Display label |
|---|---|
| `daily_loss_limit` | Daily Loss Limit |
| `trade_frequency` | Trade Frequency |
| `consecutive_losses` | Consecutive Losses |
| `custom` | Custom |

Any other value will be rejected with 400.

### Trade Detail — Strategy & Setup

**Strategy section (new):**
- Show linked strategy name if `trade.strategy` is set; "No strategy" badge if null
- "Tag strategy" button → opens modal:
  1. Strategy picker (from user's library)
  2. Setup criteria checklist — load selected strategy's `setupCriteria`, render each as a checkbox
  3. Submit → PATCH `/trades/:id/strategy`
  4. On success, update trade.setup, trade.discipline, trade.isCompliant in place (use response payload)

**Criteria checklist display (when `trade.setup` is non-null):**
- Show each criterion from the assigned strategy with `checked` state
- Show `confluenceMet` as a pass/fail badge
- Show `followed` (same value as confluenceMet) as "Setup followed" indicator

**Discipline section (new):**

| State | Display |
|---|---|
| `discipline === null` | "No strategy assigned to this account" |
| `discipline.score === null` | "Strategy required for scoring" |
| `discipline.isDisciplined === true` | Green badge: "Disciplined" |
| `discipline.isDisciplined === false` | Red/amber badge: "Not Disciplined" |

Show score as a ring/bar (0–100). Show each violation flag:
- `violations.session` — "Session: outside strategy sessions"
- `violations.risk` — "Risk: exceeded limit"
- `violations.rr` — "RR: below minimum"
- `violations.setup` — "Setup: criteria not met"
  - When `violations.setup === null`: show "Not assessed" (trade.setup was null when discipline ran)
  - When `violations.setup === false`: show nothing or a green check
  - When `violations.setup === true`: show the violation

Show `feedback` as a bulleted list of plain-language messages.

**Compliance section (updated):**

The `complianceViolations` array now includes RR violations sourced from the strategy. Display each:
- `NO_STOP_LOSS` — warning severity, amber
- `NO_TAKE_PROFIT` — warning severity, amber
- `MAX_RISK_EXCEEDED` — high severity, red
- `MIN_RR_NOT_MET` — medium severity, amber (only shown when strategy defines minRR)
- `MAX_DAILY_DRAWDOWN_EXCEEDED` — critical, red (prop only)
- `MAX_LOT_SIZE_EXCEEDED` — high, red (prop only)
- `SESSION_NOT_ALLOWED` — medium, amber (prop only)
- `NEWS_WINDOW_VIOLATION` — high, red (prop only)

`isCompliant: true` with an empty `complianceViolations: []` = fully compliant.

**Sessions display (updated):**

`trade.sessions` is now an array. Replace any single-value session display with a multi-badge row.
Examples: `["london"]` → London badge · `["london", "new_york"]` → London + New York badges (overlap).

---

## Field Reference — What Changed

| Old field | New field | Notes |
|---|---|---|
| `trade.session` (String) | `trade.sessions` (String[]) | Overlap-aware, always an array |
| `account.goals.maxRiskPerTrade` | removed | Moved to `strategy.riskRules.maxRiskPerTrade` |
| `account.goals.targetRR` | removed | Moved to `strategy.riskRules.minRR` |
| `account.goals.maxDailyLoss` | removed | Use trackRules with `evaluationType: daily_loss_limit` |
| `account.goals.maxWeeklyLoss` | removed | Use trackRules |
| `account.normalConfig.strategyName` | removed | Strategy is its own model now |
| `account.normalConfig.strategyNotes` | removed | Use `strategy.description` |
| `account.normalConfig.targetMonthlyReturnPercent` | removed | Use `account.goals.monthlyReturnTarget` |
| `account.normalConfig.maxDailyLossPercent` | removed | Use trackRules |
| `account.normalConfig.maxWeeklyLossPercent` | removed | Use trackRules |
| `trade.setup` (old shape) | `trade.setup` (new shape) | criteriaChecked + confluenceMet + followed |
| `trade.discipline` (old shape) | `trade.discipline` (new shape) | score/isDisciplined/violations.{session,risk,rr,setup}/feedback |
| `trackRules[].evaluationType` (any string) | strict enum, 4 values only | See trackRules section above |
