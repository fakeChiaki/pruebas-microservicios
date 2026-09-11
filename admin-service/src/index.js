const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-service' });
});

const PORT = process.env.PORT || 3003;
if (require.main === module) {
  app.listen(PORT, () => console.log(`admin-service escuchando en puerto ${PORT}`));
}

module.exports = app;
