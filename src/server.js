require('dotenv').config();
const app = require('./app');
const knex = require('./db');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Ensure cache directory exists
const cacheDir = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

async function start() {
  try {
    // quick connection test
    await knex.raw('SELECT 1');
    console.log('✓ Database connection successful');
    
    app.listen(PORT, () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('✗ Failed to start server. DB connection error:', err.message);
    process.exit(1);
  }
}

start();
