import { NextResponse } from 'next/server';
import { sequelize } from '@/app/lib/sequelize';

export async function GET() {
  const startTime = Date.now();

  try {
    await sequelize.authenticate();

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        responseTimeMs: Date.now() - startTime,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        responseTimeMs: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}