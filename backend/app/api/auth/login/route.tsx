import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:3001';

const corsHeaders = {
  'Access-Control-Allow-Origin': FRONTEND_URL,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !passwordHash || !jwtSecret) {
      return new NextResponse('Authentication is not configured', {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (email !== adminEmail) {
      return new NextResponse('Invalid email or password', {
        status: 401,
        headers: corsHeaders,
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (!passwordMatches) {
      return new NextResponse('Invalid email or password', {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = jwt.sign(
      {
        email,
        role: 'admin',
      },
      jwtSecret,
      {
        expiresIn: '1h',
      }
    );

    const cookieStore = await cookies();

    cookieStore.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60,
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        email,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Login failed:', error);

    return new NextResponse('Login failed', {
      status: 500,
      headers: corsHeaders,
    });
  }
}