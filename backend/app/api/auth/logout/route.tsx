import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete('auth_token');

  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}