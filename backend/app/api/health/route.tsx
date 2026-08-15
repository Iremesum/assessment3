import { NextResponse } from 'next/server';
import { sequelize } from '@/app/lib/sequelize';
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
  return tracer.startActiveSpan('GET /api/health', async (span) => {
    const startTime = Date.now();

    try {
      await sequelize.authenticate();

      const responseTimeMs = Date.now() - startTime;

      span.setAttribute('health.database_connected', true);
      span.setAttribute('http.response_time_ms', responseTimeMs);

      return NextResponse.json(
        {
          status: 'ok',
          database: 'connected',
          responseTimeMs,
        },
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } catch (error) {
      console.error('Health check failed:', error);

      if (error instanceof Error) {
        span.recordException(error);
      }

      span.setAttribute('health.database_connected', false);

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message:
          error instanceof Error ? error.message : 'Unknown error',
      });

      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          responseTimeMs: Date.now() - startTime,
        },
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    } finally {
      span.end();
    }
  });
}