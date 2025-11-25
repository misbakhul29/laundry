import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // `context.params` may be a Promise in some Next.js dev environments.
    const rawParams = context?.params;
    const params = rawParams instanceof Promise ? await rawParams : rawParams;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, include: { shop: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/users/[id] error', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
