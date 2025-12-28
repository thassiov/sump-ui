# SUMP-UI Dashboard Roadmap

A Next.js dashboard frontend for the SUMP (Simple User Management Platform) identity provider.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui with default theme (black & white)
- **Styling**: Tailwind CSS
- **HTTP Client**: Native fetch with custom wrapper
- **State**: React hooks + context for auth state

---

## Step 1: Project Setup

Initialize the Next.js project with all required dependencies.

### Tasks

1. Initialize Next.js 15 project with TypeScript and Tailwind CSS
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. Initialize shadcn/ui with default theme
   ```bash
   npx shadcn@latest init
   ```
   - Style: Default
   - Base color: Neutral
   - CSS variables: Yes

3. Install required shadcn components
   ```bash
   npx shadcn@latest add button card input label form
   npx shadcn@latest add table dialog dropdown-menu
   npx shadcn@latest add sidebar separator avatar
   npx shadcn@latest add toast badge skeleton
   npx shadcn@latest add alert tabs sheet
   ```

4. Create environment configuration
   ```
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

### Deliverables

- Working Next.js app with shadcn configured
- All UI components installed
- Environment variables set up

---

## Step 2: TypeScript Types & API Client

Create the foundation for API communication.

### Tasks

1. Create TypeScript types matching SUMP API responses

   **`src/types/tenant.ts`**
   - Tenant type (id, name, customProperties, createdAt, updatedAt)

   **`src/types/environment.ts`**
   - Environment type (id, name, tenantId, customProperties, createdAt, updatedAt)

   **`src/types/account.ts`**
   - TenantAccount type (id, email, username, phone, name, avatarUrl, roles, disabled, tenantId)
   - EnvironmentAccount type (id, email, username, phone, name, avatarUrl, customProperties, disabled, environmentId)

   **`src/types/session.ts`**
   - Session type (id, accountType, accountId, contextType, contextId, expiresAt, lastActiveAt)

2. Create API client wrapper

   **`src/lib/api/client.ts`**
   - Base fetch wrapper with error handling
   - Automatic `credentials: 'include'` for cookie auth
   - JSON request/response handling
   - Error type definitions

3. Create API modules for each resource

   **`src/lib/api/auth.ts`**
   - `login(tenantId, credentials)` → POST /auth/tenants/:tenantId/login
   - `logout(tenantId)` → POST /auth/tenants/:tenantId/logout
   - `getSession(tenantId)` → GET /auth/tenants/:tenantId/session

   **`src/lib/api/tenants.ts`**
   - `createTenant(data)` → POST /tenants
   - `getTenant(tenantId)` → GET /tenants/:tenantId
   - `updateTenant(tenantId, data)` → PATCH /tenants/:tenantId

   **`src/lib/api/environments.ts`**
   - `createEnvironment(tenantId, data)` → POST /tenants/:tenantId/environments
   - `getEnvironment(tenantId, envId)` → GET /tenants/:tenantId/environments/:envId
   - `updateEnvironment(tenantId, envId, data)` → PATCH /tenants/:tenantId/environments/:envId
   - `deleteEnvironment(tenantId, envId)` → DELETE /tenants/:tenantId/environments/:envId

   **`src/lib/api/users.ts`**
   - `createUser(envId, data)` → POST /environments/:envId/accounts
   - `getUser(envId, accountId)` → GET /environments/:envId/accounts/:accountId
   - `updateUser(envId, accountId, data)` → PATCH /environments/:envId/accounts/:accountId
   - `disableUser(envId, accountId)` → PATCH /environments/:envId/accounts/:accountId/disable
   - `enableUser(envId, accountId)` → PATCH /environments/:envId/accounts/:accountId/enable
   - `deleteUser(envId, accountId)` → DELETE /environments/:envId/accounts/:accountId

### Deliverables

- Complete TypeScript type definitions
- Reusable API client with error handling
- API modules for all resources

---

## Step 3: Authentication System

Implement login, session management, and route protection.

### Tasks

1. Create auth context and provider

   **`src/contexts/auth-context.tsx`**
   - AuthContext with session state
   - login, logout, checkSession functions
   - Loading state for initial session check

   **`src/hooks/use-auth.ts`**
   - Hook to access auth context

2. Create tenant context

   **`src/contexts/tenant-context.tsx`**
   - Store current tenantId
   - Persist tenantId to localStorage

   **`src/hooks/use-tenant.ts`**
   - Hook to access tenant context

3. Build login page

   **`src/app/(auth)/layout.tsx`**
   - Centered card layout for auth pages

   **`src/app/(auth)/login/page.tsx`**
   - Tenant ID input field
   - Email/username field
   - Password field
   - Login button with loading state
   - Error display
   - Link to /setup for new tenants

   **`src/components/forms/login-form.tsx`**
   - Form component with validation
   - Submit handler calling auth API

4. Implement route protection

   **`src/app/(dashboard)/layout.tsx`**
   - Check session on mount
   - Redirect to /login if not authenticated
   - Show loading skeleton during check

5. Root page redirect

   **`src/app/page.tsx`**
   - Check if session exists
   - Redirect to /dashboard or /login accordingly

### Deliverables

- Working login flow
- Session persistence via cookies
- Protected dashboard routes
- Logout functionality

---

## Step 4: Dashboard Layout

Create the main dashboard shell with navigation.

### Tasks

1. Create sidebar component

   **`src/components/layouts/sidebar.tsx`**
   - Logo/brand at top
   - Navigation links:
     - Dashboard (home icon)
     - Environments (layers icon)
     - Settings (gear icon)
   - Active state styling
   - Collapsible on mobile

2. Create header component

   **`src/components/layouts/header.tsx`**
   - Page title (dynamic)
   - User avatar and name
   - Dropdown menu with:
     - Profile link
     - Logout button

3. Implement dashboard layout

   **`src/app/(dashboard)/layout.tsx`**
   - Sidebar on left
   - Header at top
   - Main content area
   - Responsive behavior (sheet sidebar on mobile)

4. Add toast provider

   **`src/app/layout.tsx`**
   - Add Toaster component for notifications

### Deliverables

- Responsive dashboard shell
- Working navigation
- User menu with logout
- Toast notification system

---

## Step 5: Tenant Onboarding

Build the tenant creation flow for new users.

### Tasks

1. Create onboarding page

   **`src/app/setup/page.tsx`**
   - Multi-step wizard interface
   - Progress indicator

2. Create tenant creation form

   **`src/components/forms/tenant-form.tsx`**
   - Step 1: Tenant name
   - Step 2: Owner account details
     - Name (required)
     - Email (required)
     - Username (required)
     - Password (required, min 8 chars)
     - Phone (optional)
   - Step 3: Initial environment
     - Environment name (optional, defaults to "default")
   - Submit creates tenant via POST /tenants

3. Handle successful creation

   - Store tenantId in context
   - Auto-login (API returns session)
   - Redirect to /dashboard

4. Error handling

   - Display validation errors per field
   - Handle API errors (duplicate email, etc.)
   - Allow going back to fix errors

### Deliverables

- Working tenant creation wizard
- Automatic login after creation
- Smooth redirect to dashboard

---

## Step 6: Dashboard Home

Display tenant overview and quick actions.

### Tasks

1. Create dashboard home page

   **`src/app/(dashboard)/page.tsx`**
   - Fetch tenant details on load
   - Display tenant info card
   - Show environment count
   - Quick action buttons

2. Create tenant info card

   **`src/components/data-display/tenant-card.tsx`**
   - Tenant name (large)
   - Tenant ID (copyable)
   - Created date
   - Custom properties list (if any)

3. Create stats cards

   - Environment count
   - Total users across environments (future)

4. Quick actions section

   - "Create Environment" button
   - "View Settings" button

### Deliverables

- Tenant overview display
- Quick navigation to common tasks

---

## Step 7: Environment Management

Full CRUD for environments.

### Tasks

1. Create environments list page

   **`src/app/(dashboard)/environments/page.tsx`**
   - Fetch environments from tenant
   - Display as cards or table
   - "Create Environment" button
   - Empty state when no environments

   **`src/components/data-display/environment-list.tsx`**
   - Environment cards with:
     - Name
     - ID (copyable)
     - User count
     - Created date
     - Actions dropdown (view, edit, delete)

2. Create environment form

   **`src/app/(dashboard)/environments/new/page.tsx`**
   - Environment creation page

   **`src/components/forms/environment-form.tsx`**
   - Name field (required)
   - Custom properties (optional, key-value editor)
   - Submit/Cancel buttons

3. Environment detail page

   **`src/app/(dashboard)/environments/[envId]/page.tsx`**
   - Environment info display
   - Edit button (inline or modal)
   - Delete button with confirmation
   - Link to manage users
   - User count display

4. Edit environment

   - Reuse environment-form in edit mode
   - Pre-populate with existing values
   - PATCH to update

5. Delete environment

   - Confirmation dialog
   - Warning about deleting all users
   - DELETE and redirect to list

### Deliverables

- Environment listing
- Create/edit/delete functionality
- Navigation to user management

---

## Step 8: Environment Users

Manage users within each environment.

### Tasks

1. Create users list page

   **`src/app/(dashboard)/environments/[envId]/users/page.tsx`**
   - Fetch users for environment
   - Display in table format
   - "Create User" button
   - Empty state

   **`src/components/data-display/user-table.tsx`**
   - Columns: Name, Email, Username, Status, Actions
   - Status badge (active/disabled)
   - Actions: View, Disable/Enable, Delete

2. Create user form

   **`src/app/(dashboard)/environments/[envId]/users/new/page.tsx`**
   - User creation page

   **`src/components/forms/user-form.tsx`**
   - Name (required)
   - Email (required)
   - Username (required)
   - Password (required for create)
   - Phone (optional)
   - Avatar URL (optional)
   - Custom properties (optional)

3. User detail/edit

   - View user details
   - Edit non-sensitive fields (name, avatar)
   - Separate actions for email/username/phone updates

4. User status management

   - Disable user button (with confirmation)
   - Enable user button
   - Visual indicator of disabled state

5. Delete user

   - Confirmation dialog
   - DELETE and refresh list

### Deliverables

- User listing with table
- Create/edit users
- Enable/disable functionality
- Delete with confirmation

---

## Step 9: Settings Page

Tenant configuration and account management.

### Tasks

1. Create settings page

   **`src/app/(dashboard)/settings/page.tsx`**
   - Tabs or sections for different settings

2. Tenant settings section

   - Edit tenant name
   - View/edit custom properties
   - Danger zone: Delete tenant (future)

3. Account settings section

   - Current user info display
   - Edit profile (name, avatar)
   - Change password (future)

4. Custom properties editor

   **`src/components/forms/custom-properties-editor.tsx`**
   - Key-value pair editor
   - Add/remove properties
   - JSON value support

### Deliverables

- Tenant name editing
- Custom properties management
- User profile display

---

## Project Structure (Final)

```
sump-ui/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── environments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [envId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── users/
│   │   │   │           ├── page.tsx
│   │   │   │           └── new/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── setup/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── layouts/
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── tenant-form.tsx
│   │   │   ├── environment-form.tsx
│   │   │   ├── user-form.tsx
│   │   │   └── custom-properties-editor.tsx
│   │   └── data-display/
│   │       ├── tenant-card.tsx
│   │       ├── environment-list.tsx
│   │       └── user-table.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── tenants.ts
│   │   │   ├── environments.ts
│   │   │   ├── users.ts
│   │   │   └── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-tenant.ts
│   ├── contexts/
│   │   ├── auth-context.tsx
│   │   └── tenant-context.tsx
│   └── types/
│       ├── tenant.ts
│       ├── environment.ts
│       ├── account.ts
│       └── session.ts
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── components.json
└── package.json
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/tenants/:tenantId/login` | Login with email/username + password |
| POST | `/auth/tenants/:tenantId/logout` | Logout current session |
| GET | `/auth/tenants/:tenantId/session` | Get current session |

### Tenants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tenants` | Create tenant with owner + environment |
| GET | `/tenants/:tenantId` | Get tenant details |
| PATCH | `/tenants/:tenantId` | Update tenant |

### Environments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tenants/:tenantId/environments` | Create environment |
| GET | `/tenants/:tenantId/environments/:envId` | Get environment |
| PATCH | `/tenants/:tenantId/environments/:envId` | Update environment |
| DELETE | `/tenants/:tenantId/environments/:envId` | Delete environment |

### Environment Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/environments/:envId/accounts` | Create user |
| GET | `/environments/:envId/accounts/:accountId` | Get user |
| PATCH | `/environments/:envId/accounts/:accountId` | Update user |
| PATCH | `/environments/:envId/accounts/:accountId/disable` | Disable user |
| PATCH | `/environments/:envId/accounts/:accountId/enable` | Enable user |
| DELETE | `/environments/:envId/accounts/:accountId` | Delete user |

---

## Progress Tracker

- [x] Step 1: Project Setup
- [x] Step 2: TypeScript Types & API Client
- [x] Step 3: Authentication System
- [x] Step 4: Dashboard Layout
- [x] Step 5: Tenant Onboarding
- [x] Step 6: Dashboard Home
- [x] Step 7: Environment Management
- [x] Step 8: Environment Users
- [x] Step 9: Settings Page
- [ ] Step 10: Playwright E2E Testing
- [ ] Step 11: Jest Unit Tests

---

## Step 10: Playwright E2E Testing

### Setup
```bash
npm init playwright@latest
```

### Structure
```
e2e/
├── fixtures/
│   ├── auth.fixture.ts         # Authenticated page fixture
│   └── test-data.ts            # Test tenant/user data
├── pages/                      # Page Object Models
│   ├── login.page.ts
│   ├── setup.page.ts
│   ├── dashboard.page.ts
│   ├── environments.page.ts
│   └── settings.page.ts
├── tests/
│   ├── auth.spec.ts            # Login/logout tests
│   ├── onboarding.spec.ts      # Tenant creation wizard
│   ├── dashboard.spec.ts       # Dashboard functionality
│   ├── environments.spec.ts    # Environment CRUD
│   ├── users.spec.ts           # User management
│   └── settings.spec.ts        # Settings page
└── utils/
    ├── api-helpers.ts          # Direct API calls for setup/teardown
    └── test-utils.ts           # Common test utilities
```

### npm Scripts
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report"
}
```

### Test Suites
| Suite | Tests |
|-------|-------|
| auth.spec.ts | Login, logout, session persistence, redirects |
| onboarding.spec.ts | Tenant creation wizard, validation, auto-login |
| dashboard.spec.ts | Tenant info display, navigation, quick actions |
| environments.spec.ts | CRUD operations, delete confirmation |
| users.spec.ts | User creation, validation |
| settings.spec.ts | Tenant settings, session info |

---

## Step 11: Jest Unit Tests

### Setup
```bash
npm install -D jest @types/jest ts-jest
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jest-environment-jsdom
```

### Structure
```
src/__tests__/
├── lib/api/
│   ├── client.test.ts
│   ├── auth.test.ts
│   ├── tenants.test.ts
│   ├── environments.test.ts
│   └── users.test.ts
├── hooks/
│   ├── use-auth.test.tsx
│   └── use-tenant.test.tsx
├── components/forms/
│   ├── login-form.test.tsx
│   ├── tenant-setup-form.test.tsx
│   ├── environment-form.test.tsx
│   └── user-form.test.tsx
└── test-utils.tsx
```

### npm Scripts
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Coverage Goals
- API Client: 90%+
- Hooks: 80%+
- Form Components: 70%+
- Overall: 60%+ minimum

---

## Known Limitations

1. **No user list endpoint**: The SUMP API doesn't expose a GET /environments/:envId/accounts endpoint to list all users. Users can be created but need to be looked up by ID/email/username individually.

2. **Admin user creation with password**: The current user creation form includes password, but the API endpoint `POST /environments/:envId/accounts` doesn't accept password (per OpenAPI spec). Options:
   - API change: Add password support to CreateEnvironmentAccountDto
   - UI change: Remove password from form, implement invite/password-reset flow
   - Use signup endpoint for self-registration instead

## TODO - Fixes Needed

- [ ] **Environment edit page missing**: Need to create `/environments/[envId]/edit` page for editing environment details
- [ ] **Setup page accessible after tenant creation**: Should redirect authenticated users away from `/setup` page
- [ ] **Phone field in tenant setup**: Phone should not be sent when empty (currently sends empty string or undefined)

## Future Enhancements

- Add pagination when API supports it
- Add user search/lookup form
- Add custom properties editor (key-value form)
- Add account profile editing
- Add dark mode toggle
- Add environment edit page
- CI integration for automated testing
- **Unified deployment**: Package sump-ui with sump server for single-binary deployment (serve UI as static files from sump backend, or use Nx/Turborepo monorepo structure)
