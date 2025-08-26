# 🚀 Football Club Manager - Implementation Plan

## 📋 CURRENT STATUS

### ✅ COMPLETED (Phases 1.1 & 1.2)

- **Database Setup**: TypeORM + PostgreSQL fully configured
- **Authentication Backend**: JWT, bcrypt, guards, all working
- **Frontend Auth**: Zustand store, login/register pages, httpOnly cookies
- **Basic Layout**: Next.js App Router, Tailwind, ShadCN components installed

### 🔄 IN PROGRESS (Phase 1.3)

- **Frontend Foundation**: Layout components, navigation, auth state management
- **Next Priority**: Complete remaining auth UI polish and start player module

---

## Phase 1: Foundation & Setup (Weeks 1-2)

### 1.1 Database Setup ✅ COMPLETED

- [x] Setup TypeORM with PostgreSQL
- [x] Create database entities (users, roles, players, contracts, transfers, expenses, revenues)
- [x] Setup TypeORM migrations and seeding
- [x] Add database connection to NestJS with ConfigModule
- [x] Configure environment variables for DB connection

### 1.2 Backend Authentication ✅ COMPLETED

- [x] Setup JWT authentication module with @nestjs/jwt
- [x] Create User and Role entities with TypeORM decorators
- [x] Implement AuthService with bcrypt password hashing
- [x] Create login/register endpoints with DTOs
- [x] Add role-based guards (JwtAuthGuard, RolesGuard)
- [x] Implement JWT strategy for token validation

### 1.3 Frontend Foundation (Current Phase - Break into smaller tasks)

#### 1.3.1 Basic Setup & Styling ✅ COMPLETED

- [x] Setup Tailwind CSS configuration
- [x] Install and configure shadcn/ui components
- [x] Create basic layout structure with App Router
- [x] **COMPLETED**: Test and verify all shadcn components are working correctly

#### 1.3.2 API Integration & Auth State

- [] Setup API client in lib/api.ts with JWT interceptor
- [] Create authentication context and hooks (migrated to Zustand)
- [] Implement httpOnly cookie authentication
- [ ] **NEXT TASK**: Create auth-protected route wrapper component
- [ ] **NEXT TASK**: Add loading states for authentication checks
- [ ] **NEXT TASK**: Implement logout functionality across all pages

#### 1.3.3 Navigation & Layout Polish

- [ ] **NEXT TASK**: Create responsive navigation menu for mobile
- [ ] **NEXT TASK**: Add user profile dropdown in navigation
- [ ] **NEXT TASK**: Implement breadcrumb navigation for dashboard pages
- [ ] **NEXT TASK**: Add footer component with proper links

## Phase 2: Core Player Management (Weeks 3-4)

### 2.1 Player Module (Backend) - Break into smaller tasks

#### 2.1.1 Player Entity & Basic CRUD

- [ ] **NEXT TASK**: Create Player entity with TypeORM decorators (@Entity, @Column, @OneToMany)
- [ ] **NEXT TASK**: Create PlayerService with @InjectRepository pattern
- [ ] **NEXT TASK**: Implement basic CRUD endpoints using NestJS generators (GET, POST, PUT, DELETE)
- [ ] **NEXT TASK**: Add Zod DTOs for validation (CreatePlayerDto, UpdatePlayerDto)

#### 2.1.2 Advanced Player Features

- [ ] Add player search and filtering with query builders
- [ ] Implement pagination for player lists
- [ ] Add player image upload functionality
- [ ] Create player statistics tracking

#### 2.1.3 Player Data Validation & Business Logic

- [ ] Add player position validation (goalkeeper, defender, midfielder, forward)
- [ ] Implement age calculation and validation
- [ ] Add nationality and registration validation
- [ ] Create player transfer history tracking

### 2.2 Contract Module (Backend) - Break into smaller tasks

#### 2.2.1 Contract Entity & Relations

- [ ] **NEXT TASK**: Create Contract entity with Player relations (@ManyToOne)
- [ ] **NEXT TASK**: Implement contract CRUD operations with repository pattern
- [ ] **NEXT TASK**: Add contract validation (dates, salary) using class-validator

