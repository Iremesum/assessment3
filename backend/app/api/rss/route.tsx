import { NextResponse } from 'next/server';
import { Post } from '@/app/lib/sequelize';

// Escapes special XML characters so content doesn't break the XML structure
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await Post.findAll({
    where: { status: 'published' },
    order: [['createdAt', 'DESC']],
  });

  const items = posts
    .map((post) => {
      const p = post.toJSON() as any;
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(p.link || 'http://3.218.151.177')}</link>
      <description>${escapeXml(p.summary)}</description>
      <author>noreply@rss-server.com (${escapeXml(p.author)})</author>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <guid isPermaLink="false">${p.id}</guid>
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RSS Server Feed</title>
    <link>http://3.218.151.177</link>
    <description>RSS feed for the LMS project</description>
    <atom:link href="http://3.218.151.177:4080/api/rss" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}