const axios = require('axios');
const InvalidReservationDataError = require('./InvalidReservationDataError');

function createClient(baseURL = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3001') {
  const http = axios.create({ baseURL });

  async function createReservation({ userId, room, date, hours }) {
    try {
      const response = await http.post('/reservations', { userId, room, date, hours });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new InvalidReservationDataError(error.response.data.message);
      }
      throw error;
    }
  }

  async function getUserReservations(userId) {
    const response = await http.get(`/users/${userId}/reservations`);
    return response.data;
  }

  return { createReservation, getUserReservations };
}

module.exports = { createClient, InvalidReservationDataError };
