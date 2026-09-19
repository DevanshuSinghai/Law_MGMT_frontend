# Legal Case Management System - Frontend

React frontend built with Vite, Ant Design, React Query, and Zustand.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Ant Design** - UI component library
- **React Router** - Client-side routing
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Axios** - HTTP client
- **Day.js** - Date manipulation

## Project Structure

```
src/
├── api/              # API client and endpoints
│   ├── client.js     # Axios instance with JWT interceptors
│   ├── auth.js       # Authentication endpoints
│   ├── cases.js      # Cases CRUD
│   ├── clients.js    # Clients CRUD
│   ├── documents.js  # Documents upload/download
│   ├── tasks.js      # Tasks CRUD
│   ├── dashboard.js  # Dashboard stats
│   └── firms.js      # Firm management
├── stores/           # Zustand stores
│   ├── authStore.js  # Auth state with persistence
│   └── uiStore.js    # UI state (sidebar, loading)
├── hooks/            # React Query hooks
│   ├── useCases.js
│   ├── useClients.js
│   ├── useDocuments.js
│   ├── useTasks.js
│   └── useDashboard.js
├── components/       # Reusable components
│   └── layout/       # Layout components
├── pages/            # Page components
│   ├── auth/         # Login, Register
│   ├── cases/        # Cases list, detail, form
│   ├── clients/      # Clients list, form
│   ├── documents/    # Documents list, upload
│   ├── tasks/        # Tasks list, modal
│   ├── team/         # Team management
│   ├── DashboardPage.jsx
│   └── SettingsPage.jsx
├── App.jsx           # App with providers
├── routes.jsx        # Route configuration
└── main.jsx          # Entry point
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Features

- **Authentication** - JWT with auto-refresh, firm registration
- **Dashboard** - Stats, deadlines, activity feed
- **Cases** - Full CRUD, assignments, notes
- **Clients** - CRUD with contact info
- **Documents** - Upload, download, versioning
- **Tasks** - CRUD, completion, filtering
- **Team** - Role and status management
- **Settings** - Profile and password

## State Management

- **Zustand** - Auth persistence, UI state
- **React Query** - Data caching, optimistic updates

## Production

**Domain:** `lawyerflow.in`, served from the root path (`vite.config.js`
`base: '/'`, `BrowserRouter` in `src/App.jsx` with no `basename`). The old
`legalpapers.in/law-mgmt` subpath deployment is retired, no redirect.

**Architecture:** Static build served by Nginx from the same vhost as the
backend API — `/etc/nginx/sites-available/lawyerflow.in.conf` on the VPS
(`147.93.96.72`).

**Deploy:** GitHub Actions, `appleboy/scp-action`. VPS login user is
`lf-server` (not `rahul`). Two separate keys, not shared:
- `VPS_SSH_KEY` (Actions secret) — logs into the VPS as `lf-server`.
- `~/.ssh/deploy_lawmgmt` on the server — a read-only GitHub deploy key this
  repo uses for `git pull` during deploy.

**Gotcha — the one that bit us:** `vite.config.js`'s `base` and the
`<BrowserRouter basename>` prop in `src/App.jsx` are two *separate* hardcoded
values. Changing one without the other renders a blank page with a console
warning (`Router basename="..."  is not able to match the URL`). If the
deploy path or domain changes again, update both together, and update the
backend's `FORCE_SCRIPT_NAME` / `MEDIA_URL` / `STATIC_URL` /
`CORS_ALLOWED_ORIGINS` in lockstep too (see backend README).
