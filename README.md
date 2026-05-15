# Accio Trago

Juego de cartas multiplayer en tiempo real ambientado en el mundo de Harry Potter. Backend: Fastify + Socket.io. Frontend: React + Vite + Zustand.

> **Nota:** Este proyecto está basado en el juego de mesa PARTYBOOSTER (https://www.partybooster.mx/). Es una versión fan-made con temática de Harry Potter, creada únicamente con fines de entretenimiento y sin ánimo de lucro. No está afiliado ni endorsed por Warner Bros. ni Hogwarts Legacy.

---

## Requisitos

- **Node.js** >= 18
- **pnpm** >= 9.0.0

---

## Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Iniciar todo el proyecto (backend + web en paralelo)
pnpm dev
```

| Servicio | URL |
|---|---|
| Web (Vite) | http://localhost:5173 |
| Backend (Socket.io) | http://localhost:3001 |

---

## Despliegue

### Backend

```bash
cd apps/backend

# Producción
pnpm build
pnpm start          # node dist/server.js

# Desarrollo (watch mode)
pnpm dev
```

El backend usa puerto **3001** por defecto. Configurable vía `PORT`.

### Web

```bash
cd apps/web

# Build de producción
pnpm build          # genera dist/

# Previsualizar build local
pnpm preview

# Servir con cualquier servidor estático
npx serve dist
```

El frontend se conecta al backend definido en `VITE_API_URL` (por defecto `http://localhost:3001`).

```bash
# Ejemplo con entorno de producción
VITE_API_URL=https://api.tu-dominio.com pnpm build
```

---

## PWA (Progressive Web App)

La app web incluye soporte PWA fuera de caja mediante `vite-plugin-pwa`.

```bash
cd apps/web
pnpm build
```

Durante el build se generan los assets del service worker (`dist/sw.js`, `dist/workbox-*`).

#### Instalar en dispositivo

1. Abrir la app en un navegador moderno (Chrome, Edge, Firefox, Safari).
2. En móvil: aparece el banner "Instalar app" o usar **Añadir a pantalla de inicio**.
3. En desktop: hacer clic en el icono de instalación en la barra de direcciones o en el menú del navegador.

El service worker facilita:
- Funcionamiento offline (caché de assets)
- Actualizaciones automáticas en background

Para forzar una actualización manual después de un deploy, basta con recargar la página.

---

## Flujo del Juego

```
┌─────────────────────────────────────────────────────────┐
│                    PANTALLA INICIAL                      │
│  Crear Sala ──────────────────────────────────────────► │
│  Unirse con código ────────────────────────────────────► │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      SALA (LOBBY)                        │
│  Se muestra código de sala para compartir               │
│  Host: "Iniciar Partida" (mín. 2 jugadores)            │
│  Jugadores esperan mientras el host no inicie          │
│  Cualquiera puede "Abandonar Sala"                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ (host inicia)
┌─────────────────────────────────────────────────────────┐
│                   ARENA DE JUEGO                         │
│  Se alternan turnos entre jugadores                     │
│  En tu turno: pulsar "Robar Carta"                      │
│  Al robar: se muestra carta con ventaja de casa         │
│  Cartas jugadas van a la pila de descarte               │
│  La partida termina cuando no quedan cartas             │
└─────────────────────────────────────────────────────────┘
```

#### Eventos Socket

| Evento | Dir | Descripción |
|---|---|---|
| `room:create` | C→S | Crear sala |
| `room:join` | C→S | Unirse a sala con código |
| `game:start` | C→S | Host inicia la partida |
| `game:draw` | C→S | Robar una carta |
| `room:leave` | C→S | Salirse de la sala |
| `game:terminate` | C→S | Host termina la sesión |
| `room:created` | S→C | Sala creada, datos del jugador |
| `room:joined` | S→C | Unirse exitoso |
| `player:joined` | S→C | Otro jugador entró a la sala |
| `player:left` | S→C | Jugador abandonó la sala |
| `host:changed` | S→C | Nuevo anfitrión asignado |
| `game:started` | S→C | La partida comenzó |
| `card:drawn` | S→C | Carta robada (para todos) |
| `session:terminated` | S→C | Sesión terminada por el host |
| `error` | S→C | Error del servidor |

---

## Estructura del Proyecto

```
partybooster-hpe/
├── apps/
│   ├── backend/           # Fastify + Socket.io
│   │   └── src/
│   │       ├── domain/           # deck-manager, turn-manager, room-manager
│   │       └── infrastructure/   # socket handlers, persistence
│   └── web/               # React + Vite
│       └── src/
│           ├── components/      # UI components
│           ├── pages/           # Screen components
│           ├── store/           # Zustand store
│           └── services/        # Socket client
├── packages/
│   └── shared/            # Tipos compartidos (Player, Card, GameState, etc.)
├── data/                  # Cartas (JSON)
├── turbo.json
└── pnpm-workspace.yaml
```