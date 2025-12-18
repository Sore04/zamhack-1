# User Role Redirect Issue - Diagnosis and Fix

## Problem Identified

When logging in as `company@test.com`, you're being redirected to `/dashboard` (student dashboard) instead of `/company/dashboard`.

## Root Cause

The middleware correctly checks the user's role from the `profiles` table and redirects accordingly. The issue is that the user `company@test.com` likely has:
1. **No profile record** in the `profiles` table, OR
2. **The role is set to 'student'** (default) instead of 'company_admin' or 'company_member'

## How to Fix

### Option 1: Update via Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://yksjcdotngzskbisadeq.supabase.co
2. Navigate to **Table Editor** → **profiles**
3. Find the row where the user ID matches `company@test.com`'s auth ID
4. Update the `role` column to `company_admin` (or `company_member`)
5. If no profile exists, you need to create one:
   - Get the user ID from **Authentication** → **Users**
   - Insert a new row in the `profiles` table with:
     - `id`: [user's auth.uid]
     - `role`: `company_admin`

### Option 2: Run SQL in Supabase SQL Editor

```sql
-- First, find the user's ID
SELECT id, email FROM auth.users WHERE email = 'company@test.com';

-- Then update their profile role (replace USER_ID with the actual ID from above)
UPDATE profiles
SET role = 'company_admin'
WHERE id = 'USER_ID';

-- If no profile exists, insert one (replace USER_ID)
INSERT INTO profiles (id, role)
VALUES ('USER_ID', 'company_admin')
ON CONFLICT (id) DO UPDATE SET role = 'company_admin';
```

### Option 3: Create Profile with Correct Role During Signup

The schema has a trigger `handle_new_user()` that auto-creates profiles when users sign up, but it expects the role to be passed in `raw_user_meta_data` during signup.

If you're creating test users manually, you need to either:
1. Set the role in metadata during creation, OR
2. Manually update the profile table afterward

## Verify the Fix

After updating the role, log in again as `company@test.com`. The middleware will:
1. Check the user's role from `profiles.role`
2. See it's `company_admin`
3. Redirect to `/company/dashboard` (line 66 in middleware.ts)

## Additional Check

You can also check the middleware is working by adding some console logging or checking the current user's role.
