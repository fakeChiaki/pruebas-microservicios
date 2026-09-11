const reservationRepository = require('../src/repositories/reservationRepository');
const { applyProviderState } = require('../src/testSupport/providerStates');

beforeEach(() => {
  reservationRepository.reset();
});

describe('applyProviderState', () => {
  it('seeds an active reservation for U100', () => {
    applyProviderState('el usuario U100 posee una reserva activa');

    const reservations = reservationRepository.findByUserId('U100');
    expect(reservations).toHaveLength(1);
    expect(reservations[0].status).toBe('ACTIVE');
  });

  it('leaves U200 without reservations', () => {
    applyProviderState('el usuario U200 no posee ninguna reserva');

    expect(reservationRepository.findByUserId('U200')).toEqual([]);
  });

  it('seeds reservation R-1001 as active', () => {
    applyProviderState('la reserva R-1001 existe y se encuentra activa');

    expect(reservationRepository.findById('R-1001').isActive()).toBe(true);
  });

  it('ensures a given reservation id does not exist', () => {
    applyProviderState('una reserva no existe');

    expect(reservationRepository.findById('R-9999')).toBeUndefined();
  });

  it('resets the repository so a new valid reservation can be created', () => {
    applyProviderState('el sistema está preparado para crear una nueva reserva válida');

    expect(reservationRepository.findByUserId('U100')).toEqual([]);
  });

  it('throws for an unknown state', () => {
    expect(() => applyProviderState('estado inexistente')).toThrow(/desconocido/);
  });
});
