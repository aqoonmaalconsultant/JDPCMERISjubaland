# Backend API Modules

## Authentication

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Settings

- `GET /api/v1/settings/public`
- `GET /api/v1/settings`
- `POST /api/v1/settings`

## Projects

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `PATCH /api/v1/projects/:id`
- `POST /api/v1/projects/:id/workflow`
- `PATCH /api/v1/projects/:id/beneficiaries`
- `PATCH /api/v1/projects/:id/locations`

## Monitoring, Documents, GIS

- `GET /api/v1/projects/:projectId/monitoring`
- `POST /api/v1/projects/:projectId/monitoring`
- `GET /api/v1/projects/:projectId/documents`
- `POST /api/v1/projects/:projectId/documents`
- `GET /api/v1/documents`
- `GET /api/v1/gis/projects.geojson`
- `GET /api/v1/gis/heatmap`

## Reports and Notifications

- `GET /api/v1/reports/summary`
- `GET /api/v1/reports/projects.csv`
- `GET /api/v1/reports/projects.xlsx`
- `GET /api/v1/reports/projects.pdf`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/digest`

## Administration

- `GET /api/v1/users`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`
- `GET /api/v1/audit-logs`
- `GET /api/v1/reference/:resource`
- `POST /api/v1/reference/:resource`
