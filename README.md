# sump-ui

[![CI](https://github.com/thassiov/sump-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/thassiov/sump-ui/actions/workflows/ci.yml)

Admin dashboard for [sump](https://github.com/thassiov/sump) - Simple User Management Platform.

> [!CAUTION]
> This is still *very* WIP

## Overview

sump-ui provides a web-based admin interface for managing your sump server remotely. It gives tenant administrators a visual way to manage their tenants, environments, and users without direct API calls.

## Features

### Tenant Onboarding
- Multi-step wizard to create a new tenant
- Sets up owner account and initial environment in one flow
- Automatic login after tenant creation

### Authentication
- Secure login with email/username + password
- Session management via HTTP-only cookies
- Protected dashboard routes with automatic redirects

### Dashboard
- Tenant overview with key information
- Quick actions for common tasks
- Copy tenant ID with one click

### Environment Management
- List all environments in your tenant
- Create new environments
- View environment details and ID
- Delete environments with confirmation dialog

### User Management
- Create users within any environment
- Set user credentials (name, email, username, password)
- Optional fields for phone and avatar URL
- Form validation for required fields

### Settings
- View and edit tenant name
- View tenant metadata and custom properties
- Session information display (account type, expiration)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Native fetch with credentials for cookie auth
- **Testing**: Playwright E2E

## Requirements

- Node.js >= 20
- A running [sump](https://github.com/thassiov/sump) server

## Installation

```sh
git clone https://github.com/thassiov/sump-ui.git
cd sump-ui
npm install
```

## Configuration

Create a `.env.local` file:

```sh
# URL of your sump API server
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Running

```sh
# Development server (default: http://localhost:3000)
npm run dev

# Production build
npm run build
npm start
```

## Testing

```sh
# Run E2E tests (requires sump server running)
npm run test:e2e

# Run with Playwright UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── dashboard/         # Home/overview
│   │   ├── environments/      # Environment CRUD
│   │   │   └── [envId]/users/ # User management
│   │   └── settings/          # Tenant & account settings
│   └── setup/                 # Tenant onboarding wizard
├── components/
│   ├── ui/                    # shadcn components
│   ├── forms/                 # Form components
│   └── layouts/               # Sidebar, header
├── contexts/                  # Auth & tenant context
├── hooks/                     # useAuth, useTenant
├── lib/api/                   # API client modules
└── types/                     # TypeScript definitions
```

## Related Projects

- [sump](https://github.com/thassiov/sump) - The backend API server this UI connects to

## License

[MIT](./LICENSE)
