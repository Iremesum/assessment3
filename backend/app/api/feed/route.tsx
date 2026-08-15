import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/app/lib/sequelize';
import { incrementRequestCount } from '@/app/lib/sequelize';

// Standard CORS headers - allows the frontend (running on a different port/domain)
// to make requests to this API without being blocked by the browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS – handles CORS "preflight" requests.
// Browsers automatically send this before certain requests to check permissions.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET – Returns all posts, or a single post if an ?id= query is provided
export async function GET(request: NextRequest) {
  try {
    incrementRequestCount(); // Tracks usage for the /api/count endpoint

    const id = request.nextUrl.searchParams.get('id');

    // If a specific id was requested, look up just that one post
    if (id) {
      const post = await Post.findByPk(parseInt(id));
      if (!post) {
        return new NextResponse('Post not found', { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(post, { headers: corsHeaders });
    }

    // Otherwise, return every post, newest first
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json(posts, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Server error', { status: 500, headers: corsHeaders });
  }
}

// POST – Creates a new post from the request body
export async function POST(request: NextRequest) {
  try {
    const { title, author, content, summary, imageUrl, link, status } = await request.json();

    // Basic validation - reject the request if required fields are missing
    if (!title || !author || !content || !summary) {
      return new NextResponse('Missing required fields', { status: 400, headers: corsHeaders });
    }

    // Sequelize automatically generates the id, createdAt, and updatedAt fields
    const newPost = await Post.create({
      title,
      author,
      content,
      summary,
      imageUrl: imageUrl || null, // optional field - null if not provided
      link: link || null, // optional field - null if not provided
      status: status || 'published', // defaults to "published" if not specified
    });
    return NextResponse.json(newPost, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request body', { status: 400, headers: corsHeaders });
  }
}

// PATCH – Updates specific fields of an existing post (identified by ?id=)
export async function PATCH(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return new NextResponse('Missing id', { status: 400, headers: corsHeaders });
    }

    // Find the post to update
    const post = await Post.findByPk(parseInt(id));
    if (!post) {
      return new NextResponse('Post not found', { status: 404, headers: corsHeaders });
    }

    // Only update fields that were actually included in the request body,
    // leaving anything not mentioned unchanged
    const { title, author, content, summary, imageUrl, link, status } = await request.json();
    if (title !== undefined) post.title = title;
    if (author !== undefined) post.author = author;
    if (content !== undefined) post.content = content;
    if (summary !== undefined) post.summary = summary;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (link !== undefined) post.link = link;
    if (status !== undefined) post.status = status;

    await post.save(); // writes the changes back to the database
    return NextResponse.json(post, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}

// DELETE – Removes a post entirely (identified by ?id=)
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return new NextResponse('Missing id', { status: 400, headers: corsHeaders });
    }

    const post = await Post.findByPk(parseInt(id));
    if (!post) {
      return new NextResponse('Post not found', { status: 404, headers: corsHeaders });
    }

    await post.destroy(); // permanently removes the row from the database
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new NextResponse('Invalid request', { status: 400, headers: corsHeaders });
  }
}