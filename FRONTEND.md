 Kraviq — Frontend Integration Guide

Everything here is derived directly from the source code.

---

## Auth header

All endpoints (except `POST /auth/forgot-password`) require:

```
Authorization: Bearer <firebase_id_token>
```

---

## Onboarding

### What the backend tracks

The `onboarding` object on every user document:

```json
{
  "isComplete": false,
  "skippedAt": null,
  "completedSteps": []
}
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `isComplete` | Boolean | `false` | `true` when both `"profile_setup"` and `"preferences_set"` are in `completedSteps` |
| `skippedAt` | Date or null | `null` | Timestamp of the last skip call |
| `completedSteps` | String[] | `[]` | Steps that have been completed or skipped |

Valid values for `completedSteps`:

| Value | Set by | Required for `isComplete` |
|---|---|---|
| `"profile_setup"` | `POST /onboarding/profile` or `POST /onboarding/complete` | ✅ Yes |
| `"preferences_set"` | `POST /onboarding/preferences` or `POST /onboarding/complete` | ✅ Yes |
| `"email_verified"` | `POST /auth/verify-email` or automatically at login for Google users | No |
| `"first_account_created"` | Automatically when user creates their first account | No |
| `"trader_profile"` | Not set by any endpoint — reserved for future use | No |

`isComplete` becomes `true` only when both `"profile_setup"` AND `"preferences_set"` are in `completedSteps`.

---

## Endpoints

### 1. `POST /api/v1/auth/register`

Rate limit: 20 requests / 15 min

Creates the MongoDB user document. If the document already exists for this Firebase UID it returns the existing one without modifying it.

**Request body:**
```json
{
  "displayName": "Ian Mwendwa",
  "photoURL": "https://..."
}
```

Both fields are optional. `displayName` is split into `firstName` / `lastName` on creation. `photoURL` is saved to `traderProfile.avatarUrl`.

**Response (new user — 201):**
```json
{
  "success": true,
  "created": true,
  "user": { ... }
}
```

**Response (existing user — 200):**
```json
{
  "success": true,
  "created": false,
  "user": { ... }
}
```

Does **not** return `onboardingComplete`. Does **not** sync `emailVerified` from the Firebase token. Does **not** update `lastLoginAt`.

---

### 2. `POST /api/v1/auth/login`

Rate limit: 20 requests / 15 min

Signs the user in. If no MongoDB doc exists it creates one (same as register). Additionally: updates `lastLoginAt`, syncs `emailVerified` from the Firebase token, and fires a login notification.

For Google users: the Firebase token always contains `email_verified: true`. The backend reads this and automatically sets `user.emailVerified = true` and adds `"email_verified"` to `completedSteps` — no separate verify step needed.

**Request body** (optional — only used when creating a new user):
```json
{
  "displayName": "Ian Mwendwa",
  "photoURL": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "created": false,
  "onboardingComplete": false,
  "user": {
    "_id": "...",
    "email": "ian@example.com",
    "emailVerified": false,
    "onboarding": {
      "isComplete": false,
      "skippedAt": null,
      "completedSteps": []
    }
  }
}
```

- `created: true` → new MongoDB doc was just created (first sign-in)
- `created: false` → returning user
- `onboardingComplete` mirrors `user.onboarding.isComplete`

---

### 3. `POST /api/v1/auth/verify-email`

For **email/password users only**. Google users never need this.

Call this after the user has clicked the Firebase verification link and returned to the app. The backend checks Firebase's own record — if Firebase confirms verified, it sets `user.emailVerified = true` and adds `"email_verified"` to `completedSteps`.

**How the frontend knows email is not verified:** check `user.emailVerified === false` from the login response or a profile fetch.

**Request body:** none

**Response (success):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": { "emailVerified": true }
}
```

Does **not** return the updated user object. Update local state from `data.emailVerified`.

**Response (link not clicked yet — 400):**
```json
{
  "success": false,
  "message": "Email not yet verified. Please click the link in your email."
}
```

---

### 4. `POST /api/v1/auth/resend-verification`

Rate limit: 3 requests / 1 hour (network level) + 60 seconds between requests per user (service level)

**Request body:** none

**Response (success):**
```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox."
}
```

**Response (called within 60 seconds — 429):**
```json
{
  "success": false,
  "message": "Please wait 47 seconds before requesting another verification email"
}
```

**Response (already verified — 400):**
```json
{
  "success": false,
  "message": "Email already verified"
}
```

