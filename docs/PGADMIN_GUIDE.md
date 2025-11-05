# pgAdmin Quick Guide

This guide explains how to connect to pgAdmin (dockerized) and view table data, such as your players table.

## 1. Start Docker Containers

Run the following command in your project root:

```sh
pnpm pgadmin
```

## 2. Access pgAdmin

- Open your browser and go to: [http://localhost:5050](http://localhost:5050)
- Login credentials:
  - **Email:** `admin@footballclub.com`
  - **Password:** `admin`

## 3. Connect to the Postgres Server

1. In pgAdmin, right-click "Servers" in the left sidebar and select **Register > Server**.
2. In the **General** tab, enter a name (e.g., `football-club-postgres`).
3. In the **Connection** tab, fill in:
   - **Host name/address:** `postgres`
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** (leave blank or use the password if set in `docker-compose.yml`)
4. Click **Save**.

## 4. View Table Data (e.g., Players)

1. Expand your server > Databases > `football_club_manager` > Schemas > public > Tables.
2. Find the `players` table (or similar).
3. Right-click the table and select **View/Edit Data > All Rows** to see all records.

---

**Troubleshooting:**

- If you can't connect, make sure containers are running (`docker ps`).
- Use `postgres` as the host (not `localhost`).
- Port should be `5432` (internal Docker network).
- Check your `docker-compose.yml` for credentials.
