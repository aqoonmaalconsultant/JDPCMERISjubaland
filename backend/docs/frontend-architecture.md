# Frontend Architecture

## Routes

- `/`: executive dashboard.
- `/projects`: project registry and progress overview.
- `/map`: GIS map dashboard with filters and project pins.
- `/reports`: report export surface.
- `/admin`: role and user administration shell.
- `/public`: public portal preview.

## UI Principles

- Dense operational layout for repeated government workflows.
- Clear project status and progress scanning.
- GIS-first project visibility.
- Role-aware navigation can be added from the authenticated user object.
- React Query is included for server state once live endpoints are connected.

## API Integration

`src/api/client.js` defines the Axios client and automatically attaches the stored access token. Current screens use mock data so the frontend can be reviewed before MongoDB and seed data are configured.
