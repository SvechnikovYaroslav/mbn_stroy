/**
 * Yandex Object Storage (S3-compatible) is used only when credentials exist.
 * Local development without these env vars keeps Payload local uploads.
 */
export function isS3Enabled(): boolean {
  return Boolean(
    process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim()
  );
}

export function getS3Endpoint(): string {
  return (
    process.env.S3_ENDPOINT?.trim() || "https://storage.yandexcloud.net"
  );
}

export function getS3Region(): string {
  return process.env.S3_REGION?.trim() || "ru-central1";
}

export function getS3Bucket(): string {
  return process.env.S3_BUCKET?.trim() || "";
}
