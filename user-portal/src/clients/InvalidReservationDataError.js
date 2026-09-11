class InvalidReservationDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidReservationDataError';
  }
}

module.exports = InvalidReservationDataError;
