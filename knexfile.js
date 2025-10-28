require('dotenv').config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

const shared = {
  pool: { min: 0, max: 10 },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  }
};

/** @type {import('knex').Knex.Config} */
const config = {
  client: 'mysql2',
  connection: DATABASE_URL || {
    host: DB_HOST || '127.0.0.1',
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME || 'countries',
    // Aiven MySQL requires SSL in production
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
  },
  ...shared
};

module.exports = config;
