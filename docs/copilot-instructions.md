# 🤖 Copilot Instructions

These are the **best practices and conventions** for this monorepo project using **Turborepo + Next.js + NestJS + Postgres + TypeORM + Zod + ShadCN + Tailwind**.
Always follow these rules when generating code.

---

## 📂 Project Structure

```
football-club-manager/
│
├─ apps/
│   ├─ frontend/       # Next.js app (TS, Tailwind, ShadCN, Zod)
│   └─ backend/        # NestJS app (TypeORM, Postgres, Zod validation)
│
├─ packages/
│   ├─ types/          # Shared TypeScript types
│   └─ utils/          # Shared utilities (validation, helpers, API clients)
│
├─ docs/               # Documentation (plans, architecture, db schema)
│   └─ copilot-instructions.md
│
├─ turbo.json          # Turborepo config
├─ package.json        # Root config
└─ tsconfig.json       # Shared TS settings
```

---

## 🛠️ Backend (NestJS + Postgres + TypeORM)

- Use **TypeORM entities** with decorators.
- Each module has: `controller`, `service`, `entity`, `dto`, `module`.
- Use **DTOs validated with Zod** (or `class-validator` if required, but Zod preferred for consistency).
- Use **repository pattern** for DB operations (`@InjectRepository`).
- Services contain business logic → controllers should stay thin.
- Always use **async/await**, no `.then()` chaining.
- Errors should throw **NestJS HttpException** with proper status codes.
- Always try to use **NestJS generators (`nest g module|service|controller`)** when creating code.
- Use **ConfigModule** to manage environment variables (`.env`) – never hardcode secrets.
- All DB connection settings (host, user, password, db name) must come from environment variables.
- Use **migrations** (`typeorm migration:generate`) for schema changes instead of `synchronize: true`.
- Create **custom repositories** only when business-specific queries are needed.
- Always handle **relations** (`@OneToMany`, `@ManyToOne`) explicitly; don’t use `eager: true` unless necessary.
- Write **unit tests** for services (mock repositories) and **e2e tests** for controllers.
- Use **logging middleware** (`Logger` or custom interceptors) for API requests and errors.
- Structure exceptions with **global filters** (e.g., `AllExceptionsFilter`) for consistent error responses.
- Implement **pagination and filtering** for list endpoints – don’t return all rows by default.
- Use **guards** for authentication & authorization (`JwtAuthGuard`, `RolesGuard`).
- Use **interceptors** for transformations (e.g., response shaping, caching).
- Validate all incoming data with **pipes** (`ValidationPipe`) + Zod schemas.
- Follow REST best practices:
  - `GET /players/:id` → fetch one
  - `GET /players?teamId=1` → query with filters
  - `POST /players` → create
  - `PUT /players/:id` → full update
  - `PATCH /players/:id` → partial update
  - `DELETE /players/:id` → delete
- Use **DTOs for responses** as well, not only for requests (avoid leaking entities directly).
- Prefer **transactional queries** when multiple DB updates must succeed together.
- Add **database indexes** for frequently queried fields (`email`, `player_id`, `match_date`).
- Use **enum or union types** for restricted fields (`PlayerPosition`, `ContractStatus`).
- Cache expensive queries with **NestJS CacheModule** or Redis if needed.
- Document endpoints with **Swagger** (`@nestjs/swagger`) – keep DTOs annotated.
- Use **absolute imports** (`@/modules/players/player.service`) via `tsconfig.json` paths.
- Implement **error handling** with `@nestjs/common` exceptions.

---

## 🎨 Frontend (Next.js + Tailwind + ShadCN + Zod)

