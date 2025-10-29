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

3. **Start the PostgreSQL database:**

   ```bash
   pnpm db:up
   ```

   This will start PostgreSQL on port 5432.

4. **Run database migrations:**

   ```bash
   cd apps/backend
   pnpm migration:run
   cd ../../
   ```

5. **Start development servers:**

   ```bash
   pnpm dev
   ```

6. **Seed the database**

   ```bash
   cd apps/backend
   pnpm seed
   ```

7. **Access the applications:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4000
   - **API Documentation (Swagger)**: http://localhost:4000/api/docs

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
