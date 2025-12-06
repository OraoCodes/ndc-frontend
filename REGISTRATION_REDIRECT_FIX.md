# Registration Redirect Fix

## Problem

Users were being added to the database after signing up, but they were not being redirected to the dashboard with their user account details loaded.

## Root Cause

The redirect was happening before:
1. The database trigger finished creating the user profile
2. The user profile was loaded into AuthContext
3. The user state was set in the application

This caused the dashboard to load without user data, even though the user was authenticated.

## Solution

### 1. Improved Profile Loading in AuthContext

**Before:**
- Waited 300ms then tried to load profile once
- If profile didn't exist, used fallback

**After:**
- Retries loading profile up to 5 times with exponential backoff
- Waits for profile to actually exist before proceeding
- Only uses fallback if all retries fail

### 2. Better Timing in RegisterPage

**Before:**
- Redirected after 500ms timeout
- Didn't wait for user state to be set

**After:**
- Waits at least 500ms for profile to load
- Gives AuthContext time to set user state
- Then redirects to dashboard

## Code Changes

### `client/context/AuthContext.tsx`

```typescript
// Now retries loading profile with exponential backoff
let retries = 0;
const maxRetries = 5;

while (!profileLoaded && retries < maxRetries) {
  await new Promise(resolve => setTimeout(resolve, 300 * (retries + 1)));
  // Check if profile exists, load it if found
  // Retry if not found
}
```

### `client/pages/RegisterPage.jsx`

```javascript
// Wait for user profile to be loaded
let attempts = 0;
const maxAttempts = 20; // 2 seconds max wait

while (attempts < maxAttempts) {
  await new Promise(resolve => setTimeout(resolve, 100));
  attempts++;
  if (attempts >= 5) { // Wait at least 500ms
    break;
  }
}
```

## Testing

1. **Register a new user:**
   - Fill out registration form
   - Submit
   - Should wait briefly then redirect to dashboard
   - Dashboard should show user's name and role in header

2. **Check user data:**
   - Header should display real name from database
   - Header should display role (default: "User")
   - Avatar should show user initials

3. **Verify in database:**
   - Check `user_profiles` table in Supabase
   - User should have all fields populated
   - Profile should be created by trigger

## Expected Flow

```
1. User submits registration
   ↓
2. Supabase creates user (if email confirmation disabled, session created)
   ↓
3. Database trigger creates profile (async)
   ↓
4. AuthContext retries loading profile until found
   ↓
5. User state set in AuthContext
   ↓
6. RegisterPage waits for user state
   ↓
7. Redirect to dashboard
   ↓
8. Dashboard displays user name and role
```

## Notes

- The retry mechanism handles race conditions between trigger execution and profile loading
- Maximum wait time is ~2 seconds (5 retries × 300ms + initial delay)
- If profile still not found after retries, uses auth metadata as fallback
- This ensures user always sees their data, even if there's a delay

## Related Files

- `client/context/AuthContext.tsx` - Profile loading logic
- `client/pages/RegisterPage.jsx` - Registration and redirect
- `supabase/migrations/20250106140000_auto_create_user_profile.sql` - Database trigger

