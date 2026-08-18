import { NextResponse } from 'next/server';
import { Op, fn, col } from 'sequelize';
import { RequestLog } from '@/app/lib/sequelize';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('assessment3-backend');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  return tracer.startActiveSpan('GET /api/count', async (span) => {
    const startTime = Date.now();

    try {
      const totalRequests = await RequestLog.count();

      const failedRequests = await RequestLog.count({
        where: {
          statusCode: {
            [Op.gte]: 400,
          },
        },
      });

      const uniqueClients = await RequestLog.count({
        distinct: true,
        col: 'clientId',
        where: {
          clientId: {
            [Op.ne]: null,
          },
        },
      });

      const averageResponse = await RequestLog.findOne({
        attributes: [
          [fn('AVG', col('responseTimeMs')), 'averageResponseTimeMs'],
        ],
        raw: true,
      });

      const averageResponseTimeMs = Number(
        (averageResponse as { averageResponseTimeMs?: number | string | null } | null)
    ?.averageResponseTimeMs ?? 0
      );

      span.setAttribute('metrics.total_requests', totalRequests);
      span.setAttribute('metrics.failed_requests', failedRequests);
      span.setAttribute('metrics.unique_clients', uniqueClients);
      span.setAttribute(
        'metrics.average_response_time_ms',
        averageResponseTimeMs
      );
      span.setAttribute(
        'http.response_time_ms',
        Date.now() - startTime
      );

      return NextResponse.json(
        {
          totalRequests,
          failedRequests,
          uniqueClients,
          averageResponseTimeMs,
        },
        {
          headers: corsHeaders,
        }
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        span.recordException(error);
      }

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message:
          error instanceof Error ? error.message : 'Unknown error',
      });

      return new NextResponse('Server error', {
        status: 500,
        headers: corsHeaders,
      });
    } finally {
      span.end();
    }
  });
}