- Use **App Router** (`app/` directory) → prefer `server components` for data fetching.
- Keep components in `components/` → **dumb UI only**, no business logic.
- Use **hooks (`hooks/`)** for data fetching and logic separation.
- Use **server actions** or API calls via `lib/api.ts`.
- Validate all forms with **Zod schemas**.
- UI should be built using **ShadCN components**, styled with **Tailwind**.
- State management: prefer **React Query** over global state unless necessary.
- Use **TypeScript everywhere** → all props, hooks, and API responses must be typed.
- Split UI into **atoms → molecules → organisms → pages** (component hierarchy).
- Co-locate styles and tests with components (`Button.tsx`, `Button.test.tsx`).
- Keep **layouts** (`app/(dashboard)/layout.tsx`) for consistent wrappers (navbar, sidebar, auth).
- Implement **loading.tsx** and **error.tsx** in route segments for better UX.
- Use **Suspense** with `React.lazy` where possible for code-splitting.
- For forms, prefer **React Hook Form from ShadCN + Zod resolver**.
- Abstract **API client** in `lib/api.ts` → never call `fetch` directly in components.
- Handle authentication with a **custom JWT strategy**:
  - Implement login/register endpoints in the backend (`auth.controller.ts`, `auth.service.ts`).
  - Issue JWT tokens on successful login, signed with a secret from environment variables.
  - Store JWT in **httpOnly cookies** for frontend authentication.
  - Protect API routes using NestJS **JwtAuthGuard**.
  - On frontend, read auth state from cookies and send JWT in requests as needed.
  - Use Zod to validate all auth-related forms and payloads.
  - Never expose JWT or secrets in client-side code.
- Store auth tokens in **httpOnly cookies**, not `localStorage`.
- Use **absolute imports** (`@/components/Button`) via `tsconfig.json`.
- Create **theme configuration** (`tailwind.config.ts`) with consistent spacing, colors, and typography.
- Favor **server components** for static data → move to **client components** only if interactivity is needed.
- Always sanitize user input (XSS prevention) → especially if rendering HTML (e.g., match reports).
- Use **SEO metadata API** (`generateMetadata`) in each page.
- Accessibility: all interactive components must have `aria-*` attributes.
- Optimize images with **`next/image`**.
- Use **dynamic imports** for heavy/optional components (`import('chart.js')`).
- Prefer **shadcn/ui forms** and dialogs over custom implementations.
- Apply **error boundaries** where user actions can fail (e.g., payment, transfer form).
- Use **ESLint + Prettier** → no unused imports, no `any` types.
- Add **Playwright** for e2e tests (important for complex forms/flows).

---

## 📦 Shared Packages

- `packages/types/`: All shared interfaces (`Player`, `Contract`, etc).
- `packages/utils/`: Shared Zod schemas, formatting helpers, constants.

> Always import types from `packages/types`, not by redefining them in apps.

---

## ✅ Best Practices

1. **Type Safety**
   - Always define **types in `packages/types`** and reuse across backend + frontend.
   - Use **Zod** to validate both API inputs and frontend forms.

2. **Code Style**
   - Use **ESLint + Prettier** (configured at root).
   - Write **async/await** consistently.
   - No `any` types – always be explicit.

3. **Monorepo Rules**
   - Keep **apps isolated** (frontend doesn’t import backend directly).
   - Share only via `packages/`.
   - Run `turbo run build` to ensure all apps/packages build together.

4. **API Layer**
   - Backend endpoints should return **DTOs** that match shared types.
   - Frontend API client should use those shared types (`Player`, `Contract`, etc).

5. **Database (Postgres + TypeORM)**
   - Use migrations (`typeorm migration:generate`) for schema changes.
   - Add indexes for frequently queried columns (`player_id`, `date`, `email`).
   - Use `snake_case` for DB columns, `camelCase` for TS properties.

6. **Error Handling**
   - Backend: throw `HttpException` with proper status codes.
   - Frontend: show ShadCN `Toast` or AlertDialog on error.

7. **Testing**
   - Backend: use Jest for unit/integration tests.
   - Frontend: use React Testing Library for components.
   - Write tests for critical business logic (e.g., contract cost calculations).

---

## 🚀 Development Workflow

- Start backend:

  ```bash
  pnpm turbo run dev --filter=backend
  ```

- Start frontend:

  ```bash
  pnpm turbo run dev --filter=frontend
  ```

- Run all tests:

  ```bash
  pnpm turbo run test
  ```
