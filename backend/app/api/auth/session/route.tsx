import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  try {
    const user = jwt.verify(token, jwtSecret);

    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }
}