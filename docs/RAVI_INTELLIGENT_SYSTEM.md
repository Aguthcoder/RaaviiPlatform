# Ravi Intelligent Platform - Architecture & Implementation

## 1. System Architecture Overview

Ravi uses a hybrid **Web + Telegram** architecture with event-driven orchestration:

- **NestJS Backend**: source of truth for domain entities, API, webhooks, queue jobs.
- **AI Engine (Python/FastAPI)**: vectorization + clustering + cosine scoring.
- **Telegram Bot (Aiogram/FastAPI)**: FSM onboarding, adaptive questions, invite/reminder/feedback delivery.
- **n8n**: orchestrates ingestion → normalization → enrichment → vectorization → matching → action execution.
- **PostgreSQL + pgvector**: transactional + vector-ready persistence.
- **Redis**: FSM storage, caching layer, and rate limiting state.

## 2. Folder Structures

```text
backend/src/modules/
  matching/
  bot-integration/
  webhook/
  redis/
  queue/

ai-engine/
  app/main.py
  requirements.txt
  Dockerfile

telegram-bot/
  app/main.py
  app/fsm/states.py
  app/handlers/onboarding.py
  app/middleware/{auth,logging,rate_limit}.py
  requirements.txt
  Dockerfile

n8n/workflows/
  ravi-smart-matching-workflow.json

scripts/
  setup.sh
  migrate.sh
  seed.sh
  bot-start.sh
  n8n-init.sh
```

## 3. Key Implementation Notes

### Telegram smart bot
- FSM stages: `waiting_name -> waiting_city -> waiting_personality -> waiting_interests -> adaptive_followup -> complete`.
- Redis usage:
  - `RedisStorage` for FSM persistence.
  - user profile cache key: `bot:user:<telegramId>:profile`.
  - rate limit key: `bot:rl:<telegramId>`.
- Middleware:
  - `AuthMiddleware` for allowlist pattern support.
  - `LoggingMiddleware` for event telemetry.
  - `RateLimitMiddleware` for anti-spam throttling.
- Webhooks:
  - Telegram webhook endpoint: `/webhook/telegram`.
  - Internal trusted endpoints: `/internal/invite`, `/internal/reminder`, `/internal/feedback`.

### Matching engine
- Inputs: profile + event metadata.
- Techniques:
  - binary vectorization on interests/personality/event type.
  - `KMeans` clustering of user vectors.
  - cosine similarity for interests/personality/eventType scores.
- Output per user:
  - `personalityScore`, `interestsScore`, `cityScore`, `eventTypeScore`, `finalScore`.
  - `scoringExplanation` and `scoringBreakdown` for explainability.

### Backend optimization
- `MatchingModule` calls AI engine and persists to `GroupMatchEntity`.
- `BotIntegrationModule` dispatches invites to bot service with shared-secret protection.
- `WebhookModule` receives n8n and bot callbacks and routes matching jobs.
- `RedisModule` provides cache abstraction.
- `QueueModule` provides async execution via BullMQ worker model.

## 4. n8n 6-Step Workflow Diagrams (textual)

### Global pipeline
`Webhook Trigger -> Normalize Function -> AI Enrichment HTTP -> Vectorization Function -> Backend Matching Webhook -> Action Switch`

### Trigger-specific workflows
1. **On event creation**: payload type `event.created` triggers full matching for all profiles.
2. **On reservation**: payload type `reservation.created` triggers incremental matching for one user.
3. **On group completion**: payload type `group.completed` triggers post-group invite distribution.
4. **Before event**: payload type `before_event` triggers reminder endpoint.
5. **After event**: payload type `after_event` triggers feedback endpoint.

## 5. Data Schemas between n8n Nodes

### Ingestion payload
```json
{
  "type": "reservation.created",
  "eventId": "uuid",
  "userId": "uuid",
  "payload": {}
}
```

### Normalized payload
```json
{
  "type": "reservation.created",
  "eventId": "uuid",
  "userId": "uuid|null",
  "payload": {}
}
```

### Matching request (backend webhook)
```json
{
  "type": "reservation.created",
  "eventId": "uuid",
  "userId": "uuid"
}
```

## 6. Operations setup

Use scripts in `/scripts`:
- `setup.sh`: boot infrastructure and dependencies.
- `migrate.sh`: run NestJS migrations.
- `seed.sh`: seed baseline data.
- `bot-start.sh`: start bot service in dev mode.
- `n8n-init.sh`: import n8n workflows.
