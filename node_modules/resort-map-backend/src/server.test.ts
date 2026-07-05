import request from 'supertest';
import fs from 'fs';

jest.mock('fs');
// @ts-ignore
fs.readFileSync.mockImplementation((path) => {
  if (path.includes('map.ascii')) {
    return '....................\n.#################..\n.#.WWWWWWWWWWWWWW...\n....................';
  }
  if (path.includes('bookings.json')) {
    return JSON.stringify([{ room: '101', guestName: 'Alice Smith' }]);
  }
  return '';
});

import app from './server';

describe('Resort Map API', () => {
  it('should return map layout and cabanas', async () => {
    const res = await request(app).get('/api/map');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('layout');
    expect(res.body).toHaveProperty('bookedCabanas');
    expect(Array.isArray(res.body.layout)).toBeTruthy();
  });

  it('should validate and book an available cabana', async () => {
    // We know from bookings.json that "101" "Alice Smith" is a valid guest.
    // We know from map.ascii that row 12, col 3 is 'W' (a cabana).
    const res = await request(app)
      .post('/api/cabanas/book')
      .send({
        x: 3,
        y: 2,
        room: '101',
        guestName: 'Alice Smith'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cabanaId).toBe('3,2');
  });

  it('should prevent booking an already booked cabana', async () => {
    // Book the same one again, we must use the same valid guest credentials
    // because if we use invalid ones, it returns 401 before checking availability!
    const res = await request(app)
      .post('/api/cabanas/book')
      .send({
        x: 3,
        y: 2,
        room: '101',
        guestName: 'Alice Smith'
      });
    
    expect(res.statusCode).toEqual(409);
    expect(res.body.error).toMatch(/already booked/i);
  });

  it('should reject invalid guest credentials', async () => {
    const res = await request(app)
      .post('/api/cabanas/book')
      .send({
        x: 4,
        y: 12,
        room: '999',
        guestName: 'Hacker Man'
      });
    
    expect(res.statusCode).toEqual(401);
  });
});
