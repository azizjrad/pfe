# Frontend Auth State Management Fix - Summary

## Problems Fixed

### 1. **Single Source of Truth Issues**

- ❌ **Before**: AuthContext relied on localStorage as single source of truth
- ✅ **After**: AuthContext validates session with backend `/api/user` on mount (2-phase loading)
  - Phase 1: Load cached user for instant UI rendering
  - Phase 2: Validate with server to detect suspension/invalidation

### 2. **Server-Side Suspension Detection**

- ❌ **Before**: If user suspended server-side, frontend still showed as authenticated
- ✅ **After**: Added periodic session validation (every 30 seconds)
  - Detects `is_suspended` flag changes
  - Detects role/permission changes
  - Detects any user data changes server-side

### 3. **Hard Redirects in HTTP Interceptor**

- ❌ **Before**: `http.js` did `window.location.href = "/login"` on 401
  - Race condition: AuthContext state not cleaned up properly
  - localStorage manually cleared without context notification
- ✅ **After**: `http.js` emits `"unauthorized"` event via authEventEmitter
  - AuthContext subscribes to event
  - AuthContext clears state → calls logout() → navigates to login
  - Clean state management, no race conditions

## Files Changed

### 1. **New File: `frontend/src/services/authEventEmitter.js`**

- Simple event emitter for auth state communication
- Used by `http.js` to notify `AuthContext` of auth failures
- Prevents tight coupling between interceptor and context

### 2. **Updated: `frontend/src/contexts/AuthContext.jsx`**

- Added `useNavigate` hook for programmatic navigation
- Added subscription to `authEventEmitter` for unauthorized events
- Added periodic session validation effect (30 second interval)
- Detects server-side suspensions and role changes
- Properly clears state before navigating to login

### 3. **Updated: `frontend/src/services/http.js`**

- Removed hard `window.location.href = "/login"` redirect
- Now emits `"unauthorized"` event instead of redirecting
- Lets AuthContext own the logout + navigation logic

## Data Flow

### On App Mount:

```
AuthContext.useEffect (mount)
  ↓
Check localStorage for cached user
  ├─ If cached user exists:
  │   ├─ Set UI state immediately
  │   └─ Call /api/user in background
  │       ├─ If valid: update fresh data
  │       └─ If 401/error: emit logout
  └─ If no cached user: set loading false
```

### On 401 Error During Session:

```
http.interceptors.response (error handler)
  ↓
Check if status === 401
  ↓
authEventEmitter.emit("unauthorized")
  ↓
AuthContext listener catches event
  ├─ Clear user state (setUser(null))
  ├─ Call authService.logout() (clear localStorage)
  └─ Navigate to /login via useNavigate
```

### Every 30 Seconds (Periodic Validation):

```
AuthContext.useEffect (session validation)
  ├─ If user exists:
  │   └─ Call /api/user
  │       ├─ Check is_suspended flag
  │       ├─ Detect role/permission changes
  │       ├─ If suspended: logout + navigate
  │       └─ If changes: update user state
  └─ If error 401: emit unauthorized event
```

## Benefits

1. **Real-time Suspension Detection**
   - User suspended server-side? Detected within 30 seconds max
   - No stale auth state

2. **Proper State Cleanup**
   - No race conditions between interceptor and context
   - Event-driven architecture prevents timing issues

3. **Backend Validation**
   - Always trusts server as source of truth
   - localStorage is just a cache for UX

4. **Error Recovery**
   - If session becomes invalid during active use, immediate logout
   - User knows why (error message provided)

5. **Defensive Programming**
   - Periodic checks catch edge cases (token expiration, role changes)
   - HTTP errors trigger same cleanup logic

## Testing Scenarios

### Test 1: User Suspended While Logged In

1. User logs in normally
2. Admin suspends user server-side
3. AuthContext detects suspension within 30 seconds
4. User redirected to login with message

### Test 2: Token Expires During Active Use

1. User making requests
2. Token expires on server (not in localStorage)
3. Next request returns 401
4. Interceptor emits "unauthorized" event
5. AuthContext clears state and redirects

### Test 3: Role Changed Server-Side

1. User logs in as "client"
2. Admin changes role to "agency_admin"
3. Periodic validation detects change
4. User state updated with new role
5. UI re-renders with new permissions

## Backend Endpoints Required

- ✅ `GET /api/user` (AuthController@user) - Returns authenticated user data
  - Must include `is_suspended` flag
  - Must include updated `role`
  - Must include all user data for permission checks
