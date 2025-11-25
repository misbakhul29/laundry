const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data (use with caution)
  await prisma.order.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  // Create a regular user
  const user = await prisma.user.create({
    data: {
      // id will be generated
      role: 'USER'
    }
  });

  // Create a provider user (shop owner)
  const provider = await prisma.user.create({
    data: {
      role: 'PROVIDER'
    }
  });

  // Create a shop owned by provider
  const shop = await prisma.shop.create({
    data: {
      ownerId: provider.id,
      name: 'Demo Cleaners',
      address: '123 Demo Street',
      description: 'Fast and eco-friendly laundry service',
      pricePerKg: 4.5,
      location: { name: 'Demo Location', distance: '0.9 mi' }
    }
  });

  // Create a sample order placed by user to the provider's shop
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      providerId: shop.id,
      providerName: shop.name,
      details: 'Wash & Fold (5kg)',
      weightKg: 5,
      pricePerKg: shop.pricePerKg,
      status: 'Pending_Pickup',
      pickupAddress: 'User Home (Demo)'
    }
  });

  console.log('Seed complete:');
  console.log({ userId: user.id, providerId: provider.id, shopId: shop.id, orderId: order.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
