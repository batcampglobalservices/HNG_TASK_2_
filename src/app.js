const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const countriesRouter = require('./routes/countries');
const statusRouter = require('./routes/status');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/countries', countriesRouter);
app.use('/status', statusRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve cached image statically as a fallback under /static if needed
app.use('/static', express.static(path.join(__dirname, '..', 'cache')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.statusCode) {
    return res.status(err.statusCode).json(err.body || { error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
