# JDPCMERIS Architecture

## System Overview

JDPCMERIS is organized as a MERN platform:

- React frontend for ministry dashboards, project workflows, GIS mapping, reports, admin, and public portal.
- Express API for authentication, authorization, project coordination, reporting, monitoring, documents, and audit logs.
- MongoDB for operational records, project locations, workflow state, evidence, and reporting aggregates.
- JWT access and refresh tokens for stateless authentication.
- RBAC and data scoping for ministry, district, region, donor, partner, and public access boundaries.

## Backend Layers

- `routes`: HTTP endpoints grouped by domain.
- `models`: MongoDB schemas and indexes.
- `middleware`: authentication, authorization, validation, error handling, scope enforcement.
- `security`: role and permission definitions.
- `services`: cross-cutting business services such as audit logging.

## Frontend Layers

- `views`: route-level screens.
- `ui`: shared interface components.
- `api`: API client and temporary demo data.
- `router.jsx`: application route map.

## Data Access Rules

- Super Admin and Planning Admin can access all projects.
- Ministry users are scoped to their ministry.
- District officers are scoped to assigned district.
- Regional officers are scoped to assigned region.
- Donors are scoped to funded projects.
- Implementing partners are scoped to assigned partner projects.
- Public users only see approved public projects.

## Deployment Shape

Recommended production deployment:

- Nginx terminates TLS and serves the React build.
- Node.js API runs behind Nginx on an internal port.
- MongoDB runs as a managed cluster or hardened VPS service.
- Keep MongoDB TLS certificate validation enabled in production. `MONGODB_TLS_ALLOW_INVALID_CERTS=true` exists only for local development machines with broken CA chains.
- Uploaded files use Cloudflare R2 object storage in production, with local storage fallback for development.
- Scheduled backups should cover MongoDB, uploaded evidence, and environment configuration.
