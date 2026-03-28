import { getInstallById, updateInstall, deleteInstall } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req, { params }) {
  try {
    const install = getInstallById(params.id)
    if (!install) return Response.json({ error: 'Install not found.' }, { status: 404 })
    return Response.json({ install })
  } catch (err) {
    console.error('[GET /api/installs/:id]', err)
    return Response.json({ error: 'Failed to fetch install.' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const install = updateInstall(params.id, body)
    if (!install) return Response.json({ error: 'Install not found.' }, { status: 404 })
    return Response.json({ install })
  } catch (err) {
    console.error('[PATCH /api/installs/:id]', err)
    return Response.json({ error: 'Failed to update install.' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const ok = deleteInstall(params.id)
    if (!ok) return Response.json({ error: 'Install not found.' }, { status: 404 })
    return Response.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/installs/:id]', err)
    return Response.json({ error: 'Failed to delete install.' }, { status: 500 })
  }
}
