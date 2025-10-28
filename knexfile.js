require('dotenv').config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,
  DB_SSL_CA,
  DB_SSL_REJECT_UNAUTHORIZED
} = process.env;

const shared = {
  pool: { min: 0, max: 10 },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  }
};

function buildSsl(urlStr) {
  const sslEnabled = (DB_SSL === 'true') || (urlStr && (/ssl=true/i.test(urlStr) || /ssl-mode=REQUIRED/i.test(urlStr)));
  if (!sslEnabled) return undefined;
  if (DB_SSL_CA) {
    return { ca: DB_SSL_CA, rejectUnauthorized: true };
  }
  const reject = DB_SSL_REJECT_UNAUTHORIZED ? DB_SSL_REJECT_UNAUTHORIZED === 'true' : false;
  return { rejectUnauthorized: reject };
}

/** @type {import('knex').Knex.Config} */
const config = {
  client: 'mysql2',
  connection: (() => {
    if (DATABASE_URL) {
      try {
        const u = new URL(DATABASE_URL);
        return {
          host: u.hostname,
          port: u.port ? Number(u.port) : 3306,
          user: decodeURIComponent(u.username),
          password: decodeURIComponent(u.password),
          database: u.pathname.replace(/^\//, ''),
          ssl: buildSsl(DATABASE_URL)
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
      ssl: buildSsl()
    };
  })(),
  ...shared
};

module.exports = config;
