const express = require('express');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reservation-service' });
});

app.use(reservationRoutes);

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`reservation-service escuchando en puerto ${PORT}`));
}

module.exports = app;
