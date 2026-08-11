# R2 Bucket Configuration

This directory contains configuration and setup scripts for Cloudflare R2 buckets.

## Buckets

### 1. Assets Bucket (`spreadsheet-moment-assets`)
Stores static assets including:
- User avatars
- Template thumbnails
- Forum images
- Public files

**Binding:** `ASSETS`

### 2. Uploads Bucket (`spreadsheet-moment-uploads`)
Stores user-uploaded files including:
- Spreadsheet attachments
- Exported files
- Temporary uploads
- Private user files

**Binding:** `UPLOADS`

## Setup Instructions

### Create Buckets

```bash
# Create assets bucket
wrangler r2 bucket create spreadsheet-moment-assets

# Create uploads bucket
wrangler r2 bucket create spreadsheet-moment-uploads
```

### Upload Initial Assets

```bash
# Upload placeholder images
wrangler r2 object put spreadsheet-moment-assets/avatars/default.png --file=../assets/default-avatar.png

# List bucket contents
wrangler r2 object list spreadsheet-moment-assets
```

### Configure CORS

Create a CORS configuration file `cors.json`:

```json
{
  "AllowedOrigins": ["https://spreadsheetmoment.com", "https://*.spreadsheetmoment.com"],
  "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 86400
}
```

Apply CORS configuration:

```bash
wrangler r2 bucket cors put spreadsheet-moment-assets --config=cors.json
```

### Lifecycle Rules

Create lifecycle rules to manage object retention:

```bash
# Delete objects in uploads/ after 30 days
wrangler r2 bucket lifecycle put spreadsheet-moment-uploads --file=lifecycle.json
```

Example `lifecycle.json`:

```json
{
  "Rules": [
    {
      "ID": "DeleteTempUploads",
      "Filter": {
        "Prefix": "temp/"
      },
      "Status": "Enabled",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

## Usage in Workers

### Upload File

```typescript
export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  file: File,
  metadata?: Record<string, string>
): Promise<string> {
  await bucket.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: metadata,
  });

  return key;
}
```

### Get File

```typescript
export async function getFile(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return await bucket.get(key);
}
```

### Delete File

```typescript
export async function deleteFile(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}
```

### Generate Signed URL

```typescript
import { R2Bucket } from '@cloudflare/workers-types';

export async function generateSignedUrl(
  bucket: R2Bucket,
  key: string,
  expiration: number = 3600
): Promise<string> {
  // Use Cloudflare's Worker signatures or implement your own
  const url = new URL(bucket.name);
  url.pathname = key;
  url.searchParams.set('expires', String(Date.now() + expiration * 1000));

  return url.toString();
}
```

## Best Practices

1. **Use prefixes to organize objects:**
   - `avatars/{userId}.png`
   - `thumbnails/{templateId}.png`
   - `uploads/{userId}/{timestamp}.xlsx`

2. **Set appropriate content types:**
   ```typescript
   httpMetadata: {
     contentType: 'image/png',
     cacheControl: 'public, max-age=31536000',
   }
   ```

3. **Use custom metadata for filtering:**
   ```typescript
   customMetadata: {
     userId: 'user-123',
     uploadedAt: '2024-01-01T00:00:00Z',
     originalName: 'document.xlsx',
   }
   ```

4. **Implement cleanup for temporary uploads:**
   - Use lifecycle rules
   - Schedule periodic cleanup Workers

5. **Monitor usage:**
   ```bash
   wrangler r2 bucket head spreadsheet-moment-assets
   ```
