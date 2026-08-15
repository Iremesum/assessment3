import { RequestLog } from '@/app/lib/sequelize';

type LogRequestParams = {
  feedId?: number | null;
  clientId?: string | null;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
};

export async function logRequest({
  feedId = null,
  clientId = null,
  endpoint,
  statusCode,
  responseTimeMs,
}: LogRequestParams) {
  try {
    await RequestLog.create({
      feedId,
      clientId,
      endpoint,
      statusCode,
      responseTimeMs,
    });
  } catch (error) {
    console.error('Failed to write request log:', error);
  }
}