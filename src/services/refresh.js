const knex = require('../db');
const { generateSummaryImage } = require('../utils/image');
const fetch = require('node-fetch');

const COUNTRIES_URL = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const RATES_URL = 'https://open.er-api.com/v6/latest/USD';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function httpJson(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal })
    .then(async (res) => {
      clearTimeout(id);
      if (!res.ok) {
        const text = await res.text();
        const err = new Error(`HTTP ${res.status} for ${url}: ${text}`);
        err.statusCode = 503;
        err.body = { error: 'External data source unavailable', details: `Could not fetch data from ${url}` };
        throw err;
      }
      return res.json();
    })
    .catch((e) => {
      if (e.name === 'AbortError') {
        const err = new Error(`Timeout fetching ${url}`);
        err.statusCode = 503;
        err.body = { error: 'External data source unavailable', details: `Could not fetch data from ${url}` };
        throw err;
      }
      if (!e.statusCode) {
        e.statusCode = 503;
        e.body = { error: 'External data source unavailable', details: `Could not fetch data from ${url}` };
      }
      throw e;
    });
}

async function refreshAll() {
  // Fetch external data first (fail-fast, no DB writes yet)
  const [countriesData, ratesData] = await Promise.all([
    httpJson(COUNTRIES_URL),
    httpJson(RATES_URL)
  ]);

  const rates = ratesData && ratesData.rates ? ratesData.rates : null;
  if (!Array.isArray(countriesData) || !rates) {
    const err = new Error('Invalid external responses');
    err.statusCode = 503;
    err.body = { error: 'External data source unavailable', details: 'Could not fetch data from restcountries or open.er-api' };
    throw err;
  }

  const now = new Date();
  // Use Date object for MySQL DATETIME fields to avoid timezone/Z formatting issues
  const nowDate = now;
  // Keep ISO string in metadata (text) for API responses
  const nowIso = now.toISOString();

  // Prepare computed rows
  const prepared = countriesData.map((c) => {
    const name = c.name || null;
    const capital = c.capital || null;
    const region = c.region || null;
    const population = typeof c.population === 'number' ? c.population : null;
    const flag_url = c.flag || null;

    let currency_code = null;
    let exchange_rate = null;
    let estimated_gdp = null;

    if (Array.isArray(c.currencies) && c.currencies.length > 0) {
      const first = c.currencies[0];
      currency_code = first && first.code ? String(first.code).toUpperCase() : null;
      if (currency_code && Object.prototype.hasOwnProperty.call(rates, currency_code)) {
        exchange_rate = rates[currency_code];
        if (typeof exchange_rate === 'number' && exchange_rate > 0 && typeof population === 'number') {
          const multiplier = randInt(1000, 2000);
          estimated_gdp = (population * multiplier) / exchange_rate;
        }
      } else {
        // currency not in rates => estimated_gdp stays null
        exchange_rate = null;
        estimated_gdp = null;
      }
    } else {
      // No currencies
      currency_code = null;
      exchange_rate = null;
      estimated_gdp = 0;
    }

    return {
      name,
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url,
  // Store as Date object so mysql2 formats correctly for DATETIME
  last_refreshed_at: nowDate
    };
  });

  // Validate required fields (with exceptions per spec)
  const invalid = prepared.find((r) => !r.name || typeof r.population !== 'number');
  if (invalid) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.body = { error: 'Validation failed', details: { message: 'name and population are required' } };
    throw err;
  }

  // Begin transaction: upsert rows, then update metadata, then generate image
  return knex.transaction(async (trx) => {
    // Load existing by name (case-insensitive)
    const existingRows = await trx('countries').select('id', 'name');
    const existingMap = new Map(); // lower(name) -> {id,name}
    for (const row of existingRows) {
      existingMap.set(String(row.name).toLowerCase(), row);
    }

    const toInsert = [];
    const toUpdate = [];

    for (const r of prepared) {
      const key = r.name.toLowerCase();
      const found = existingMap.get(key);
      const data = { ...r };
      if (found) {
        toUpdate.push({ id: found.id, data });
      } else {
        toInsert.push(data);
      }
    }

    // Perform updates
    for (const u of toUpdate) {
      await trx('countries').where({ id: u.id }).update(u.data);
    }
    if (toInsert.length > 0) {
      // batch insert
      const chunkSize = 100;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        await trx('countries').insert(chunk);
      }
    }

    // Update global metadata last_refreshed_at
    await trx('metadata')
      .insert({ key: 'last_refreshed_at', value: nowIso, updated_at: trx.fn.now() })
      .onConflict('key')
      .merge({ value: nowIso, updated_at: trx.fn.now() });

    // Generate summary image
    await generateSummaryImage(trx, pathJoinCache('summary.png'));

    return { updated: toUpdate.length, inserted: toInsert.length, total: prepared.length, last_refreshed_at: nowIso };
  });
}

const path = require('path');
const fs = require('fs');
function ensureCacheDir() {
  const p = path.join(__dirname, '..', '..', 'cache');
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  return p;
}
function pathJoinCache(file) {
  return path.join(ensureCacheDir(), file);
}

module.exports = { refreshAll, pathJoinCache };
