# Việt Hoàng Productivity App

## Overview

A personal productivity and health tracking application built for a user named "Việt Hoàng". The app provides three core features: study notes management, health goal tracking with daily logs, and daily activity scheduling. The interface is in Vietnamese and features a modern, animated UI with a vibrant color palette.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state with custom hooks per feature domain
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Design Pattern**: Feature-based organization with dedicated hooks (`use-study-notes.ts`, `use-health.ts`, `use-daily-activities.ts`)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth (OpenID Connect) with session-based authentication using `connect-pg-simple` for session storage
- **Code Organization**: Storage pattern (`server/storage.ts`) abstracts all database operations behind an interface

### Data Storage
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` - shared between client and server for type safety
- **Tables**:
  - `sessions` - Auth session storage (required for Replit Auth)
  - `users` - User profiles from Replit Auth
  - `study_notes` - Study notes with subject, title, content, importance
  - `health_goals` - Health tracking goals with frequency
  - `health_logs` - Daily completion logs for health goals
  - `daily_activities` - Time-based daily task checklist

### Authentication Flow
- Replit Auth integration via OpenID Connect
- Sessions stored in PostgreSQL `sessions` table
- Protected routes use `isAuthenticated` middleware
- User data extracted from JWT claims (`req.user.claims.sub`)

### Build System
- Development: `tsx` for TypeScript execution with Vite dev server
- Production: Custom build script using esbuild for server bundling, Vite for client
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned with `DATABASE_URL` environment variable
- **Replit Auth**: Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `date-fns`: Date formatting with Vietnamese locale support
- `zod`: Runtime type validation
- `passport` / `openid-client`: Authentication
- `connect-pg-simple`: PostgreSQL session store
- shadcn/ui components via Radix UI primitives