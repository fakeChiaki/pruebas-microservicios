class ReservationRepository {
  constructor() {
    this.reservationsById = new Map();
    this.nextSequence = 1000;
  }

  reset() {
    this.reservationsById.clear();
    this.nextSequence = 1000;
  }

  generateId() {
    const id = `R-${this.nextSequence}`;
    this.nextSequence += 1;
    return id;
  }

  save(reservation) {
    this.reservationsById.set(reservation.id, reservation);
    return reservation;
  }

  findById(id) {
    return this.reservationsById.get(id);
  }

  findByUserId(userId) {
    return Array.from(this.reservationsById.values()).filter(
      (reservation) => reservation.userId === userId,
    );
  }
}

module.exports = new ReservationRepository();
