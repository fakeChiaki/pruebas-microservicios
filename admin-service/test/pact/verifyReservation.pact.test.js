const path = require('path');
const { PactV3 } = require('@pact-foundation/pact');
const { createClient } = require('../../src/clients/reservationServiceClient');

const provider = new PactV3({
  consumer: 'admin-service',
  provider: 'reservation-service',
  dir: path.resolve(__dirname, '..', '..', '..', 'pacts'),
});

describe('Contrato: admin-service verifica una reserva en reservation-service', () => {
  it('indica que una reserva existente y activa es válida', () => {
    provider
      .given('la reserva R-1001 existe y se encuentra activa')
      .uponReceiving('una solicitud para verificar la reserva R-1001')
      .withRequest({
        method: 'GET',
        path: '/reservations/R-1001/verify',
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          id: 'R-1001',
          valid: true,
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = createClient(mockServer.url);
      const result = await client.verifyReservation('R-1001');

      expect(result).toEqual({ id: 'R-1001', valid: true });
    });
  });

  it('indica que una reserva inexistente no es válida', () => {
    provider
      .given('una reserva no existe')
      .uponReceiving('una solicitud para verificar una reserva inexistente')
      .withRequest({
        method: 'GET',
        path: '/reservations/R-9999/verify',
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          id: 'R-9999',
          valid: false,
        },
      });

    return provider.executeTest(async (mockServer) => {
      const client = createClient(mockServer.url);
      const result = await client.verifyReservation('R-9999');

      expect(result).toEqual({ id: 'R-9999', valid: false });
    });
  });
});
