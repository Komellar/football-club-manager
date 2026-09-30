> ⚠️ **Note:** This project is actively being developed. Some features and documentation may change as work continues. If something is missing or incomplete, it's because I'm still working on it!

---

# Football Club Manager

A comprehensive football club management system built with modern web technologies. This monorepo contains a NestJS backend API with full OpenAPI documentation and a Next.js frontend.

## Features

- **Player Management**: Create, update, and manage player profiles with detailed information
- **Contract Management**: Handle player contracts, transfers, and financial records
- **Statistics Tracking**: Record and analyze player and team performance data
- **User Authentication**: JWT-based authentication system
- **Full API Documentation**: Interactive Swagger/OpenAPI documentation
- **Type Safety**: End-to-end TypeScript with shared validation schemas

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **Docker & Docker Compose** (for PostgreSQL database)

### Setup Instructions

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   Create `.env` files from the provided examples. Use the command for your OS:

   **Windows:**

   ```powershell
   copy apps\backend\.env.example apps\backend\.env
   copy apps\web\.env.example apps\web\.env
   ```

   **Mac/Linux:**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Build the project**

   ```bash
   pnpm build
   ```

4. **Start the PostgreSQL database:**

   ```bash
   pnpm db:up
   ```

   This will start PostgreSQL on port 5432.

5. **Run database migrations:**

   ```bash
   cd apps/backend
   pnpm migration:run
   ```

6. **Start development servers:**

   On root folder run:

   ```bash
   pnpm dev
   ```

7. **Seed the database**

   ```bash
   cd apps/backend
   pnpm seed
   ```

8. **Access the applications:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4000
   - **API Documentation (Swagger)**: http://localhost:4000/api/docs

## Fixtures and match history

Configure **Stadium** with the club ground's capacity, default ticket price, expected occupancy, monthly maintenance, and per-match security, staffing, cleaning, and utilities costs. Amounts use EUR. Apply `CreateStadium1790726400000` and `AddFixtureTicketing1790812800000` before starting the updated backend.

On a fixture, leave the ticket price blank to inherit the stadium default, or enter an override (including zero for free admission). The forecast uses `capacity × occupancy × (reference + default price) / (reference + fixture price)`, rounded and capped at capacity; `reference = max(1, default price)`. At kickoff, simulated attendance varies by up to 10% around that forecast. The fixture saves the stadium, pricing, attendance, and operating costs together, and completed reports retain those figures after settings change. Monthly maintenance is excluded from match operating profit. Ticketing figures are not yet included in the finance overview.

Open **Fixtures** to schedule a home match with an opponent, competition, and kickoff time. Select eleven active players with exactly one goalkeeper, then save the lineup or choose **Save and start match**. Kickoff times use your browser's local timezone and are stored in UTC.

Completed matches appear in **Match History**, with opponent search, win/draw/loss filters, and a saved report containing the final score, starting XI, statistics, and event timeline. Reports keep the player names and positions recorded at kickoff. Completed fixtures cannot be edited or replayed.

The simulator supports one match at a time on one backend process. Reconnecting browsers recover the current match state. If the server restarts during a match, its fixture becomes **Interrupted** and can be started again; completed results remain in PostgreSQL. Matches played before fixture persistence was added cannot be recovered from the old in-memory simulator.

The `CreateFixtures1790553600000` migration creates the fixtures table. Run database migrations before starting an upgraded backend. Rebuild `@repo/core` after changing shared schemas (`pnpm --filter @repo/core build`).

## Tech Stack

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
