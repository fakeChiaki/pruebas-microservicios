const express = require('express');
const reservationRoutes = require('./routes/reservationRoutes');
const providerStateRoutes = require('./routes/providerStateRoutes');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reservation-service' });
});

app.use(reservationRoutes);
app.use(providerStateRoutes);

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`reservation-service escuchando en puerto ${PORT}`));
}

module.exports = app;