---

### 5. `POST /api/v1/user/onboarding/profile`

Saves the profile step independently. Marks `"profile_setup"` in `completedSteps` and recalculates `isComplete`.

**Required fields:**
```json
{
  "firstName": "Ian",
  "lastName": "Mwendwa",
  "phoneNumber": "+254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile step saved",
  "onboardingComplete": false,
  "completedSteps": ["profile_setup"],
  "user": { ... }
}
```

If `"preferences_set"` was already in `completedSteps`, `onboardingComplete` will be `true` and `message` will be `"Onboarding complete"`.

**Validation error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "firstName": "First name is required",
    "lastName": "Last name is required",
    "phoneNumber": "Phone number is required"
  }
}
```

---

### 6. `POST /api/v1/user/onboarding/preferences`

Saves the preferences step independently. Marks `"preferences_set"` in `completedSteps` and recalculates `isComplete`.

**Required fields:**
```json
{
  "timezone": "Africa/Nairobi",
  "tradingModes": ["manual"],
  "tradingStyles": ["intraday"]
}
```

**Optional fields** (server defaults used if omitted):
```json
{
  "primaryPairs": [],
  "preferredSessions": [],
  "experienceLevel": "beginner",
  "bio": null,

  "journalingAgentEnabled": true,
  "behaviouralAgentEnabled": true,
  "weeklyDebriefEnabled": true,
  "preferredDebriefDay": "sunday",
  "agentTone": "analyst",

  "emailDigest": "weekly",
  "tradeAlerts": true,
  "drawdownWarnings": true,
  "weeklyDebrief": true,
  "pushEnabled": false
}
```

**Enum constraints:**

| Field | Allowed values |
|---|---|
| `tradingModes` | `"manual"` `"ea"` `"semi-auto"` |
| `tradingStyles` | `"scalping"` `"intraday"` `"swing"` `"position"` |
| `preferredSessions` | `"sydney"` `"tokyo"` `"london"` `"new_york"` |
| `experienceLevel` | `"beginner"` `"intermediate"` `"advanced"` `"professional"` |
| `agentTone` | `"coach"` `"analyst"` `"direct"` |
| `preferredDebriefDay` | `"monday"` `"tuesday"` `"wednesday"` `"thursday"` `"friday"` `"saturday"` `"sunday"` |
| `emailDigest` | `"daily"` `"weekly"` `"monthly"` `"none"` |

**Response:**
```json
{
  "success": true,
  "message": "Preferences step saved",
  "onboardingComplete": false,
  "completedSteps": ["preferences_set"],
  "user": { ... }
}
```

If `"profile_setup"` was already in `completedSteps`, `onboardingComplete` will be `true` and `message` will be `"Onboarding complete"`.

**Validation error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "timezone": "Timezone is required",
    "tradingModes": "At least one trading mode is required",
    "tradingStyles": "At least one trading style is required"
  }
}
```

---

### 7. `POST /api/v1/user/onboarding/skip`

Records that the user skipped a step. Sets `skippedAt` timestamp. If a valid `step` is passed, adds it to `completedSteps` so the app does not show that step again on resume.

**Request body:**
```json
{
  "step": "profile_setup"
}
```

`step` is optional. If omitted or not a recognised value, only `skippedAt` is updated.

Valid step values: `"profile_setup"` `"preferences_set"` `"trader_profile"` `"email_verified"` `"first_account_created"`

Skipping does **not** save any field data. It only marks the step as visited.

**Response:**
```json
{
  "success": true,
  "message": "Onboarding skipped",
  "user": {
    "onboarding": {
      "isComplete": false,
      "skippedAt": "2026-06-12T10:00:00.000Z",
      "completedSteps": ["profile_setup"]
    }
  }
}
```

---

### 8. `POST /api/v1/user/onboarding/complete`

Submits both steps at once. All required fields from both the profile and preferences steps must be present in a single call.

**Required fields:** all required fields from both endpoints 5 and 6 above.

**Response:**
```json
{
  "success": true,
  "message": "Onboarding complete",
  "onboardingComplete": true,
  "completedSteps": ["profile_setup", "preferences_set"],
  "user": { ... }
}
```

---

### 9. `GET /api/v1/user/profile`

