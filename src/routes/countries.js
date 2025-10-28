const express = require('express');
const fs = require('fs');
const path = require('path');
const knex = require('../db');
const { refreshAll, pathJoinCache } = require('../services/refresh');

const router = express.Router();

// POST /countries/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const result = await refreshAll();
    res.json({
      message: 'Refresh complete',
      ...result
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: err.body?.details || err.message
      });
    }
    if (err.statusCode === 400) {
      return res.status(400).json(err.body || { error: 'Validation failed' });
    }
    next(err);
  }
});

// GET /countries/image
router.get('/image', async (req, res) => {
  const p = pathJoinCache('summary.png');
  if (!fs.existsSync(p)) {
    return res.status(404).json({ error: 'Summary image not found' });
  }
  res.sendFile(p);
});

// GET /countries
router.get('/', async (req, res, next) => {
  try {
    const { region, currency, sort } = req.query;
    const q = knex('countries').select(
      'id','name','capital','region','population','currency_code','exchange_rate','estimated_gdp','flag_url','last_refreshed_at'
    );

    if (region) q.where('region', String(region));
    if (currency) q.where('currency_code', String(currency).toUpperCase());

    // sorting
    switch (sort) {
      case 'gdp_desc':
        q.orderBy([{ column: 'estimated_gdp', order: 'desc' }, { column: 'name', order: 'asc' }]);
        break;
      case 'gdp_asc':
        q.orderBy([{ column: 'estimated_gdp', order: 'asc' }, { column: 'name', order: 'asc' }]);
        break;
      case 'name_desc':
        q.orderBy('name', 'desc');
        break;
      case undefined:
      case 'name_asc':
        q.orderBy('name', 'asc');
        break;
      default:
        return res.status(400).json({ error: 'Validation failed', details: { sort: 'invalid sort value' } });
    }

    const rows = await q;
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /countries/:name
router.get('/:name', async (req, res, next) => {
  try {
    const name = String(req.params.name).toLowerCase();
    const row = await knex('countries')
      .select('id','name','capital','region','population','currency_code','exchange_rate','estimated_gdp','flag_url','last_refreshed_at')
      .whereRaw('LOWER(name) = ?', [name])
      .first();
    if (!row) return res.status(404).json({ error: 'Country not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// DELETE /countries/:name
router.delete('/:name', async (req, res, next) => {
  try {
    const name = String(req.params.name).toLowerCase();
    const del = await knex('countries').whereRaw('LOWER(name) = ?', [name]).del();
    if (del === 0) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: 'Country deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
