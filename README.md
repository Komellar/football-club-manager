# Football Club Manager

A comprehensive football club management system built with modern web technologies. This monorepo contains a NestJS backend API with full OpenAPI documentation and a Next.js frontend.

## Features

- **Player Management**: Create, update, and manage player profiles with detailed information
- **Contract Management**: Handle player contracts, transfers, and financial records
- **Statistics Tracking**: Record and analyze player and team performance data
- **User Authentication**: JWT-based authentication system
- **Full API Documentation**: Interactive Swagger/OpenAPI documentation
- **Type Safety**: End-to-end TypeScript with shared validation schemas

### Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy environment templates
   cp apps/backend/.env.example apps/backend/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Start the database:**

   ```bash
   pnpm db:up
   ```

4. **Run database migrations:**

   ```bash
   cd apps/backend
   pnpm typeorm:migration:run
   ```

5. **Start development servers:**

   ```bash
   # Start all services
   pnpm turbo run dev

   # Or start individual services
   pnpm turbo run dev --filter=backend  # API server on http://localhost:3001
   pnpm turbo run dev --filter=web      # Frontend on http://localhost:3000
   ```

6. **Access the applications:**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:4000/api/docs
   - API Base URL: http://localhost:4000

## Technology Stack

### Backend

- **NestJS**: Node.js framework with TypeScript support
- **PostgreSQL**: Relational database
- **TypeORM**: Object-relational mapping with migrations
- **Zod**: Schema validation and type inference
- **Swagger/OpenAPI**: Auto-generated API documentation
- **JWT**: JSON Web Token authentication

### Frontend

- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: Modern React component library
- **React Hook Form**: Form validation with Zod integration

### Shared

- **TypeScript**: End-to-end type safety
- **Turborepo**: Monorepo build system
- **ESLint + Prettier**: Code linting and formatting
- **Zod Schemas**: Shared validation between frontend and backend

## Project Structure

```
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules (players, contracts, etc.)
│   │   │   ├── shared/   # Shared utilities and decorators
│   │   │   └── main.ts   # Application entry point with Swagger setup
│   │   └── uploads/      # File upload storage
│   └── web/              # Next.js frontend
│       ├── app/          # App Router pages
│       ├── components/   # Reusable UI components
│       └── lib/          # Frontend utilities
├── packages/
│   ├── core/             # Shared types, schemas, and utilities
│   │   ├── src/
│   │   │   ├── constants/    # FIFA confederations, nationality codes
│   │   │   ├── enums/        # Player positions, contract status
│   │   │   ├── schemas/      # Zod validation schemas
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   └── utils/        # Shared utility functions
│   ├── eslint-config/    # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
└── docs/                 # Project documentation
```
