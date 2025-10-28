const express = require('express');
const knex = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [{ total_countries }] = await knex('countries').count({ total_countries: '*' });
    const meta = await knex('metadata').where({ key: 'last_refreshed_at' }).first();
    res.json({
      total_countries: Number(total_countries || 0),
      last_refreshed_at: meta ? meta.value : null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