#### 2.2.2 Contract Business Logic

- [ ] Create contract expiry tracking queries
- [ ] Add database indexes for frequently queried fields
- [ ] Implement contract renewal workflows
- [ ] Add contract value calculations (bonuses, clauses)

### 2.3 Player Management UI (Frontend) - Break into smaller tasks

#### 2.3.1 Player List & Basic UI

- [ ] **NEXT TASK**: Create player list page with shadcn/ui Table component
- [ ] **NEXT TASK**: Build player form using React Hook Form from ShadCN + Zod resolver
- [ ] **NEXT TASK**: Add player detail view with server components

#### 2.3.2 Advanced Player UI Features

- [ ] Implement contract management UI with forms
- [ ] Add search and filtering with URL state management
- [ ] Create player profile pages with statistics
- [ ] Add player image upload interface

## Phase 3: Financial Tracking (Weeks 5-6)

### 3.1 Transfer Module (Backend) - Break into smaller tasks

#### 3.1.1 Transfer Entity & Basic Operations

- [ ] Create Transfer entity with TypeORM relations
- [ ] Implement TransferService with repository pattern
- [ ] Add transfer recording endpoints with proper DTOs

#### 3.1.2 Advanced Transfer Features

- [ ] Implement transfer fee and agent fee tracking
- [ ] Create transfer history queries with pagination
- [ ] Add transaction support for complex transfer operations
- [ ] Add transfer approval workflows

### 3.2 Financial Modules (Backend) - Break into smaller tasks

#### 3.2.1 Expenses Module

- [ ] Create Expenses entity with categorization
- [ ] Implement expense CRUD operations
- [ ] Add expense category management
- [ ] Create expense approval workflows

#### 3.2.2 Revenues Module

- [ ] Create Revenues entity with type classification
- [ ] Implement categorized revenue tracking
- [ ] Add revenue source management
- [ ] Create revenue forecasting

#### 3.2.3 Financial Reporting Backend

- [ ] Add date-based filtering and aggregation queries
- [ ] Create financial reporting services
- [ ] Add database indexes for performance
- [ ] Implement budget vs actual calculations

### 3.3 Financial UI (Frontend) - Break into smaller tasks

#### 3.3.1 Transfer Management UI

- [ ] Create transfer management pages with forms
- [ ] Add transfer history visualization
- [ ] Implement transfer approval interface

#### 3.3.2 Expense & Revenue UI

- [ ] Build expense tracking interface using shadcn components
- [ ] Create revenue management interface with validation
- [ ] Add financial forms with Zod schemas
- [ ] Implement data tables with sorting and filtering

## 🎯 IMMEDIATE NEXT STEPS (Priority Order)

### Week 3 Sprint Tasks (Choose 2-3 per day)

#### Frontend Polish (Finish Phase 1.3)

1. **Test shadcn components** - Verify all installed components work correctly
2. **Create auth-protected route wrapper** - HOC or component for protected pages
3. **Add loading states for auth** - Show loading spinners during auth checks
4. **Implement logout functionality** - Add logout to all pages with navigation

#### Start Backend Player Module (Phase 2.1.1)

5. **Create Player entity** - TypeORM entity with proper decorators
6. **Create PlayerService** - Service with repository injection
7. **Add basic CRUD endpoints** - GET, POST, PUT, DELETE for players
8. **Create Player DTOs** - Zod schemas for validation

#### Basic Player UI (Phase 2.3.1)

9. **Create player list page** - Table with shadcn components
10. **Build player form** - React Hook Form + Zod validation
11. **Add player detail view** - Individual player page

### Week 4 Sprint Tasks

#### Contract Module (Phase 2.2.1)

12. **Create Contract entity** - With Player relations
13. **Contract CRUD operations** - Service and endpoints
14. **Contract validation** - Date and salary validation

#### Advanced Player Features

15. **Player search/filtering** - Query builders and UI
16. **Player pagination** - Backend and frontend
17. **Contract management UI** - Forms and interfaces

---

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
