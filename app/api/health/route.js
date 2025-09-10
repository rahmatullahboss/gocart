export const runtime = 'nodejs'

export async function GET() {
  return new Response(JSON.stringify({ ok: true, status: 'healthy' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
}

