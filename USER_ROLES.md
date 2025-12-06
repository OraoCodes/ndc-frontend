# User Roles System

## Overview

The application uses a role-based system stored in the `user_profiles` table. User roles determine what actions users can perform in the system.

## Available Roles

Based on the database schema, the following roles are supported:

1. **`user`** (Default)
   - Default role for all new registrations
   - Standard user access
   - Can view public data and manage their own profile

2. **`admin`**
   - Administrative access
   - Can manage counties, thematic areas, publications, and performance data
   - Can view and edit all data

3. **`super_admin`** or **`superadmin`**
   - Full system access
   - Can manage all data including user roles
   - Highest level of access

4. **`moderator`** (Optional)
   - Can moderate content
   - Limited administrative access

5. **`editor`** (Optional)
   - Can edit content
   - Limited to content management

## Role Storage

Roles are stored in the `user_profiles` table:

```sql
role TEXT NOT NULL DEFAULT 'user'
```

## Role Display

Roles are automatically formatted for display in the UI:
- `user` → "User"
- `admin` → "Admin"
- `super_admin` → "Super Admin"
- `moderator` → "Moderator"
- `editor` → "Editor"

## Current Implementation

### Where Roles Are Used

1. **MainLayout Header** (`client/components/MainLayout.tsx`)
   - Displays user's name and formatted role
   - Shows user initials in avatar

2. **AuthContext** (`client/context/AuthContext.tsx`)
   - Loads user role from `user_profiles` table
   - Defaults to 'user' if not specified

3. **Database Schema** (`supabase/migrations/20250106000000_initial_schema.sql`)
   - Role column with default value 'user'
   - Stored in `user_profiles` table

### Role Assignment

Currently, all new users are assigned the `user` role by default. This happens:
1. During registration via the database trigger (`handle_new_user()`)
2. As a fallback in `AuthContext` if profile creation fails

## Updating User Roles

To change a user's role, you can:

### Option 1: Via Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor → `user_profiles`
2. Find the user and update the `role` column

### Option 2: Via SQL
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### Option 3: Via Application (Future Enhancement)
- Create an admin interface to manage user roles
- Add role-based access control (RBAC) middleware

## Role-Based Access Control (Future)

Currently, roles are displayed but not enforced. Future enhancements could include:

1. **Protected Routes**
   - Only admins can access `/admin/*` routes
   - Only authenticated users can access `/dashboard`

2. **Feature Flags**
   - Only admins can create/edit counties
   - Only admins can upload publications
   - Only super admins can manage users

3. **API Authorization**
   - Server-side checks for role-based permissions
   - RLS policies based on user roles

## Example: Checking User Role

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    // Show admin features
  }
  
  return <div>...</div>;
}
```

## Security Considerations

1. **Never trust client-side role checks alone**
   - Always verify roles on the server/API level
   - Use RLS policies in Supabase for database-level security

2. **Role validation**
   - Validate roles when updating user profiles
   - Only allow valid role values

3. **Default role**
   - New users should always start with the lowest privilege role ('user')
   - Promote users to higher roles only when necessary

## Current Database State

To check current roles in the database:

```sql
SELECT email, full_name, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
```