Returns the full user document.

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "ian@example.com",
    "firstName": "Ian",
    "lastName": "Mwendwa",
    "emailVerified": false,
    "onboarding": {
      "isComplete": false,
      "skippedAt": null,
      "completedSteps": []
    },
    "traderProfile": { ... },
    "aiPreferences": { ... },
    "notifications": { ... }
  }
}
```

---

### 10. `POST /api/v1/auth/forgot-password`

No auth required. Sends a password reset link to the given email. Always returns `200` regardless of whether the email exists (prevents email enumeration).

Rate limit: 5 requests / 15 min

**Request body:**
```json
{ "email": "ian@example.com" }
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent"
}
```

---

### 11. `DELETE /api/v1/auth/delete-account`

Rate limit: 3 requests / 1 hour

Permanently and immediately deletes the user's entire account. There is **no grace period and no recovery**. Once this returns `200`, all data is gone.

**Pre-condition — re-authentication required:** The Firebase token must have been issued within the last **5 minutes** (`auth_time` within 300 seconds of now). If the user has been sitting on the page for longer, prompt them to re-authenticate before calling this endpoint. The backend enforces this check and returns `401` if not met.

**Request body:**
```json
{
  "confirmation": "DELETE"
}
```

The string must be exactly `"DELETE"` (uppercase). Any other value returns a `400`.

**Response (success — 200):**
```json
{
  "success": true,
  "message": "Account deleted successfully. We're sorry to see you go."
}
```

**Response (wrong confirmation — 400):**
```json
{
  "success": false,
  "message": "Type DELETE to confirm account deletion"
}
```

**Response (token too old — 401):**
```json
{
  "success": false,
  "message": "Please re-authenticate before deleting your account"
}
```

**What gets deleted:**

| Collection | Scope |
|---|---|
| User | The user document |
| Account | All trading accounts belonging to the user |
| Trade | All trades belonging to the user |
| Transaction | All transactions belonging to the user |
| Notification | All notifications belonging to the user |
| Strategy | All strategies belonging to the user |
| ImportHistory | All CSV import records belonging to the user |
| ScoreSnapshot | All business score snapshots belonging to the user |
| AccountLog | All account audit logs belonging to the user |
| SyncSession | All EA sync sessions linked to the user's accounts |
| Anomaly | All EA sync anomalies linked to the user's accounts |
| Firebase account | Hard-deleted — user cannot sign in again |

All MongoDB deletions run inside a single transaction — if any collection fails, everything rolls back and nothing is deleted.

**There is no grace period.** Data is not soft-deleted or scheduled for future removal. After `200`, the account cannot be restored.

---

## Onboarding resume logic

On app load, read `user.onboarding.completedSteps` and `user.emailVerified`:

```js
function getNextOnboardingStep(user) {
  const { completedSteps } = user.onboarding;

  // Email/password users only — Google users always have emailVerified = true
  if (!user.emailVerified) return "verify_email";

  const steps = ["profile_setup", "preferences_set"];
  const next = steps.find(s => !completedSteps.includes(s));
  return next ?? "done";
}
```

---

## completedSteps progression reference

**Google user:**

| Stage | completedSteps | isComplete |
|---|---|---|
| First login | `["email_verified"]` | false |
| Submitted profile step | `["email_verified", "profile_setup"]` | false |
| Submitted preferences step | `["email_verified", "profile_setup", "preferences_set"]` | **true** |
| Created first account | `["email_verified", "profile_setup", "preferences_set", "first_account_created"]` | true |

**Email/password user:**

| Stage | completedSteps | isComplete |
|---|---|---|
| Register | `[]` | false |
| Called verify-email | `["email_verified"]` | false |
| Submitted profile step | `["email_verified", "profile_setup"]` | false |
| Submitted preferences step | `["email_verified", "profile_setup", "preferences_set"]` | **true** |

**User who skipped profile step:**

| Stage | completedSteps | isComplete |
|---|---|---|
| Skipped profile step | `["profile_setup"]` | false |
| Submitted preferences step | `["profile_setup", "preferences_set"]` | **true** |

Skipped profile step means `firstName`, `lastName`, `phoneNumber` are not saved. The user can fill these in later via `PATCH /api/v1/user/profile`.

---

## Error response shape

All errors:
```json
{ "success": false, "message": "Description of the error" }
```

Endpoints that validate required fields also include an `errors` object:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message for that field"
  }
}
```

| Status | Meaning |
|---|---|
| `400` | Validation error or business rule violation |
| `401` | Missing, invalid, or expired Firebase token / re-auth required |
| `429` | Rate limit hit |
| `500` | Server error |
