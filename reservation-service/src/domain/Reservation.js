const ReservationStatus = require('./ReservationStatus');

class Reservation {
  constructor({ id, userId, room, date, hours, status = ReservationStatus.ACTIVE }) {
    this.id = id;
    this.userId = userId;
    this.room = room;
    this.date = date;
    this.hours = hours;
    this.status = status;
  }

  isActive() {
    return this.status === ReservationStatus.ACTIVE;
  }
}

module.exports = Reservation;
