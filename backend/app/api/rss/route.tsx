import { NextResponse } from 'next/server';
import { Post } from '@/app/lib/sequelize';
import { logRequest } from '@/app/lib/requestLogger';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('assessment3-backend');

const BASE_URL =
  process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  return tracer.startActiveSpan('GET /api/rss', async (span) => {
    const startTime = Date.now();

    try {
      const posts = await Post.findAll({
        where: { status: 'published' },
        order: [['createdAt', 'DESC']],
      });

      span.setAttribute('rss.post_count', posts.length);

      const items = posts
        .map(
          (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.summary)}</description>
      <author>${escapeXml(post.author)}</author>
      <link>${escapeXml(post.link || '')}</link>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <guid>${post.id}</guid>
    </item>`
        )
        .join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RSS Server Feed</title>
    <link>${BASE_URL}</link>
    <description>RSS feed for the LMS project</description>
    <atom:link href="${BASE_URL}/api/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

      const responseTimeMs = Date.now() - startTime;

      await logRequest({
        endpoint: '/api/rss',
        statusCode: 200,
        responseTimeMs,
      });

      span.setAttribute('http.response_time_ms', responseTimeMs);

      return new NextResponse(xml, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/rss+xml; charset=utf-8',
        },
      });
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

      await logRequest({
        endpoint: '/api/rss',
        statusCode: 500,
        responseTimeMs: Date.now() - startTime,
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