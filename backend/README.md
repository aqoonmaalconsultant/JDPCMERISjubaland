# JDPCMERIS Backend Setup

## Requirements

- Node.js 18+
- MongoDB
- A frontend running on `http://localhost:5173` or update `CORS_ORIGIN`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and update secrets:

```bash
copy .env.example .env
```

3. Seed Jubaland reference data, admin user, sample projects, evaluations, indicators, and financial transactions:

```bash
npm run seed
```

4. Start the API:

```bash
npm run dev
```

Default API URL: `http://localhost:5000/api/v1`

Default seeded admin:

- Email: value of `SEED_ADMIN_EMAIL`
- Password: value of `SEED_ADMIN_PASSWORD`

## Storage

Set `FILE_STORAGE_PROVIDER=cloudflare-r2` for Cloudflare R2, or `FILE_STORAGE_PROVIDER=local` for local uploads.

Cloudflare R2 uses:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`
