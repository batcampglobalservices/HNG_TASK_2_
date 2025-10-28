/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const hasCountries = await knex.schema.hasTable('countries');
  if (!hasCountries) {
    await knex.schema.createTable('countries', (t) => {
      t.increments('id').primary();
      t.string('name', 191).notNullable().unique();
      t.string('capital', 191).nullable();
      t.string('region', 100).nullable().index();
      t.bigint('population').unsigned().notNullable();
      t.string('currency_code', 10).nullable().index();
      t.decimal('exchange_rate', 18, 6).nullable();
      t.decimal('estimated_gdp', 24, 2).nullable().index();
      t.string('flag_url', 512).nullable();
      t.dateTime('last_refreshed_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasMeta = await knex.schema.hasTable('metadata');
  if (!hasMeta) {
    await knex.schema.createTable('metadata', (t) => {
      t.string('key', 191).primary();
      t.text('value').nullable();
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('metadata');
  await knex.schema.dropTableIfExists('countries');
};
