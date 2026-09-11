const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { createClient, InvalidReservationDataError } = require('../../src/clients/reservationServiceClient');

const { like } = MatchersV3;

const provider = new PactV3({
  consumer: 'user-portal',
  provider: 'reservation-service',
  dir: path.resolve(__dirname, '..', '..', '..', 'pacts'),
});

describe('Contrato: user-portal crea una reserva en reservation-service', () => {
  it('crea una reserva cuando la duración es válida', () => {
    provider
      .given('el sistema está preparado para crear una nueva reserva válida')
      .uponReceiving('una solicitud para crear una reserva válida')
      .withRequest({
        method: 'POST',
        path: '/reservations',
        headers: { 'Content-Type': 'application/json' },
        body: {
          userId: 'U100',
          room: 'SALA-1',
          date: '2026-09-11',
          hours: 2,
        },
      })
      .willRespondWith({
        status: 201,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          id: like('R-1000'),
          userId: 'U100',
          room: 'SALA-1',
          date: '2026-09-11',
          hours: 2,
          status: 'ACTIVE',
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = createClient(mockServer.url);
      const reservation = await client.createReservation({
        userId: 'U100',
        room: 'SALA-1',
        date: '2026-09-11',
        hours: 2,
      });

      expect(reservation.status).toBe('ACTIVE');
      expect(reservation.id).toBeDefined();
    });
  });

  it('rechaza una reserva con 0 horas', () => {
    provider
      .given('el sistema está preparado para crear una nueva reserva válida')
      .uponReceiving('una solicitud para crear una reserva con 0 horas')
      .withRequest({
        method: 'POST',
        path: '/reservations',
        headers: { 'Content-Type': 'application/json' },
        body: {
          userId: 'U100',
          room: 'SALA-1',
          date: '2026-09-11',
          hours: 0,
        },
      })
      .willRespondWith({
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          message: like('Los datos de la reserva no son válidos'),
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = createClient(mockServer.url);

      await expect(
        client.createReservation({
          userId: 'U100',
          room: 'SALA-1',
          date: '2026-09-11',
          hours: 0,
        }),
      ).rejects.toThrow(InvalidReservationDataError);
    });
  });
});
