# API Structure

Base path: `/api/v1`

## Authentication

- `POST /auth/login`: returns user, access token, and refresh token.
- `GET /auth/me`: returns current authenticated user.

## Dashboard

- `GET /dashboard`: returns project status counts, ministry counts, region counts, and total budget scoped to the current user.

## Reference Data

- `GET /reference/ministries`
- `GET /reference/regions`
- `GET /reference/districts`
- `GET /reference/donors`
- `GET /reference/partners`
- `POST /reference/:resource`: restricted to administrative roles.

## Projects

- `GET /projects`: list scoped projects, with optional `q` search and `limit`.
- `POST /projects`: create project.
- `GET /projects/:id`: read scoped project.
- `PATCH /projects/:id`: update, approve, or verify scoped project depending on permissions.
- `GET /projects/:projectId/documents`: list project documents.
- `POST /projects/:projectId/documents`: upload a document/photo/video to Cloudflare R2 or local fallback storage.

## Public Portal

- `GET /public/projects`: list approved public projects without confidential fields.

## Planned Next Endpoints

- `POST /auth/refresh`
- `POST /projects/:id/submit`
- `POST /projects/:id/approve`
- `POST /projects/:id/return`
- `POST /projects/:id/monitoring`
- `GET /reports/ministry`
- `GET /reports/region`
- `GET /reports/donor`
- `GET /audit-logs`
- `GET /notifications`
