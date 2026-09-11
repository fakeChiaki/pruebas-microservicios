const Reservation = require('../domain/Reservation');
const InvalidReservationDataError = require('../errors/InvalidReservationDataError');
const reservationRepository = require('../repositories/reservationRepository');

function createReservation({ userId, room, date, hours }) {
  if (typeof hours !== 'number' || hours <= 0) {
    throw new InvalidReservationDataError();
  }

  const reservation = new Reservation({
    id: reservationRepository.generateId(),
    userId,
    room,
    date,
    hours,
  });

  return reservationRepository.save(reservation);
}

function getReservationsByUser(userId) {
  return reservationRepository.findByUserId(userId);
}

function verifyReservation(id) {
  const reservation = reservationRepository.findById(id);
  return { id, valid: Boolean(reservation && reservation.isActive()) };
}

module.exports = {
  createReservation,
  getReservationsByUser,
  verifyReservation,
};
