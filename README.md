# Country Currency & Exchange API

RESTful API that fetches country data, matches currency exchange rates, computes estimated GDP, and caches the results in MySQL. Built with Express + Knex. Summary image generated with PureImage.

## Features
- POST /countries/refresh pulls countries and USD exchange rates, computes fields, and caches to MySQL
- GET /countries with filters and sorting (e.g. `?region=Africa&currency=NGN&sort=gdp_desc`)
- GET /countries/:name returns a single country (case-insensitive)
- DELETE /countries/:name deletes a country
- GET /status shows total countries and last refresh timestamp
- GET /countries/image serves a generated summary image (top 5 by estimated GDP)

## Data sources
- Countries: https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
- Exchange rates (base USD): https://open.er-api.com/v6/latest/USD

## Tech stack
- Node.js 18+
- Express
- MySQL via **Aiven** (cloud-hosted MySQL)
- Knex (migrations + query builder)
- pureimage (PNG generation)

## Requirements handled
- First currency per country is used; if none, `currency_code=null`, `exchange_rate=null`, `estimated_gdp=0`
- If currency not present in rates API, `exchange_rate=null`, `estimated_gdp=null`
- Upsert by country name (case-insensitive)
- Fresh random multiplier [1000, 2000] per country per refresh
- Global and per-row `last_refreshed_at` timestamps
- 503 on external API failure (no DB changes on failure)
- Consistent JSON errors

## Getting started (local)

1) Clone and install

```bash
npm install
```

2) Configure environment

Copy `.env.example` to `.env` and set your **Aiven MySQL** credentials:

```bash
cp .env.example .env
# edit .env with your Aiven connection details
```

Environment variables:
- `PORT` (default 3000)
- `DB_HOST` – Aiven MySQL host (e.g., `mysql-xxxxx.aivencloud.com`)
- `DB_PORT` – usually `3306`
- `DB_USER` – your Aiven MySQL username
- `DB_PASSWORD` – your Aiven MySQL password
- `DB_NAME` – your database name
- `DB_SSL` – set to `true` for Aiven (required for SSL connections)

Alternatively, use `DATABASE_URL` in the format:
```
DATABASE_URL=mysql://user:pass@host:port/dbname?ssl=true
```

3) Create database (if not existing)

If you're using **Aiven**, the database is typically created for you in the Aiven console. 
If you need to create it manually via MySQL client:

```sql
CREATE DATABASE countries CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4) Run migrations

```bash
npm run migrate
```

5) Start server

```bash
npm run dev
```

Visit http://localhost:3000/health

## API

- POST /countries/refresh
  - Refreshes cache from external APIs; generates summary image at `cache/summary.png`.
  - Responses:
    - 200: `{ message, updated, inserted, total, last_refreshed_at }`
    - 503: `{ error: "External data source unavailable", details }` (no DB changes)

- GET /countries
  - Query params:
    - `region` (e.g. `Africa`)
    - `currency` (e.g. `NGN`)
    - `sort` one of: `name_asc` (default), `name_desc`, `gdp_asc`, `gdp_desc`

- GET /countries/:name
  - 404: `{ error: "Country not found" }`

- DELETE /countries/:name
  - 200: `{ message: "Country deleted" }`
  - 404: `{ error: "Country not found" }`

- GET /status
  - `{ total_countries, last_refreshed_at }`

- GET /countries/image
  - Serves `cache/summary.png`
  - 404 JSON: `{ "error": "Summary image not found" }`

## Error responses
- 404: `{ "error": "Country not found" }` (for lookup/delete)
- 400: `{ "error": "Validation failed", details }` (invalid query params)
- 503: `{ "error": "External data source unavailable", "details": "Could not fetch data from [API]" }`
- 500: `{ "error": "Internal server error" }`

## Deployment notes (Railway/Heroku/AWS)

### Quick Deploy to Railway (Recommended)

**See detailed guide:** [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**Quick steps:**
1. Create MySQL service on **Aiven** (https://aiven.io) - Free tier available
2. Push code to GitHub
3. Create new project on **Railway** (https://railway.app)
4. Connect your GitHub repository
5. Add environment variables (from Aiven):
   ```
   DB_HOST=mysql-xxxxx.aivencloud.com
   DB_PORT=3306
   DB_USER=avnadmin
   DB_PASSWORD=your_password
   DB_NAME=defaultdb
   DB_SSL=true
   ```
6. Railway will automatically build and deploy
7. Migrations run automatically on build (configured in `railway.json`)

**Railway configuration files included:**
- `railway.json` - Build and deployment settings
- `nixpacks.toml` - Build configuration
- `Procfile` - Process configuration

### Heroku
- Connect to your Aiven MySQL instance
- Config Vars -> set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL=true`
- Release phase command (optional): `npm run migrate`

### AWS / Other platforms
- Use the Aiven connection details in your environment configuration
- Ensure SSL is enabled (`DB_SSL=true`)
- Run migrations before starting the app

## Testing

Minimal tests use Jest + Supertest.

```bash
npm test
```

Note: Tests assume a running DB and may be adapted to use a separate test database.

## Project scripts
- `npm run migrate` – apply migrations
- `npm run start` – start server
- `npm run dev` – dev server with nodemon

## Files
- `src/app.js` – Express app wiring
- `src/server.js` – boot + DB check
- `src/db.js` – Knex instance
- `src/routes/*` – routes
- `src/services/refresh.js` – refresh logic + transaction + image call
- `src/utils/image.js` – image generation (pureimage)
- `migrations/*` – DB schema

## Notes
- The API updates the cache only on POST /countries/refresh
- The summary image is regenerated after each successful refresh
# HNG_TASK_2
# HNG_TASK_2
# HNG_TASK_2_
# HNG_TASK_2_
