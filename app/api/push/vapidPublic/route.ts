import { NextResponse } from 'next/server';

// Return the VAPID public key (set via env `VAPID_PUBLIC_KEY`).
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  return NextResponse.json({ publicKey });
}
