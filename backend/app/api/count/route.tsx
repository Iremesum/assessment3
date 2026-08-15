import { NextResponse } from 'next/server';
import { requestCount } from '@/app/lib/sequelize';

export async function GET() {
  return NextResponse.json({ requestCount }, { status: 200 });
}