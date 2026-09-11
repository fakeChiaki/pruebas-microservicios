const request = require('supertest');
const app = require('../src/index');
const reservationRepository = require('../src/repositories/reservationRepository');

beforeEach(() => {
  reservationRepository.reset();
});

describe('POST /reservations', () => {
  it('creates a reservation and returns 201', async () => {
    const response = await request(app).post('/reservations').send({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 2,
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('ACTIVE');
    expect(response.body.id).toBeDefined();
  });

  it('rejects a reservation with zero hours', async () => {
    const response = await request(app).post('/reservations').send({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 0,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/no son válidos/);
  });
});

describe('GET /users/:userId/reservations', () => {
  it('returns the reservations for a user with bookings', async () => {
    await request(app).post('/reservations').send({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 2,
    });

    const response = await request(app).get('/users/U100/reservations');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('returns an empty array for a user without bookings', async () => {
    const response = await request(app).get('/users/U200/reservations');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('GET /reservations/:id/verify', () => {
  it('confirms an existing active reservation is valid', async () => {
    const created = await request(app).post('/reservations').send({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 2,
    });

    const response = await request(app).get(`/reservations/${created.body.id}/verify`);

    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
  });

  it('reports a non-existing reservation as invalid', async () => {
    const response = await request(app).get('/reservations/R-9999/verify');

    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(false);
  });
});
