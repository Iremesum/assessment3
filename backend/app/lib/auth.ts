import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type AuthUser = {
  email: string;
  role: string;
};

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "object" &&
      decoded.email &&
      decoded.role
    ) {
      return {
        email: String(decoded.email),
        role: String(decoded.role),
      };
    }

    return null;
  } catch {
    return null;
  }
}