# Cloudflare R2 File Storage

JDPCMERIS supports Cloudflare R2 for contracts, agreements, reports, photos, videos, and completion certificates.

## Environment Variables

```env
FILE_STORAGE_PROVIDER=cloudflare-r2
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_R2_BUCKET=jdpcmeris-files
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_R2_PUBLIC_BASE_URL=https://files.example.gov.so
```

Use `FILE_STORAGE_PROVIDER=local` for development without Cloudflare credentials.

## Upload Endpoint

`POST /api/v1/projects/:projectId/documents`

Form data:

- `title`: document title.
- `category`: Contract, Agreement, Report, Photo, Video, Completion Certificate, or Other.
- `file`: uploaded file.

The backend stores the file in this object key pattern:

`projects/:projectId/YYYY-MM-DD/:uuid-original-file-name`

The `Document` collection stores file metadata, Cloudflare/local storage type, object key, URL, uploader, and project reference.
