import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const shops = await prisma.shop.findMany({});
    return NextResponse.json(shops);
  } catch (error) {
    console.error('GET /api/shops error', error);
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerId, name, address, description, pricePerKg, location } = body;

    if (!ownerId || !name || !address) {
      return NextResponse.json({ error: 'ownerId, name and address required' }, { status: 400 });
    }

    // Ensure owner user exists (avoid FK violation). If user doesn't exist, create as PROVIDER.
    try {
      const existing = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!existing) {
        const placeholderUsername = `provider_${ownerId.slice(0, 8)}`;
        const placeholderEmail = `${ownerId}@no-reply.local`;

        await prisma.user.create({
          data: {
            id: ownerId,
            role: 'PROVIDER',
            username: placeholderUsername,
            email: placeholderEmail,
            // It's recommended to set a proper password in production; use an empty string
            // or a random value here to satisfy the schema. Adjust as needed.
            password: '',
          },
        });
      }
    } catch (e) {
      console.warn('Could not ensure owner user exists', ownerId, e);
    }

    const upserted = await prisma.shop.upsert({
      where: { ownerId },
      update: {
        name,
        address,
        description,
        pricePerKg: Number(pricePerKg) || 5.0,
        location: location || undefined,
      },
      create: {
        ownerId,
        name,
        address,
        description,
        pricePerKg: Number(pricePerKg) || 5.0,
        location: location || undefined,
      },
    });

    return NextResponse.json(upserted);
  } catch (error) {
    console.error('POST /api/shops error', error, (error as Error).stack);
    return NextResponse.json({ error: 'Failed to save shop' }, { status: 500 });
  }
}
