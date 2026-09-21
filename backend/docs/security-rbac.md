# Security and RBAC

## Roles

- Super Admin
- Planning Admin
- Ministry Focal Point
- Ministry Director
- M&E Officer
- District Officer
- Regional Officer
- Donor User
- NGO / Implementing Partner
- Public User

## Enforcement

The backend uses two checks:

- Permission checks decide whether a user may perform an action.
- Scope checks decide which records a user may see or modify.

Every sensitive data mutation should write an audit log entry. Project creation and project update are already wired to the audit service.

## Production Hardening Checklist

- Rotate strong JWT secrets.
- Add refresh-token storage and revocation.
- Enforce HTTPS-only cookies if tokens are moved from local storage.
- Add field-level redaction for confidential project fields.
- Add malware scanning for uploaded files.
- Add immutable audit export for compliance.
