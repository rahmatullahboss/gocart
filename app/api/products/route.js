// Runtime must be Node.js for Prisma
export const runtime = 'nodejs'

import prisma from '@/lib/prisma'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is missing in environment')
      return new Response(
        JSON.stringify({ ok: false, error: 'DB_URL_MISSING' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rating: { include: { user: true } },
        store: { select: { id: true, name: true, username: true, logo: true } },
      },
    })
    return new Response(JSON.stringify({ ok: true, data: products }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('GET /api/products failed:', err)
    return new Response(
      JSON.stringify({ ok: false, error: 'FAILED_TO_FETCH_PRODUCTS' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

// Optional minimal create endpoint behind an admin key to help initial seeding
export async function POST(request) {
  try {
    const adminKey = process.env.ADMIN_API_KEY
    const headerKey = request.headers.get('x-admin-key') || request.headers.get('X-Admin-Key')
    if (!adminKey || headerKey !== adminKey) {
      return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const body = await request.json()
    const { name, description, mrp, price, images = [], category, storeId } = body || {}
    if (!name || !description || typeof mrp !== 'number' || typeof price !== 'number' || !category || !storeId) {
      return new Response(JSON.stringify({ ok: false, error: 'INVALID_INPUT' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const created = await prisma.product.create({
      data: { name, description, mrp, price, images, category, storeId },
    })
    return new Response(JSON.stringify({ ok: true, data: created }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (err) {
    console.error('POST /api/products failed:', err)
    return new Response(
      JSON.stringify({ ok: false, error: 'FAILED_TO_CREATE_PRODUCT' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}
