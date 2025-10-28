const request = require('supertest');
const fs = require('fs');
const { pathJoinCache } = require('../src/services/refresh');
const app = require('../src/app');

describe('Countries image', () => {
  it('GET /countries/image returns 404 JSON when missing', async () => {
    const p = pathJoinCache('summary.png');
    if (fs.existsSync(p)) fs.unlinkSync(p);
    const res = await request(app).get('/countries/image');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Summary image not found' });
  });
});
