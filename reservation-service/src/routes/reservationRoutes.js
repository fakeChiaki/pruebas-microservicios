const { Router } = require('express');
const reservationService = require('../services/reservationService');
const InvalidReservationDataError = require('../errors/InvalidReservationDataError');

const router = Router();

router.post('/reservations', (req, res) => {
  try {
    const { userId, room, date, hours } = req.body;
    const reservation = reservationService.createReservation({ userId, room, date, hours });
    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof InvalidReservationDataError) {
      res.status(400).json({ message: error.message });
      return;
    }
    throw error;
  }
});

router.get('/users/:userId/reservations', (req, res) => {
  const reservations = reservationService.getReservationsByUser(req.params.userId);
  res.status(200).json(reservations);
});

router.get('/reservations/:id/verify', (req, res) => {
  const result = reservationService.verifyReservation(req.params.id);
  res.status(200).json(result);
});

module.exports = router;
