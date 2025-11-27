import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@/lib/generated/prisma/client';
import { Prisma } from '@/lib/generated/prisma/browser';

// Helper to map next status
const NEXT_STATUS: Record<string, string | null> = {
  Pending_Pickup: 'In_Transit_to_Shop',
  In_Transit_to_Shop: 'Arrived_at_Shop_Queuing',
  Arrived_at_Shop_Queuing: 'Washing',
  Washing: 'Washing_Complete_Start_Drying',
  Washing_Complete_Start_Drying: 'Drying_Complete_Start_Packing',
  Drying_Complete_Start_Packing: 'Out_for_Delivery',
  Out_for_Delivery: 'Completed',
  Completed: null,
  Cancelled: null,
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const providerId = url.searchParams.get('providerId');
    const shopId = url.searchParams.get('shopId') || providerId;

    const where: Prisma.OrderWhereInput = {};
    if (userId) where.userId = userId;
    if (shopId) where.shopId = shopId;

    const orders = await prisma.order.findMany({ where, include: { user: true, shop: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/orders error', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, providerId, shopId: bodyShopId, providerName, details } = body;
    let { weightKg, pricePerKg, pickupAddress, status } = body;

    const shopId = bodyShopId || providerId;

    if (!userId || !shopId) {
      return NextResponse.json({ error: 'userId and shopId required' }, { status: 400 });
    }

    // Validate that the shop exists
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json({ error: `Shop not found for given shopId: ${shopId}` }, { status: 400 });
    }

    // Coerce numeric fields and apply defaults consistent with Prisma schema
    weightKg = Number.isNaN(Number(weightKg)) ? 5 : Math.max(1, Math.floor(Number(weightKg)));
    pricePerKg = Number.isNaN(Number(pricePerKg)) ? shop.pricePerKg ?? 5.0 : Number(pricePerKg);
    pickupAddress = pickupAddress || null;
    status = status || 'Pending_Pickup';

    const created = await prisma.order.create({
      data: {
        user: { connect: { id: userId } },
        shop: { connect: { id: shopId } },
        providerName: providerName || shop.name,
        details: details || null,
        weightKg,
        pricePerKg,
        pickupAddress,
        status,
      },
      include: { user: true, shop: true },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('POST /api/orders error', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, action, rating, ratingComment } = body;

    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Advance status
    if (action === 'advance') {
      const next = NEXT_STATUS[order.status];
      if (!next) return NextResponse.json({ error: 'No next status' }, { status: 400 });
      const updated = await prisma.order.update({ where: { id: orderId }, data: { status: next as OrderStatus } });
      return NextResponse.json(updated);
    }

    // Submit rating
    if (action === 'rate') {
      if (typeof rating !== 'number') return NextResponse.json({ error: 'rating numeric required' }, { status: 400 });
      const updated = await prisma.order.update({ where: { id: orderId }, data: { rating, ratingComment: ratingComment || '' } });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/orders error', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
