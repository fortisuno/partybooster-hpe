# Partybooster - Harry Potter Edition.

## Monorepo Structure

```
partybooster-hpe/
├── apps/backend/        # Fastify + Socket.io server
├── packages/shared/    # Common types, constants, card logic
├── data/               # Card JSON data (harry_potter_cards.json)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

This starts the backend server on port **3001**.

## Turborepo Pipelines

- `pnpm build` — Builds all packages and apps (shared first, then backend)
- `pnpm dev` — Runs the backend in watch mode (persistent)
- `pnpm typecheck` — Runs TypeScript type checking across all packages

## Architecture

### Packages

- `@partybooster/shared` — TypeScript interfaces (`GameState`, `Player`, `Card`), constants, and card factory

### Apps

- `@partybooster/backend` — Hexagonal backend with:
  - **Domain layer**: `deck-manager.ts`, `turn-manager.ts`, `room-manager.ts`, `grace-period.ts`
  - **Infrastructure**: Socket.io handlers, in-memory persistence

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `room:create` | Client → Server | Create a new room |
| `room:join` | Client → Server | Join an existing room |
| `game:start` | Client → Server | Host starts the game |
| `game:draw` | Client → Server | Draw a card (disposable) |
| `game:terminate` | Client → Server | Host terminates session |
| `player:reconnect` | Client → Server | Reconnect within grace period |
| `player:offline` | Server → Client | Player went offline |
| `player:joined` | Server → Client | New player joined room |
| `card:drawn` | Server → Client | Card drawn event |
| `session:terminated` | Server → Client | Session ended |
| `error` | Server → Client | Error occurred |