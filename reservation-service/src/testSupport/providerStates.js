const Reservation = require('../domain/Reservation');
const reservationRepository = require('../repositories/reservationRepository');

const PROVIDER_STATES = {
  'el usuario U100 posee una reserva activa': () => {
    reservationRepository.reset();
    reservationRepository.save(
      new Reservation({
        id: reservationRepository.generateId(),
        userId: 'U100',
        room: 'SALA-1',
        date: '2026-09-11',
        hours: 2,
      }),
    );
  },
  'el usuario U200 no posee ninguna reserva': () => {
    reservationRepository.reset();
  },
  'la reserva R-1001 existe y se encuentra activa': () => {
    reservationRepository.reset();
    reservationRepository.save(
      new Reservation({
        id: 'R-1001',
        userId: 'U100',
        room: 'SALA-1',
        date: '2026-09-11',
        hours: 2,
      }),
    );
  },
  'una reserva no existe': () => {
    reservationRepository.reset();
  },
  'el sistema está preparado para crear una nueva reserva válida': () => {
    reservationRepository.reset();
  },
};

function applyProviderState(state) {
  const handler = PROVIDER_STATES[state];
  if (!handler) {
    throw new Error(`Estado de prueba desconocido: ${state}`);
  }
  handler();
}

module.exports = { applyProviderState, PROVIDER_STATES };
