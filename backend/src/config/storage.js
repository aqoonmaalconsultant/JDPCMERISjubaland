import { S3Client } from '@aws-sdk/client-s3';

export function getStorageConfig() {
  const cloudflare = {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || ''
  };

  return {
    provider: process.env.FILE_STORAGE_PROVIDER || 'local',
    localUploadDir: process.env.LOCAL_UPLOAD_DIR || 'uploads',
    publicBaseUrl: process.env.PUBLIC_FILE_BASE_URL || '',
    cloudflare,
    isCloudflareReady: Boolean(cloudflare.accountId && cloudflare.bucket && cloudflare.accessKeyId && cloudflare.secretAccessKey)
  };
}

export function createR2Client() {
  const config = getStorageConfig().cloudflare;

  if (!config.accountId || !config.bucket || !config.accessKeyId || !config.secretAccessKey) {
    throw new Error('Cloudflare R2 credentials are required');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
}
