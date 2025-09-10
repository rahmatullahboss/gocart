/* eslint-disable no-console */
// Use CommonJS to ensure Node can run this without ESM config
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // If there are already products, assume seeded
  const existing = await prisma.product.count()
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} products already present.`)
    return
  }

  // Upsert demo user
  const demoUser = await prisma.user.upsert({
    where: { id: 'user_demo_1' },
    update: {},
    create: {
      id: 'user_demo_1',
      name: 'Demo User',
      email: 'demo@example.com',
      image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe',
      cart: {},
    },
  })

  // Upsert demo store linked to user
  const demoStore = await prisma.store.upsert({
    where: { username: 'demostore' },
    update: {},
    create: {
      userId: demoUser.id,
      name: 'Demo Store',
      description:
        'A sample vendor store with electronics to showcase GoCart features.',
      username: 'demostore',
      address: '123 Demo Street, Test City, US',
      status: 'approved',
      isActive: true,
      logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
      email: 'store@example.com',
      contact: '+1 555-0100',
    },
  })

  const productData = [
    {
      name: 'Wireless Headphones',
      description:
        'Comfortable over-ear wireless headphones with noise cancellation and 30h battery life.',
      mrp: 199,
      price: 149,
      images: [
        'https://images.unsplash.com/photo-1518443895914-44e9a5b69a5b',
        'https://images.unsplash.com/photo-1518441902110-7f7b9584f38a',
      ],
      category: 'Headphones',
    },
    {
      name: 'Smart Watch',
      description:
        'Track health metrics, notifications, and workouts with this sleek smartwatch.',
      mrp: 229,
      price: 179,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',
      ],
      category: 'Watch',
    },
    {
      name: 'Bluetooth Speaker',
      description:
        'Portable speaker with deep bass, water resistance, and 12h playtime.',
      mrp: 149,
      price: 109,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        'https://images.unsplash.com/photo-1519677100203-a0e668c92439',
      ],
      category: 'Speakers',
    },
    {
      name: 'Gaming Mouse',
      description:
        'Ergonomic gaming mouse with adjustable DPI and RGB lighting.',
      mrp: 79,
      price: 49,
      images: [
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
        'https://images.unsplash.com/photo-1555617117-08fda8a5d2a6',
      ],
      category: 'Mouse',
    },
    {
      name: 'True Wireless Earbuds',
      description:
        'Compact earbuds with clear sound, ENC mics and fast charging case.',
      mrp: 129,
      price: 89,
      images: [
        'https://images.unsplash.com/photo-1585386959984-a4155223168f',
        'https://images.unsplash.com/photo-1580894741226-8bb0b1b35a44',
      ],
      category: 'Earbuds',
    },
  ]

  // Create products and a rating for each so UI calculations are safe
  for (let i = 0; i < productData.length; i++) {
    const p = await prisma.product.create({
      data: {
        ...productData[i],
        storeId: demoStore.id,
      },
    })

    await prisma.rating.create({
      data: {
        rating: 5 - (i % 2), // 5,4,5,4,5
        review: 'Great product seeded for demo purposes.',
        userId: demoUser.id,
        productId: p.id,
        orderId: `seed_order_${i + 1}`,
      },
    })
  }

  console.log('Seed completed: demo user, store and products created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
