class InvalidReservationDataError extends Error {
  constructor(message = 'Los datos de la reserva no son válidos') {
    super(message);
    this.name = 'InvalidReservationDataError';
  }
}

module.exports = InvalidReservationDataError;
