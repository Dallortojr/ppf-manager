export const runtime = 'nodejs'

export async function POST(req) {
try {
const body = await req.json()
const { imageBase64, mimeType } = body || {}

if (!imageBase64) {
return Response.json({ error: 'No image received' }, { status: 400 })
}

return Response.json({
success: true,
data: {
contactName: '',
vehicle: '',
package: '',
stockNumber: '',
date: '',
notes: `Image received. Mime type: ${mimeType || 'unknown'}`
}
})
} catch (err) {
console.error('Extract route error:', err)
return Response.json({ error: 'Upload failed' }, { status: 500 })
}
}
