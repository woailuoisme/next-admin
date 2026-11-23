import { createUploadRoute, r2Storage, s3Storage } from "@uploadcn/server";
import { clamavScanner, virusTotalScanner } from "@uploadcn/server/scan";

type UploadPostHandler = (request: Request) => Promise<Response>;

let cachedPostHandler: UploadPostHandler | null = null;

function createStorageFromEnv() {
  if (process.env.R2_ACCOUNT_ID) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucket = process.env.R2_BUCKET;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!bucket || !accessKeyId || !secretAccessKey) {
      return null;
    }
    return r2Storage({
      accountId,
      bucket,
      accessKeyId,
      secretAccessKey,
      publicUrl: process.env.R2_PUBLIC_URL,
    });
  }

  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return s3Storage({
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint: process.env.S3_ENDPOINT || undefined,
    publicUrl: process.env.S3_PUBLIC_URL,
  });
}

function getScanConfig() {
  if (process.env.CLAMAV_HOST) {
    return {
      scanner: clamavScanner({
        host: process.env.CLAMAV_HOST,
        port: Number(process.env.CLAMAV_PORT || 3310),
      }),
      // Fail closed: files clamd can't scan are removed.
      onUnknown: "reject" as const,
    };
  }

  if (process.env.VIRUSTOTAL_API_KEY) {
    return {
      scanner: virusTotalScanner({ apiKey: process.env.VIRUSTOTAL_API_KEY }),
      // Hash lookups only know files VirusTotal has seen; allow the rest.
      onUnknown: "allow" as const,
    };
  }

  return undefined;
}

function getUploadPostHandler(): UploadPostHandler | null {
  if (cachedPostHandler) return cachedPostHandler;

  const storage = createStorageFromEnv();
  if (!storage) return null;

  const { POST } = createUploadRoute({
    storage,
    maxFileSize: 5 * 1024 ** 3,
    scan: getScanConfig(),
    async authorize() {
      // Authenticate the request here and throw `UploadRouteError` to deny:
      // const session = await auth()
      // if (!session) throw new UploadRouteError("Unauthorized", 401)
      // return { userId: session.user.id }
    },
    async onUploadComplete({ key, url, file }) {
      // Persist metadata, start processing…
      return { key, url, name: file.name };
    },
  });

  cachedPostHandler = POST;
  return cachedPostHandler;
}

/**
 * 惰性创建上传路由处理器，避免 Next.js 构建期在无运行时 S3/R2 密钥时模块顶层初始化失败。
 */
export async function POST(request: Request): Promise<Response> {
  const handler = getUploadPostHandler();
  if (!handler) {
    return Response.json(
      { error: "Upload storage is not configured. Set S3_* or R2_* environment variables." },
      { status: 503 },
    );
  }
  return handler(request);
}
