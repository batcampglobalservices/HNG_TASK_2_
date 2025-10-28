const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');

async function generateSummaryImage(trxOrKnex, outPath) {
  // Gather data
  const [{ count }] = await trxOrKnex('countries').count({ count: '*' });
  const top5 = await trxOrKnex('countries')
    .select('name', 'estimated_gdp')
    .whereNotNull('estimated_gdp')
    .andWhere('estimated_gdp', '>', 0)
    .orderBy('estimated_gdp', 'desc')
    .limit(5);
  const meta = await trxOrKnex('metadata').where({ key: 'last_refreshed_at' }).first();
  const lastRef = meta ? meta.value : null;

  const width = 900;
  const height = 500;
  const img = PImage.make(width, height);
  const ctx = img.getContext('2d');

  // Background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Load a default font
  const fontPath = path.join(__dirname, 'fonts', 'OpenSans-Regular.ttf');
  let font;
  if (fs.existsSync(fontPath)) {
    font = PImage.registerFont(fontPath, 'OpenSans');
    await font.load();
  }
  ctx.fillStyle = '#111';
  ctx.font = '28pt ' + (font ? 'OpenSans' : 'Arial');

  let y = 50;
  ctx.fillText('Country Summary', 30, y);
  y += 40;
  ctx.font = '16pt ' + (font ? 'OpenSans' : 'Arial');
  ctx.fillText(`Total countries: ${count}`, 30, y);
  y += 30;
  ctx.fillText(`Last refresh: ${lastRef || 'N/A'}`, 30, y);
  y += 50;

  ctx.font = '18pt ' + (font ? 'OpenSans' : 'Arial');
  ctx.fillText('Top 5 by Estimated GDP', 30, y);
  y += 30;
  ctx.font = '14pt ' + (font ? 'OpenSans' : 'Arial');

  if (top5.length === 0) {
    ctx.fillText('No data available', 30, y);
  } else {
    top5.forEach((row, idx) => {
      const gdp = Number(row.estimated_gdp).toLocaleString('en-US', { maximumFractionDigits: 2 });
      ctx.fillText(`${idx + 1}. ${row.name} — ${gdp}`, 30, y + idx * 26);
    });
  }

  // Ensure dir
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const stream = fs.createWriteStream(outPath);
  await PImage.encodePNGToStream(img, stream);
}

module.exports = { generateSummaryImage };
