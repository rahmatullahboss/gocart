export const runtime = 'nodejs'

import prisma from '@/lib/prisma'

function badRequest(message) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    headers: { 'Content-Type': 'application/json' },
    status: 400,
  })
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return badRequest('USER_ID_REQUIRED')

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        orderItems: { include: { product: true } },
      },
    })
    return new Response(JSON.stringify({ ok: true, data: orders }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('GET /api/orders failed:', err)
    return new Response(JSON.stringify({ ok: false, error: 'FAILED_TO_FETCH_ORDERS' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      userId,
      items, // [{ productId, quantity }]
      address, // { name,email,street,city,state,zip,country,phone }
      paymentMethod = 'COD',
      isPaid = false,
      isCouponUsed = false,
      coupon = {},
    } = body || {}

    const effectiveUserId = userId || process.env.DEMO_USER_ID || 'user_demo_1'
    if (!Array.isArray(items) || items.length === 0) return badRequest('NO_ITEMS')
    if (!address || !address.name || !address.email || !address.street || !address.city || !address.state || !address.zip || !address.country || !address.phone) {
      return badRequest('INVALID_ADDRESS')
    }

    // Load products and validate single-store cart
    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    if (products.length !== items.length) return badRequest('INVALID_PRODUCT_IDS')

    const storeIds = new Set(products.map((p) => p.storeId))
    if (storeIds.size !== 1) return badRequest('MULTI_STORE_CART_NOT_SUPPORTED')
    const [storeId] = [...storeIds]

    // Compute total from DB prices
    const priceById = new Map(products.map((p) => [p.id, p.price]))
    const total = items.reduce((sum, i) => sum + (priceById.get(i.productId) || 0) * i.quantity, 0)

    // Create address + order + orderItems in a transaction
    const created = await prisma.$transaction(async (tx) => {
      const createdAddress = await tx.address.create({
        data: { userId: effectiveUserId, ...address },
      })

      const order = await tx.order.create({
        data: {
          total,
          userId: effectiveUserId,
          storeId,
          addressId: createdAddress.id,
          isPaid,
          paymentMethod,
          isCouponUsed,
          coupon,
          orderItems: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: priceById.get(i.productId) || 0,
            })),
          },
        },
        include: {
          address: true,
          orderItems: { include: { product: true } },
        },
      })
      return order
    })

    return new Response(JSON.stringify({ ok: true, data: created }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (err) {
    console.error('POST /api/orders failed:', err)
    return new Response(JSON.stringify({ ok: false, error: 'FAILED_TO_CREATE_ORDER' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

