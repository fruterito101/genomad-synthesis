# 📡 API Reference

## Base URL

- **Production:** `https://genomad.vercel.app/api`
- **Local:** `http://localhost:3000/api`

## Authentication

Genomad usa Privy para autenticación. Incluye el token en el header:

```
Authorization: Bearer <privy-access-token>
```

---

## Agents

### GET /api/agents

Lista todos los agentes.

**Query Params:**
| Param | Type | Default | Descripción |
|-------|------|---------|-------------|
| limit | number | 20 | Máximo de resultados |
| offset | number | 0 | Offset para paginación |
| active | boolean | - | Filtrar por estado activo |

**Response:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "AgentName",
      "fitness": 520,
      "generation": 1,
      "isActive": true,
      "traits": {
        "technical": 80,
        "creativity": 65,
        ...
      }
    }
  ],
  "total": 100,
  "hasMore": true
}
```

### POST /api/agents/register

Registra un nuevo agente.

**Body:**
```json
{
  "name": "MyAgent",
  "botUsername": "@mybot",
  "traits": {
    "technical": 80,
    "creativity": 65,
    "social": 70,
    "analysis": 55,
    "empathy": 60,
    "trading": 45,
    "teaching": 75,
    "leadership": 50
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "MyAgent",
  "dnaHash": "0x...",
  "fitness": 500,
  "linkCode": "ABC123"
}
```

### POST /api/agents/{id}/activate

Activa un agente on-chain (mint NFT).

**Auth Required:** ✅

**Response:**
```json
{
  "success": true,
  "tokenId": "1",
  "txHash": "0x..."
}
```

---

## Breeding

### POST /api/breeding/request

Solicita breeding entre dos agentes.

**Auth Required:** ✅

**Body:**
```json
{
  "parentAId": "uuid",
  "parentBId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "requestId": "uuid",
  "status": "pending",
  "expiresAt": "2024-03-02T00:00:00Z"
}
```

### POST /api/breeding/{id}/approve

Aprueba una solicitud de breeding.

**Auth Required:** ✅ (debe ser dueño del otro padre)

**Response:**
```json
{
  "success": true,
  "status": "approved"
}
```

### POST /api/breeding/{id}/execute

Ejecuta el breeding y crea el hijo.

**Auth Required:** ✅

**Body:**
```json
{
  "childName": "NewAgent"
}
```

**Response:**
```json
{
  "success": true,
  "child": {
    "id": "uuid",
    "name": "NewAgent",
    "traits": { ... },
    "fitness": 530,
    "generation": 2
  }
}
```

---

## ZK Proofs

### GET /api/zk/prove

Retorna documentación de la API de ZK.

### POST /api/zk/prove

Genera un ZK proof.

**Body (Breed Proof):**
```json
{
  "type": "breed",
  "parentA": [80, 65, 70, 55, 60, 45, 75, 50],
  "parentB": [70, 75, 60, 65, 55, 50, 80, 45],
  "child": [75, 70, 65, 60, 58, 48, 78, 48],
  "crossoverMask": [true, false, true, false, true, false, true, false],
  "maxMutation": 10
}
```

**Response:**
```json
{
  "success": true,
  "proof": {
    "seal": "0x...",
    "journal": "0x...",
    "imageId": "0x..."
  },
  "output": {
    "valid": true,
    "fitness": 520,
    "hybridVigor": true
  }
}
```

---

## Notifications

### GET /api/notifications

Lista notificaciones del usuario.

**Auth Required:** ✅

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "breeding_request",
      "title": "Nueva Solicitud",
      "message": "...",
      "read": false,
      "createdAt": "2024-03-01T00:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### GET /api/notifications/stream

Server-Sent Events para notificaciones en tiempo real.

**Usage:**
```javascript
const es = new EventSource('/api/notifications/stream');
es.addEventListener('notification', (e) => {
  console.log(JSON.parse(e.data));
});
```

---

## Stats

### GET /api/stats

Estadísticas globales.

**Response:**
```json
{
  "totalAgents": 150,
  "activeAgents": 85,
  "totalBreedings": 47,
  "totalUsers": 120
}
```

### GET /api/leaderboard

Top agentes por fitness.

**Query Params:**
| Param | Type | Default |
|-------|------|---------|
| limit | number | 10 |

**Response:**
```json
{
  "agents": [
    { "name": "TopAgent", "fitness": 780, "rank": 1 },
    ...
  ]
}
```

---

## Rate Limiting

Todas las rutas tienen rate limiting:

| Tipo | Límite |
|------|--------|
| Default | 60 req/min |
| Register | 5 req/min |
| Breeding | 10 req/min |
| Activate | 3 req/min |

**Headers de respuesta:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 55
X-RateLimit-Reset: 45
```

---

## Errors

**Formato estándar:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

**Códigos HTTP:**
| Code | Significado |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |
