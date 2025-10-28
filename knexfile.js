require('dotenv').config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL
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
  connection: (() => {
    if (DATABASE_URL) {
      try {
        const u = new URL(DATABASE_URL);
        const sslRequired = (DB_SSL === 'true') || /ssl=true/i.test(DATABASE_URL) || /ssl-mode=REQUIRED/i.test(DATABASE_URL);
        return {
          host: u.hostname,
          port: u.port ? Number(u.port) : 3306,
          user: decodeURIComponent(u.username),
          password: decodeURIComponent(u.password),
          database: u.pathname.replace(/^\//, ''),
          ssl: sslRequired ? { rejectUnauthorized: true } : undefined
        };
      } catch (e) {
        // Fallback to raw string if parsing fails
        return DATABASE_URL;
      }
    }
    return {
      host: DB_HOST || '127.0.0.1',
      port: DB_PORT ? Number(DB_PORT) : 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'countries',
      ssl: DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
    };
  })(),
  ...shared
};

module.exports = config;
