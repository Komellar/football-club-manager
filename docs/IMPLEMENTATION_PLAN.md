# 🚀 Football Club Manager - Implementation Plan

## Phase 1: Foundation & Setup (Weeks 1-2)

### 1.1 Database Setup

- [ ] Setup TypeORM with PostgreSQL
- [ ] Create database entities (users, roles, players, contracts, transfers, expenses, revenues)
- [ ] Setup TypeORM migrations and seeding
- [ ] Add database connection to NestJS with ConfigModule
- [ ] Configure environment variables for DB connection

### 1.2 Backend Authentication

- [ ] Setup JWT authentication module with @nestjs/jwt
- [ ] Create User and Role entities with TypeORM decorators
- [ ] Implement AuthService with bcrypt password hashing
- [ ] Create login/register endpoints with DTOs
- [ ] Add role-based guards (JwtAuthGuard, RolesGuard)
- [ ] Implement JWT strategy for token validation

### 1.3 Frontend Foundation

- [ ] Setup Tailwind CSS configuration
- [ ] Install and configure shadcn/ui components
- [ ] Create basic layout structure with App Router
- [ ] Setup API client in lib/api.ts with JWT interceptor
- [ ] Create authentication context and hooks
- [ ] Implement httpOnly cookie authentication

## Phase 2: Core Player Management (Weeks 3-4)

### 2.1 Player Module (Backend)

- [ ] Create Player entity with TypeORM decorators (@Entity, @Column, @OneToMany)
- [ ] Create PlayerService with @InjectRepository pattern
- [ ] Implement CRUD endpoints using NestJS generators
- [ ] Add Zod DTOs for validation (CreatePlayerDto, UpdatePlayerDto)
- [ ] Add player search and filtering with query builders
- [ ] Implement pagination for player lists

### 2.2 Contract Module (Backend)

- [ ] Create Contract entity with Player relations (@ManyToOne)
- [ ] Implement contract CRUD operations with repository pattern
- [ ] Add contract validation (dates, salary) using class-validator
- [ ] Create contract expiry tracking queries
- [ ] Add database indexes for frequently queried fields

### 2.3 Player Management UI (Frontend)

- [ ] Create player list page with shadcn/ui Table component
- [ ] Build player form using React Hook Form from ShadCN + Zod resolver
- [ ] Add player detail view with server components
- [ ] Implement contract management UI with forms
- [ ] Add search and filtering with URL state management

## Phase 3: Financial Tracking (Weeks 5-6)

### 3.1 Transfer Module (Backend)

- [ ] Create Transfer entity with TypeORM relations
- [ ] Implement TransferService with repository pattern
- [ ] Add transfer recording endpoints with proper DTOs
- [ ] Implement transfer fee and agent fee tracking
- [ ] Create transfer history queries with pagination
- [ ] Add transaction support for complex transfer operations

### 3.2 Financial Modules (Backend)

- [ ] Create Expenses entity with categorization
- [ ] Create Revenues entity with type classification
- [ ] Implement categorized expense/revenue tracking
- [ ] Add date-based filtering and aggregation queries
- [ ] Create financial reporting services
- [ ] Add database indexes for performance

### 3.3 Financial UI (Frontend)

- [ ] Create transfer management pages with forms
- [ ] Build expense tracking interface using shadcn components
- [ ] Create revenue management interface with validation
- [ ] Add financial forms with Zod schemas
- [ ] Implement data tables with sorting and filtering

## Phase 4: Dashboard & Reporting (Weeks 7-8)

### 4.1 Reports Module (Backend)

- [ ] Create ReportsService with complex aggregation queries
- [ ] Implement financial overview with TypeORM query builder
- [ ] Add player cost analysis with relations
- [ ] Create monthly/quarterly aggregations
- [ ] Implement budget vs actual comparisons
- [ ] Add caching for expensive report queries

### 4.2 Dashboard (Frontend)

- [ ] Install Recharts for data visualization
- [ ] Create financial KPI cards with shadcn components
- [ ] Build revenue vs expenses charts with real-time data
- [ ] Add player cost breakdown charts
- [ ] Create monthly financial trends dashboard
- [ ] Implement responsive layout with Tailwind

### 4.3 Reports Interface (Frontend)

- [ ] Create reports page with server components
- [ ] Add date range selectors with form validation
- [ ] Implement export functionality (PDF/Excel)
- [ ] Add filtering and sorting with URL state
- [ ] Create print-friendly report layouts

## Phase 5: Advanced Features (Weeks 9-10)

### 5.1 Advanced Backend Features

