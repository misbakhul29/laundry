import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;
    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: "Missing refreshToken" }, { status: 400 });
    }

    const secret = process.env.NEXT_AUTH_SECRET;
    if (!secret) {
      console.error("Missing NEXT_AUTH_SECRET");
      return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
    }

    // verify refresh token
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, secret) as any;
    } catch (err) {
      return NextResponse.json({ ok: false, error: "Invalid refresh token" }, { status: 401 });
    }

    // find login session by refresh token
    const dbSession = await prisma.loginSession.findFirst({ where: { refreshToken } });
    if (!dbSession) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    // Optionally, check expiresAt on dbSession for refresh validity
    // Create new tokens and rotate
    const newPayload = { email: payload.email, userId: payload.userId, ssoToken: payload.ssoToken };
    const newAccessToken = jwt.sign(newPayload, secret, { expiresIn: "30d" });
    const newRefreshToken = jwt.sign(newPayload, secret, { expiresIn: "60d" });

    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.loginSession.update({
      where: { id: dbSession.id },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      },
    });

    // Create a new NextAuth-style JWT to store in the session cookie so NextAuth
    // session callback will read the updated accessToken from the token.
    const tokenPayload = {
      user: { id: payload.userId, email: payload.email },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } as any;

    const jwtSecret = process.env.NEXT_AUTH_SECRET || process.env.NEXT_AUTH_SECRET;
    const tokenJwt = jwt.sign(tokenPayload, jwtSecret as string, { expiresIn: '30d' });

    const res = NextResponse.json({ ok: true, accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt: newExpiresAt.toISOString() });

    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: 'lax' as const,
      secure,
      expires: newExpiresAt,
    };

    // Set both cookie name variants that NextAuth may use
    res.cookies.set('next-auth.session-token', tokenJwt, cookieOptions);
    res.cookies.set('__Secure-next-auth.session-token', tokenJwt, cookieOptions);

    return res;
  } catch (error) {
    console.error("Error in refresh route", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
