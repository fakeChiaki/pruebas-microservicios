const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Verifier } = require('@pact-foundation/pact');
const app = require('../src/index');

const PACTS_DIR = path.resolve(__dirname, '..', '..', 'pacts');

function findPactFiles() {
  return fs
    .readdirSync(PACTS_DIR)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => path.join(PACTS_DIR, fileName));
}

function startLocalProvider() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://localhost:${port}` });
    });
  });
}

async function setupProviderState(baseUrl, state) {
  await axios.post(`${baseUrl}/_pact/provider-states`, { state });
}

function buildStateHandlers(baseUrl, pactFiles) {
  const states = new Set();
  pactFiles.forEach((filePath) => {
    const pact = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    pact.interactions.forEach((interaction) => {
      (interaction.providerStates || []).forEach(({ name }) => states.add(name));
    });
  });

  return Array.from(states).reduce((handlers, state) => {
    handlers[state] = () => setupProviderState(baseUrl, state);
    return handlers;
  }, {});
}

async function main() {
  const externalUrl = process.env.RESERVATION_SERVICE_URL;
  const { server, baseUrl } = externalUrl
    ? { server: null, baseUrl: externalUrl }
    : await startLocalProvider();

  const pactFiles = findPactFiles();

  const verifierOptions = {
    provider: 'reservation-service',
    providerBaseUrl: baseUrl,
    pactUrls: pactFiles,
    stateHandlers: buildStateHandlers(baseUrl, pactFiles),
    logLevel: 'info',
  };

  try {
    await new Verifier(verifierOptions).verifyProvider();
    console.log('Verificación de contratos completada exitosamente.');
  } finally {
    if (server) {
      server.close();
    }
  }
}

main().catch((error) => {
  console.error('La verificación de contratos falló:', error.message || error);
  process.exit(1);
});
