const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { createClient } = require('../../src/clients/reservationServiceClient');

const { like, eachLike } = MatchersV3;

const provider = new PactV3({
  consumer: 'user-portal',
  provider: 'reservation-service',
  dir: path.resolve(__dirname, '..', '..', '..', 'pacts'),
});

describe('Contrato: user-portal consulta las reservas de un usuario', () => {
  it('retorna las reservas cuando el usuario tiene al menos una', () => {
    provider
      .given('el usuario U100 posee una reserva activa')
      .uponReceiving('una solicitud de las reservas del usuario U100')
      .withRequest({
        method: 'GET',
        path: '/users/U100/reservations',
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: eachLike({
          id: like('R-1000'),
          userId: 'U100',
          room: like('SALA-1'),
          date: like('2026-09-11'),
          hours: like(2),
          status: 'ACTIVE',
        }),
      });

    return provider.executeTest(async (mockServer) => {
      const client = createClient(mockServer.url);
      const reservations = await client.getUserReservations('U100');

      expect(reservations.length).toBeGreaterThan(0);
      expect(reservations[0].userId).toBe('U100');
    });
  });

  it('retorna una lista vacía cuando el usuario no tiene reservas', () => {
    provider
      .given('el usuario U200 no posee ninguna reserva')
      .uponReceiving('una solicitud de las reservas del usuario U200')
      .withRequest({
        method: 'GET',
        path: '/users/U200/reservations',
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: [],
      });

    return provider.executeTest(async (mockServer) => {
      const client = createClient(mockServer.url);
      const reservations = await client.getUserReservations('U200');

      expect(reservations).toEqual([]);
    });
  });
});