- [ ] Add contract expiry notifications with scheduled jobs
- [ ] Implement budget forecasting algorithms
- [ ] Create comprehensive data validation and constraints
- [ ] Add audit logging with interceptors
- [ ] Implement global exception filters
- [ ] Add API documentation with Swagger

### 5.2 Enhanced UI/UX

- [ ] Add loading states with Suspense boundaries
- [ ] Implement toast notifications with shadcn
- [ ] Add data export features (CSV, PDF, Excel)
- [ ] Create responsive mobile layout
- [ ] Implement dark/light theme support
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

### 5.3 Testing & Polish

- [ ] Add unit tests for services with mocked repositories
- [ ] Add integration tests for API endpoints
- [ ] Add E2E tests with Playwright for critical flows
- [ ] Performance optimization and bundle analysis
- [ ] Add monitoring and logging
- [ ] Security audit and vulnerability scanning

## Technical Stack (Updated per Copilot Instructions)

### Database

- **PostgreSQL** with **TypeORM**
- **Reason**: ACID compliance, excellent TypeScript integration, decorator-based entities

### Backend

- **NestJS** with TypeScript
- **TypeORM** for database operations with repository pattern
- **JWT** for authentication with httpOnly cookies
- **Zod** for DTO validation (preferred over class-validator)
- **bcrypt** for password hashing
- **@nestjs/config** for environment management

### Frontend

- **Next.js 15** with App Router
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Recharts** for data visualization
- **React Hook Form** with Zod resolver
- **React Query** for state management

## File Structure (Updated per Copilot Instructions)

```
apps/
├── backend/                # NestJS app (TypeORM, Postgres, Zod validation)
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication (login, register, JWT)
│   │   │   ├── users/      # User management
│   │   │   ├── players/    # Player CRUD and search
│   │   │   ├── contracts/  # Contract management
│   │   │   ├── transfers/  # Transfer tracking
│   │   │   ├── expenses/   # Expense management
│   │   │   ├── revenues/   # Revenue tracking
│   │   │   └── reports/    # Financial reports
│   │   ├── common/         # Shared DTOs, interfaces, utils, guards
│   │   │   ├── guards/     # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/ # Logging, response transformation
│   │   │   ├── filters/    # Global exception filters
│   │   │   └── decorators/ # Custom decorators
│   │   ├── database/       # TypeORM configuration and entities
│   │   ├── main.ts
│   │   └── app.module.ts
│   └── test/              # Backend tests (unit, integration, e2e)
└── web/                   # Next.js app (TS, Tailwind, ShadCN, Zod)
    ├── app/               # App Router pages + layouts
    │   ├── (auth)/        # Authentication pages
    │   ├── (dashboard)/   # Protected dashboard routes
    │   │   ├── players/   # Player management
    │   │   ├── contracts/ # Contract management
    │   │   ├── transfers/ # Transfer tracking
    │   │   ├── expenses/  # Expense management
    │   │   ├── revenues/  # Revenue tracking
    │   │   └── reports/   # Financial reports
    │   └── api/           # API routes (if needed)
    ├── components/        # UI components (shadcn + custom)
    │   ├── ui/           # shadcn base components
    │   ├── forms/        # Form components with Zod validation
    │   └── layout/       # Layout components (navbar, sidebar)
    ├── hooks/            # React hooks for API and logic
    ├── lib/              # Utilities and API client
    │   ├── api.ts        # Centralized API client with JWT
    │   ├── auth.ts       # Authentication utilities
    │   └── validations.ts # Zod schemas
    └── types/            # TypeScript types/interfaces
```

### Key Architecture Principles

- **Backend**: Feature modules with repository pattern, Zod validation, JWT auth
- **Frontend**: Server components preferred, client components for interactivity only
- **Shared Types**: Common interfaces between backend and frontend
- **Authentication**: JWT in httpOnly cookies, never localStorage
- **Database**: TypeORM entities with proper relations and indexes
- **Testing**: Unit tests for services, E2E tests for critical flows

## Success Metrics

- [ ] Complete JWT authentication flow with role-based access
- [ ] Full CRUD operations for all entities with TypeORM
- [ ] Real-time financial dashboard with Recharts
- [ ] Mobile-responsive interface with Tailwind
- [ ] 95%+ test coverage for business logic
- [ ] Sub-2s page load times with Next.js optimization
- [ ] Proper error handling and user feedback
- [ ] Accessibility compliance (WCAG 2.1)

This plan follows the copilot instructions exactly, prioritizing TypeORM over Prisma, Zod validation, and proper NestJS/Next.js patterns.
