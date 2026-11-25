# Runtime Validation Report

**Generated**: 2026-11-25T20:49:49.7227021Z
**Target**: `C:\Users\Matheus\LEC\lec`

## Summary

| Step | Status | Exit Code | Details |
|---|---|---:|---|
| Docker Compose startup | PASS | 0 | PostgreSQL, API and Angular frontend started; API became healthy and `/v1/health` returned 200. Spring Boot startup log: 11.208s. |
| PostgreSQL migrations | PASS | 0 | Flyway applied 2 migrations; database contains 11 questions and 4 classification groups. |
| Backend tests | PASS | 0 | 4 Maven tests: 2 controller, 1 Spring application-context, 1 service; 0 failures, 0 errors, 0 skipped. |
| Browser E2E | PASS | 0 | 3 Playwright journeys passed against the Docker frontend, API and PostgreSQL. |

**Overall**: PASS

## Environment

- Docker: AVAILABLE — `docker info` reported server 29.6.1.
- Node.js: AVAILABLE — v24.20.0.
- Playwright: AVAILABLE — v1.65.1 with Chromium installed.
- Infrastructure tier: PRIMARY (Docker Compose + real PostgreSQL 16.16).
- Browser tier: PRIMARY (Playwright).
- No fallback was used.

## Startup and API checks

- Command: `docker compose --project-name lec-integration --env-file .env.example up --build -d`
- Readiness: API container healthy; `GET /v1/health` returned `{"status":"UP"}` (200).
- `GET /v1/questions` returned 11 catalog questions (200).
- `GET /v1/classification-groups` returned 4 groups (200).
- Frontend at `http://localhost:4201` returned 200.
- Database check after E2E cleanup: 2 successful Flyway migrations, 11 questions, 4 groups, 0 LEC test records.

## Test evidence

### Backend

Tests ran from the Maven build image against the Compose PostgreSQL service:

```powershell
docker run --rm --network lec-integration_default `
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/lec_db `
  -e SPRING_DATASOURCE_USERNAME=lec_user `
  -e SPRING_DATASOURCE_PASSWORD=dev-password-change-me `
  -e FRONTEND_ORIGIN=http://localhost:4201 `
  lec-integration-test:local ./mvnw test
```

Result: exit code 0; `LecControllerTest` 2/2, `LecApplicationTests` 1/1,
`LecServiceTest` 1/1.

### Browser E2E

Command: `npm test` from `lec-frontend`; exit code 0; 3 passed, 0 failed.

| Test | Journey verified |
|---|---|
| `create-edit-persist.spec.ts` | Create a LEC, reload and verify persistence, edit, reload again, delete. |
| `invalid-submit.spec.ts` | Attempt to submit a draft without required classification fields; verify validation; delete. |
| `review-workflow.spec.ts` | Persist a comment, return for changes, resubmit, approve, and delete. |

The browser tests exercise the SPA, Nginx `/api` proxy, REST API and real PostgreSQL. Authentication-failure testing is not applicable: the user confirmed this application has no authentication and requested removal of login/profile features.

## Known gaps

- The AI assistant remains disabled because no AI provider or credentials are configured in the project.
- Operations are unauthenticated by explicit user decision; do not expose the service publicly without adding authentication and authorization.
- A host-side Maven invocation stalled while contacting the configured SERPRO Nexus. The test suite completed successfully inside the Docker build image; no infrastructure or browser capability was downgraded.
