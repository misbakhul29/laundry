import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST /api/users  -> create or upsert a user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, role } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { id },
      update: { role: role || 'USER' },
      create: { id, role: role || 'USER' }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('POST /api/users error', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
