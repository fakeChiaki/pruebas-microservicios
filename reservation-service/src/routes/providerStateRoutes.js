const { Router } = require('express');
const { applyProviderState } = require('../testSupport/providerStates');

const router = Router();

router.post('/_pact/provider-states', (req, res) => {
  const { state } = req.body;
  try {
    applyProviderState(state);
    res.status(200).json({ result: 'ok' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
