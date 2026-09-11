const reservationRepository = require('../src/repositories/reservationRepository');
const reservationService = require('../src/services/reservationService');
const InvalidReservationDataError = require('../src/errors/InvalidReservationDataError');

beforeEach(() => {
  reservationRepository.reset();
});

describe('reservationService.createReservation', () => {
  it('creates an active reservation with a generated id when hours is valid', () => {
    const reservation = reservationService.createReservation({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 2,
    });

    expect(reservation.id).toBeDefined();
    expect(reservation.status).toBe('ACTIVE');
    expect(reservation.userId).toBe('U100');
  });

  it('rejects a reservation with zero hours', () => {
    expect(() =>
      reservationService.createReservation({
        userId: 'U100',
        room: 'SALA-1',
        date: '2026-09-11',
        hours: 0,
      }),
    ).toThrow(InvalidReservationDataError);
  });

  it('rejects a reservation with negative hours', () => {
    expect(() =>
      reservationService.createReservation({
        userId: 'U100',
        room: 'SALA-1',
        date: '2026-09-11',
        hours: -1,
      }),
    ).toThrow(InvalidReservationDataError);
  });
});

describe('reservationService.getReservationsByUser', () => {
  it('returns the reservations belonging to a user', () => {
    reservationService.createReservation({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 2,
    });

    const reservations = reservationService.getReservationsByUser('U100');

    expect(reservations).toHaveLength(1);
  });

  it('returns an empty list when the user has no reservations', () => {
    const reservations = reservationService.getReservationsByUser('U200');

    expect(reservations).toEqual([]);
  });
});

describe('reservationService.verifyReservation', () => {
  it('marks an existing active reservation as valid', () => {
    const created = reservationService.createReservation({
      userId: 'U100',
      room: 'SALA-1',
      date: '2026-09-11',
      hours: 2,
    });

    expect(reservationService.verifyReservation(created.id)).toEqual({
      id: created.id,
      valid: true,
    });
  });

  it('marks a non-existing reservation as invalid', () => {
    expect(reservationService.verifyReservation('R-9999')).toEqual({
      id: 'R-9999',
      valid: false,
    });
  });
});
