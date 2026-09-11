# Sistema de Reservas de Salas: Pruebas de Contrato con Pact

Sistema compuesto por tres microservicios que implementa un flujo de reservas de salas académicas, con pruebas de contrato (Consumer-Driven Contracts) entre ellos usando [Pact](https://docs.pact.io/).

## Arquitectura

| Servicio | Rol | Puerto | Descripción |
|---|---|---|---|
| `reservation-service` | Proveedor | 3001 | Crea reservas, las almacena en memoria, permite consultarlas por usuario y verificar si una reserva existe y está activa. |
| `user-portal` | Consumidor | 3002 | Permite a un usuario crear una reserva y consultar sus propias reservas. |
| `admin-service` | Consumidor | 3003 | Permite verificar si una reserva puntual existe y está activa. |

Los contratos Pact se generan a partir de las pruebas de los consumidores y quedan almacenados en [`./pacts`](pacts); **No se editan manualmente**.

### Contratos cubiertos

1. **`user-portal` → `reservation-service`**: creación de una reserva (válida e inválida por horas ≤ 0).
2. **`user-portal` → `reservation-service`**: consulta de reservas de un usuario (con y sin reservas).
3. **`admin-service` → `reservation-service`**: verificación de una reserva (existente/activa e inexistente).

## Requisitos

- Node.js 20+ y npm
- Docker y Docker Compose (para levantar el sistema completo)

## Instalación

Este repositorio usa **npm workspaces**: un único `npm install` en la raíz instala las dependencias de los tres servicios.

```bash
npm install
```

## Cómo levantar el sistema

```bash
docker compose up -d --build
```

Esto construye y levanta los tres contenedores:

- `reservation-service` en `http://localhost:3001`
- `user-portal` en `http://localhost:3002`
- `admin-service` en `http://localhost:3003`

Se puede verificar que están arriba con:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

Para detenerlos:

```bash
docker compose down
```

## Cómo ejecutar las pruebas de los consumidores (y generar los contratos Pact)

Las pruebas de contrato de cada consumidor se ejecutan con Jest y, al correr, generan automáticamente los archivos Pact dentro de `./pacts`. No requieren que los servicios estén levantados (usan un mock server propio de Pact).

```bash
# Solo user-portal (Contratos 1 y 2)
npm run test:portal

# Solo admin-service (Contrato 3)
npm run test:admin

# Ambos consumidores
npm run test:consumers
```

Al finalizar, deberían existir dos archivos en `./pacts`:

- `pacts/user-portal-reservation-service.json`
- `pacts/admin-service-reservation-service.json`

Cada archivo se regenera/actualiza automáticamente cada vez que se corren las pruebas correspondientes.

## Cómo verificar el Servicio de Reservas

La verificación usa el `Verifier` de Pact contra **todos** los archivos `.json` presentes en `./pacts`, y prepara los datos de cada interacción llamando al endpoint de estados de prueba del proveedor (`POST /_pact/provider-states`), definido en [`reservation-service/src/testSupport/providerStates.js`](reservation-service/src/testSupport/providerStates.js).

**Opción A — levantando una instancia efímera automáticamente** (no requiere Docker):

```bash
npm run verify:reservation
```

**Opción B — contra el contenedor real** (requiere `docker compose up -d` primero):

```bash
# bash / macOS / Linux
RESERVATION_SERVICE_URL=http://localhost:3001 npm run verify:reservation
```

```powershell
# PowerShell
$env:RESERVATION_SERVICE_URL = "http://localhost:3001"
npm run verify:reservation
```

Ambos casos deben terminar con `Verification successful` y el mensaje `Verificación de contratos completada exitosamente.`

### Estados de prueba (provider states) soportados

| Estado | Efecto |
|---|---|
| `el usuario U100 posee una reserva activa` | Limpia el repositorio y crea una reserva activa para `U100`. |
| `el usuario U200 no posee ninguna reserva` | Limpia el repositorio (sin reservas). |
| `la reserva R-1001 existe y se encuentra activa` | Limpia el repositorio y crea la reserva `R-1001`, activa. |
| `una reserva no existe` | Limpia el repositorio (ningún id existe). |
| `el sistema está preparado para crear una nueva reserva válida` | Limpia el repositorio, dejándolo listo para aceptar una creación. |

## Flujo completo demostrado

1. Cada consumidor (`user-portal`, `admin-service`) define, en sus pruebas, la respuesta que espera del `reservation-service`.
2. Al correr `npm run test:consumers`, Pact genera automáticamente los contratos en `./pacts`.
3. Los contratos quedan versionados en el repositorio (no se tocan a mano).
4. Se levanta `reservation-service` (local o vía Docker).
5. El proveedor prepara los datos necesarios para cada interacción a través de `POST /_pact/provider-states`.
6. `npm run verify:reservation` verifica cada contrato contra el proveedor real.
7. El resultado confirma si consumidor y proveedor siguen siendo compatibles.

## Estructura del repositorio

```
reservation-service/   # proveedor: dominio, endpoints REST, provider states, verify.js
user-portal/           # consumidor: cliente HTTP + pruebas de contrato (Contratos 1 y 2)
admin-service/         # consumidor: cliente HTTP + pruebas de contrato (Contrato 3)
pacts/                 # contratos Pact generados automáticamente
docker-compose.yml
```

## Principales dificultades encontradas

- **Ambigüedad del consumidor del Contrato 1**: El enunciado nombra una "Aplicación de Reserva" que no calza con ninguno de los tres servicios descritos. Se resolvió asignando la creación de reservas a `user-portal`, ya que es el servicio de cara al usuario.
- **Preparar estados de prueba entre procesos separados**: Dado que en Docker cada servicio corre en su propio contenedor, el `Verifier` no puede simplemente llamar funciones internas del proveedor. Se resolvió exponiendo `POST /_pact/provider-states` en `reservation-service`, y haciendo que el script de verificación llame a ese endpoint por HTTP antes de cada interacción.  Funciona igual localmente o contra el contenedor real.
- **Fusión de contratos por consumidor**: Al usar `PactV3` de `@pact-foundation/pact`, cada `describe`/archivo de test que comparte el mismo par consumidor-proveedor y el mismo directorio de salida se fusiona automáticamente en un único archivo `.json`, en vez de sobrescribirse. Esto permitió separar el Contrato 1 y el Contrato 2 en archivos de test distintos sin perder interacciones.
