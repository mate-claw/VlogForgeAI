import fs from 'node:fs';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config, publicUrlFor } from '../config';

const mimeByExt: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
};

let s3Client: S3Client | undefined;
function getS3() {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: config.s3Endpoint || undefined,
      region: config.s3Region,
      forcePathStyle: config.s3ForcePathStyle,
      credentials: config.s3AccessKeyId ? {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      } : undefined,
    });
  }
  return s3Client;
}

function publicObjectUrl(key: string) {
  if (config.storagePublicBaseUrl) return `${config.storagePublicBaseUrl.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`;
  if (config.s3Endpoint) return `${config.s3Endpoint.replace(/\/$/, '')}/${config.s3Bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  return `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function publishJobFile(params: { jobId: string; jobDir: string; fileName: string; contentType?: string }) {
  const filePath = path.resolve(params.jobDir, params.fileName);
  if (!fs.existsSync(filePath)) throw new Error(`待发布文件不存在：${filePath}`);
  if (config.storageDriver === 's3') {
    if (!config.s3Bucket) throw new Error('STORAGE_DRIVER=s3 需要配置 S3_BUCKET');
    const key = `jobs/${params.jobId}/${params.fileName}`;
    const contentType = params.contentType || mimeByExt[path.extname(params.fileName).toLowerCase()] || 'application/octet-stream';
    await getS3().send(new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: contentType,
    }));
    return publicObjectUrl(key);
  }
  return publicUrlFor(`storage/jobs/${params.jobId}/${encodeURIComponent(params.fileName)}`);
}
