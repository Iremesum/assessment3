import { NextResponse } from 'next/server';
import { RequestLog } from '@/app/lib/sequelize';

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
  try {
    const requests = await RequestLog.findAll({
      order: [['requestedAt', 'DESC']],
      limit: 20,
    });

    return NextResponse.json(requests, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return new NextResponse('Server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
}
