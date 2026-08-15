import { NextResponse } from 'next/server';
import { Post } from '@/app/lib/sequelize';
import { logRequest } from '@/app/lib/requestLogger';

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
  const startTime = Date.now();

  try {
    const posts = await Post.findAll({
      where: { status: 'published' },
      order: [['createdAt', 'DESC']],
    });

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
    <link>http://3.218.151.177</link>
    <description>RSS feed for the LMS project</description>
    <atom:link href="http://3.218.151.177:4080/api/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

    await logRequest({
      endpoint: '/api/rss',
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
    });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error(error);

    await logRequest({
      endpoint: '/api/rss',
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
    });

    return new NextResponse('Server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
}