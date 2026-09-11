const axios = require('axios');

function createClient(baseURL = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3001') {
  const http = axios.create({ baseURL });

  async function verifyReservation(id) {
    const response = await http.get(`/reservations/${id}/verify`);
    return response.data;
  }

  return { verifyReservation };
}

module.exports = { createClient };
