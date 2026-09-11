const request = require('supertest');
const app = require('../src/index');
const reservationRepository = require('../src/repositories/reservationRepository');

beforeEach(() => {
  reservationRepository.reset();
});

describe('POST /_pact/provider-states', () => {
  it('applies a known state and returns 200', async () => {
    const response = await request(app)
      .post('/_pact/provider-states')
      .send({ state: 'el usuario U100 posee una reserva activa' });

    expect(response.status).toBe(200);
    expect(reservationRepository.findByUserId('U100')).toHaveLength(1);
  });

  it('returns 400 for an unknown state', async () => {
    const response = await request(app)
      .post('/_pact/provider-states')
      .send({ state: 'estado inexistente' });

    expect(response.status).toBe(400);
  });
});
