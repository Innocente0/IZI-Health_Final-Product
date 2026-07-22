# API Smoke Tests

Use these checks after every deployment.

Set the backend URL:

```bash
BACKEND_URL=https://izi-health-backend.onrender.com
```

## Health

```bash
curl "$BACKEND_URL/api/health"
curl "$BACKEND_URL/api/db-health"
```

Expected result: both return a healthy status.

## Register

```bash
curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test-user@example.com","password":"test12345"}'
```

Expected result: `201` with a `token` and a user object without a password.

## Login

```bash
curl -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-user@example.com","password":"test12345"}'
```

Expected result: `200` with a `token` and a user object without a password.

## Authenticated Health Log

Replace `TOKEN` with the login token.

```bash
curl -X POST "$BACKEND_URL/api/health-logs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"gender":"Female","age":35,"glucose":120,"bmi":24,"HbA1c_level":5.4,"hypertension":0,"heart_disease":0,"smoking_history":"never"}'
```

Expected result: `201` with the saved health log.

## Chatbot

```bash
curl -X POST "$BACKEND_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"question":"What are diabetes symptoms?"}'
```

Expected result: `200` with an answer. If ML is slow, the backend should return a safe fallback instead of hanging indefinitely.
