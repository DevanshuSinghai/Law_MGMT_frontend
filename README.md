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
