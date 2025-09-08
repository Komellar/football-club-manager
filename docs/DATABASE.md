# Database Setup with Docker

## Quick Start

1. **Start PostgreSQL database:**

   ```bash
   pnpm db:up
   ```

2. **Start your backend:**

   ```bash
   pnpm turbo run dev --filter=backend
   ```

3. **Optional: Start pgAdmin (Database management UI):**

   ```bash
   pnpm pgadmin
   ```

   - Access at: http://localhost:5050
   - Email: admin@footballclub.com
   - Password: admin

## Database Commands

```bash
# Start only PostgreSQL
pnpm db:up

# Stop database
pnpm db:down

# View database logs
pnpm db:logs

# Reset database (removes all data!)
pnpm db:reset

# Start pgAdmin
pnpm pgadmin
```

## Database Configuration

- **Host**: localhost
- **Port**: 5432
- **Database**: football_club_manager
- **Username**: postgres
- **Password**: football_club_2025

## Data Persistence

Your database data is stored in a Docker volume named `postgres_data`. This means:

- ✅ Data persists between container restarts
- ✅ Data survives `docker-compose down`
- ❌ Data is lost with `pnpm db:reset` or `docker-compose down -v`

## pgAdmin Setup

After starting pgAdmin:

1. Go to http://localhost:5050
2. Login with admin@footballclub.com / admin
3. Add server:
   - Name: Football Club DB
   - Host: postgres (or localhost if connecting from host)
   - Port: 5432
   - Username: postgres
   - Password: football_club_2025
