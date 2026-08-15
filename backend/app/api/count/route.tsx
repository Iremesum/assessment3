import { NextResponse } from 'next/server';
import { Op, fn, col } from 'sequelize';
import { RequestLog } from '@/app/lib/sequelize';

export async function GET() {
  try {
    const totalRequests = await RequestLog.count();

    const failedRequests = await RequestLog.count({
      where: {
        statusCode: {
          [Op.gte]: 400,
        },
      },
    });

    const uniqueClients = await RequestLog.count({
      distinct: true,
      col: 'clientId',
      where: {
        clientId: {
          [Op.ne]: null,
        },
      },
    });

    const averageResponse = await RequestLog.findOne({
      attributes: [[fn('AVG', col('responseTimeMs')), 'averageResponseTimeMs']],
      raw: true,
    });

    return NextResponse.json({
      totalRequests,
      failedRequests,
      uniqueClients,
      averageResponseTimeMs: Number(
        averageResponse?.averageResponseTimeMs ?? 0
      ),
    });
  } catch (error) {
    console.error(error);

    return new NextResponse('Server error', {
      status: 500,
    });
  }
}