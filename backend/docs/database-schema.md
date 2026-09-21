# MongoDB Schema Summary

## User

Stores identity, role, permissions, activation state, and optional ministry, region, district, donor, or partner scope references.

## Ministry

Stores government ministry name, code, minister, director general, and contact information.

## Region and District

Stores Jubaland administrative geography. Districts are linked to regions and uniquely indexed by region plus name/code.

## Donor and Partner

Stores funding organizations and implementing partners, including contact information and organization type.

## Project

Central operational record for development projects:

- Project identity, code, description, objectives, and outcomes.
- Ministry, donor, partner, contractor, sector.
- Budget, currency, start and end dates.
- Status and approval workflow stage.
- Public/internal/confidential visibility.
- One or more GPS-enabled locations.
- Beneficiary counts.
- Physical, financial, and timeline progress.
- Traffic-light status, risks, challenges, recommendations.
- Created and updated user references.

Indexes support text search, status by ministry/donor, and location filtering.

## MonitoringReport

Stores submitted field monitoring evidence with progress percentages, findings, risks, recommendations, submitter, and verifier.

## Document

Stores document metadata for contracts, agreements, reports, photos, videos, and completion certificates. The actual file can live in local storage or cloud storage.

## AuditLog

Stores user, action, timestamp, entity, previous value, new value, IP address, and user agent for accountability.
